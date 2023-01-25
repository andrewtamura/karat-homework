from api.models import *
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema


class StripeAccountSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StripeAccount
        include_relationships = True
        load_instance = True


class StripeCardSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StripeCard
        include_relationships = True
        load_instance = True


class StripeCardholderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StripeCardholder
        include_relationships = True
        load_instance = True