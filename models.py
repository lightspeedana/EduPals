from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db

class User(UserMixin, db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(1000))
    has_pal = db.Column(db.Boolean, default=False)

class Pal(db.Model):
    __tablename__ = 'pals'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(1000), index=True)
    pal_type = db.Column(db.String(100))
    happiness = db.Column(db.Integer, default=3)
    points = db.Column(db.Integer, default=0)
    uid = db.Column(db.Integer)
    