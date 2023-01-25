from api.models import *
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
import marshmallow as ma


class StripeAccountSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StripeAccount
        include_relationships = True
        load_instance = False
    cards = ma.fields.Nested("StripeCardSchema", many=True, exclude=("account",))
    cardholders = ma.fields.Nested("StripeCardholderSchema", many=True, exclude=("account",))


class StripeCardSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StripeCard
        include_relationships = True
        load_instance = False


class StripeCardholderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StripeCardholder
        include_relationships = True
        load_instance = False
