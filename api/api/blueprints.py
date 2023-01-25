from flask_smorest import Blueprint, abort
from flask.views import MethodView
from flask import current_app, request
from api.schemas import StripeAccountSchema, StripeCardholderSchema, StripeCardSchema
from api.models import StripeAccount, StripeCardholder, StripeCard
from api.extensions import db
import marshmallow as ma
import stripe
import json
import time


stripe_webhook = Blueprint(
    "stripe_webhook",
    __name__,
    url_prefix="/stripe/webhook",
    description="incoming Stripe webhook",
)


class StripeEventSchema(ma.Schema):
    data = ma.fields.Dict(keys=ma.fields.String(), values=ma.fields.Dict())


@stripe_webhook.route("/")
class StripeWebhook(MethodView):
    @stripe_webhook.arguments(StripeEventSchema(unknown=ma.INCLUDE))
    @stripe_webhook.response(200)
    def post(self, event_data):
        print(event_data)
        event = None
        try:
            event = stripe.Event.construct_from(event_data, stripe.api_key)
        except ValueError as e:
            # Invalid payload
            abort(400)
        if event.type == "account.created":
            new_account = StripeAccount(id=event.data.object.id, data=event.data.object)
            try:
                db.session.add(new_account)
                db.session.commit()
                print("account added")
            except sq.exc.SQLAlchemyError as e:
                # already exists
                pass
        elif event.type == "account.updated":
            res = (
                db.session.query(StripeAccount)
                .filter(StripeAccount.id == event.data.object.id)
                .update({"data": event.data.object})
            )
            if not res:
                # account exists in Stripe, but not in our DB.
                new_account = StripeAccount(
                    id=event.data.object.id, data=event.data.object
                )
                db.session.add(new_account)
            db.session.commit()
            print("account updated")
        else:
            print("Unhandled event type {}".format(event.type))


accounts = Blueprint(
    "accounts", __name__, url_prefix="/api/accounts", description="All your accounts"
)


@accounts.route("/")
class Accounts(MethodView):
    @accounts.response(200, StripeAccountSchema(many=True))
    def get(self):
        """Return the accounts"""
        return db.session.query(StripeAccount).all()

    @accounts.response(200, StripeAccountSchema)
    def post(self):
        """Create a new account"""
        new_account = stripe.Account.create(
            type="custom",
            capabilities={
                "transfers": {"requested": True},
                "card_payments": {"requested": True},
                "card_issuing": {"requested": True},
            },
        )
        stripe_account = StripeAccount(id=new_account.id, data=new_account)
        db.session.add(stripe_account)
        db.session.commit()
        return stripe_account


@accounts.route("/<account_id>/")
class Account(MethodView):
    @accounts.response(200, StripeAccountSchema(many=False))
    def get(self, account_id):
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")
        return account


class AccountLinkSchema(ma.Schema):
    object = ma.fields.String()
    created = ma.fields.Number()
    expires_at = ma.fields.Number()
    url = ma.fields.String()


class AccountCreateSchema(ma.Schema):
    refresh_url = ma.fields.String()
    return_url = ma.fields.String()


@accounts.route("/<account_id>/onboarding-link/")
class AccountOnboardingLink(MethodView):
    @accounts.response(200, AccountLinkSchema)
    @accounts.arguments(AccountCreateSchema, location="query")
    def get(self, data, account_id):
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")

        return stripe.AccountLink.create(
            account=account_id, type="account_onboarding", **data
        )


@accounts.route("/<account_id>/update-link/")
class AccountUpdateLink(MethodView):
    @accounts.response(200, AccountLinkSchema)
    @accounts.arguments(AccountCreateSchema, location="query")
    def get(self, data, account_id):
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")

        return stripe.AccountLink.create(
            account=account_id, type="account_update", **data
        )

class StripeAddressSchema(ma.Schema):
    line1 = ma.fields.String()
    city = ma.fields.String()
    state = ma.fields.String()
    country = ma.fields.String(load_default="US")
    postal_code = ma.fields.String()

class StripeBillingSchema(ma.Schema):
    address = ma.fields.Nested(StripeAddressSchema)

class StripeCardholderCreateSchema(ma.Schema):
    name = ma.fields.String()
    email = ma.fields.Email()
    phone_number = ma.fields.String()
    billing = ma.fields.Nested(StripeBillingSchema)


@accounts.route("/<account_id>/cardholders/")
class Cardholders(MethodView):
    @accounts.response(200, StripeCardholderSchema(many=True))
    def get(self, account_id):
        """Return the card holders associated with this account"""
        return (
            db.session.query(StripeCardholder)
            .join(StripeCardholder.account)
            .filter(StripeCardholder.account.has(StripeAccount.id == account_id))
            .all()
        )

    @accounts.response(200, StripeCardholderSchema)
    @accounts.arguments(StripeCardholderCreateSchema(partial=False))
    def post(self, data, account_id):
        """Create a new cardholder"""
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")
        new_cardholder = stripe.issuing.Cardholder.create(
            stripe_account=account_id, status="active", type="individual", **data
        )
        cardholder = StripeCardholder(id=new_cardholder.id, data=new_cardholder)
        cardholder.account = account
        db.session.add(cardholder)
        db.session.commit()
        return cardholder


class StripeCardCreateSchema(ma.Schema):
    cardholder = ma.fields.String(required=True)
    currency = ma.fields.String(load_default="USD")
    type = ma.fields.String(load_default="virtual")
    status = ma.fields.String(load_default="active")

@accounts.route("/<account_id>/cards/")
class Cards(MethodView):
    @accounts.response(200, StripeCardSchema(many=True))
    def get(self, account_id):
        """Return the cards associated with this account"""
        return (
            db.session.query(StripeCard)
            .join(StripeCard.account)
            .filter(StripeCard.account.has(StripeAccount.id == account_id))
            .all()
        )

    @accounts.response(200, StripeCardSchema)
    @accounts.arguments(StripeCardCreateSchema)
    def post(self, data, account_id):
        """Create a new card"""
        account = (
            db.session.query(StripeAccount)
            .options(db.joinedload(StripeAccount.cardholders))
            .filter(StripeAccount.cardholders.any(StripeCardholder.id==data.cardholder))
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")
        new_card = stripe.issuing.Card.create(
            stripe_account=account_id, **data
        )
        card = StripeCard(id=new_card.id, data=new_card)
        card.cardholder = db.session.query(StripeCardholder).get(data.cardholder)
        card.account = account
        db.session.add(card)
        db.session.commit()
        return card
