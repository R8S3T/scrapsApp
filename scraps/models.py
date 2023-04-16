from datetime import datetime
from scraps import db, login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class Scrap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    picture = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", back_populates="scraps")


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    scraps = db.relationship("Scrap", back_populates="user", lazy=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(200), nullable=False)
    profile_picture = db.Column(db.String(255))
    about_me = db.Column(db.String(300), nullable=True)
    street = db.Column(db.String(120), nullable=True)
    postcode = db.Column(db.String(20), nullable=True)
    city = db.Column(db.String(120), nullable=True)
    country = db.Column(db.String(120), nullable=True)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)
    items_for_trade = db.Column(db.String(1000))
    items_wanted = db.Column(db.String(1000))
    item_for_trade_description = db.Column(db.String(300), nullable=True)
    item_wanted_description = db.Column(db.String(300), nullable=True)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"
