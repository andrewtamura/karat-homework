from flask_smorest import Blueprint, abort
from flask.views import MethodView
from api.schemas import StripeAccountSchema, StripeCardholderSchema, StripeCardSchema
from api.models import StripeAccount, StripeCardholder, StripeCard
from api.extensions import db
import marshmallow as ma
import stripe


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
        event = None
        try:
            event = stripe.Event.construct_from(json.loads(event_data), stripe.api_key)
        except ValueError as e:
            # Invalid payload
            abort(400)
        if event.type == "account.created":
            new_account = StripeAccount(id=event.data.object.id, data=event.data.object)
            try:
                db.session.add(new_account)
                db.session.commit()
            except sq.exc.SQLAlchemyError as e:
                # already exists
                pass
        elif event.type == "account.updated":
            res = (
                db.session.query(StripeAccount)
                .filter(StripeAccount.id == event.data.object.id)
                .update({data: event.data.object})
            )
            if not res:
                # account exists in Stripe, but not in our DB.
                new_account = StripeAccount(
                    id=event.data.object.id, data=event.data.object
                )
                db.session.add(new_account)
            db.session.commit()

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

    @accounts.response(200, StripeAccountSchema(many=False))
    @accounts.arguments(StripeAccountSchema(many=False))
    def post(self, data):
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


class StripeBillingSchema(ma.Schema):
    address = ma.fields.Dict(keys=ma.fields.String(), values=ma.fields.String())


class StripeCardholderCreateSchema(ma.Schema):
    name = (ma.fields.String(),)
    email = (ma.fields.Email(),)
    phone_number = ma.fields.Number()
    type = ma.fields.String()
    billing = ma.fields.Nested(StripeBillingSchema)


@accounts.route("/<account_id>/cardholders/")
class Cardholders(MethodView):
    @accounts.response(200, StripeCardholderSchema(many=True))
    def get(self, account_id):
        """Return the card holders associated with this account"""
        return (
            db.session.query(StripeCardholder)
            .options(db.joinedload(StripeCardholder.account))
            .filter(StripeAccount.id == account_id)
            .all()
        )

    @accounts.response(200, StripeCardholderSchema(many=False))
    @accounts.arguments(StripeCardholderCreateSchema(many=False))
    def post(self, account_id, data):
        """Create a new cardholder"""
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")
        new_cardholder = stripe.issuing.Cardholder.create(
            stripe_account=account_id, status="active", **data
        )
        cardholder = StripeCardholder(id=new_cardholder.id, data=new_cardholder)
        cardholder.account = account
        db.session.add(cardholder)
        db.session.commit()
        return cardholder


class StripeCardCreateSchema(ma.Schema):
    cardholder = ma.fields.String()
    currency = ma.fields.String()


@accounts.route("/<account_id>/cards/")
class Cards(MethodView):
    @accounts.response(200, StripeCardSchema(many=True))
    def get(self, account_id):
        """Return the cards associated with this account"""
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")

        return (
            db.session.query(StripeCard)
            .options(db.joinedload(StripeCard.account))
            .filter(StripeAccount.id == account_id)
            .all()
        )

    @accounts.response(200, StripeCardSchema(many=False))
    @accounts.arguments(StripeCardCreateSchema(many=False))
    def post(self, account_id, data):
        """Create a new card"""
        account = (
            db.session.query(StripeAccount)
            .filter(StripeAccount.id == account_id)
            .first()
        )
        if not account:
            abort(404, "Account not found")
        new_card = stripe.issuing.Card.create(
            stripe_account=account_id, type="virtual" ** data
        )
        card = StripeCard(id=new_card.id, data=new_card)
        card.account = account
        db.session.add(card)
        db.session.commit()
        return card
