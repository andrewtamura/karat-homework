from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from flask_smorest import Api

open_api = Api()
db = SQLAlchemy()
ma = Marshmallow()
