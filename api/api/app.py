from flask import Flask, jsonify
from api.extensions import ma, db, open_api
from api.models import *
from api.blueprints import accounts
import stripe


def create_app(config_module):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_module)
    stripe.api_key = app.config["STRIPE_API_KEY"]
    db.init_app(app)
    ma.init_app(app)
    open_api.init_app(app)
    open_api.register_blueprint(accounts)
    with app.app_context():
        db.create_all()

    return app
