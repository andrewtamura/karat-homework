from api.extensions import db
from sqlalchemy.orm import relationship


class StripeObject(db.Model):
    __abstract__ = True
    id = db.Column(db.String, primary_key=True)
    data = db.Column(db.JSON, nullable=False)


class StripeEvent(StripeObject):
    pass


class StripeAccount(StripeObject):
    cards = relationship(
        "StripeCard", secondary="stripe_account_stripe_card", back_populates="account"
    )
    cardholders = relationship(
        "StripeCardholder",
        secondary="stripe_account_stripe_cardholder",
        back_populates="account",
    )


class StripeCard(StripeObject):
    account = relationship(
        "StripeAccount",
        secondary="stripe_account_stripe_card",
        back_populates="cards",
        uselist=False,
    )

    cardholder = relationship(
        "StripeCardholder",
        secondary="stripe_cardholder_stripe_card",
        back_populates="cards",
        uselist=False,
    )


class StripeCardholder(StripeObject):
    account = relationship(
        "StripeAccount",
        secondary="stripe_account_stripe_cardholder",
        back_populates="cardholders",
        uselist=False,
    )

    cards = relationship(
        "StripeCard",
        secondary="stripe_cardholder_stripe_card",
        back_populates="cardholder",
        uselist=True,
    )


stripe_account_stripe_card = db.Table(
    "stripe_account_stripe_card",
    db.Column("stripe_account_id", db.ForeignKey(StripeAccount.id), primary_key=True),
    db.Column("stripe_card_id", db.ForeignKey(StripeCard.id), primary_key=True),
)

stripe_account_stripe_cardholder = db.Table(
    "stripe_account_stripe_cardholder",
    db.Column("stripe_account_id", db.ForeignKey(StripeAccount.id), primary_key=True),
    db.Column(
        "stripe_cardholder_id", db.ForeignKey(StripeCardholder.id), primary_key=True
    ),
)

stripe_cardholder_stripe_card = db.Table(
    "stripe_cardholder_stripe_card",
    db.Column(
        "stripe_cardholder_id", db.ForeignKey(StripeCardholder.id), primary_key=True
    ),
    db.Column("stripe_card_id", db.ForeignKey(StripeCard.id), primary_key=True),
)
