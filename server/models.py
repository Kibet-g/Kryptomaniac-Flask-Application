from config import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # Relationship with user cryptocurrencies
    cryptocurrencies = db.relationship('UserCryptocurrency', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username}>"

class Cryptocurrency(db.Model):
    __tablename__ = 'cryptocurrencies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    symbol = db.Column(db.String(10), unique=True, nullable=False)
    market_price = db.Column(db.Numeric(20, 8), nullable=False)
    market_cap = db.Column(db.Numeric(20, 2), nullable=True)
    logo_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    user_associations = db.relationship('UserCryptocurrency', back_populates='cryptocurrency', cascade='all, delete-orphan')
    price_history = db.relationship('PriceHistory', back_populates='cryptocurrency', cascade='all, delete-orphan')
    trending_entries = db.relationship('TrendingCryptocurrency', back_populates='cryptocurrency', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "symbol": self.symbol,
            "market_price": float(self.market_price),
            "market_cap": float(self.market_cap) if self.market_cap is not None else 0.00,
            "logo_url": self.logo_url
        }

class UserCryptocurrency(db.Model):
    __tablename__ = 'user_cryptocurrencies'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    alert_price = db.Column(db.Numeric(20, 8), nullable=False)

    # Relationships (declared only once)
    user = db.relationship('User', back_populates='cryptocurrencies')
    cryptocurrency = db.relationship('Cryptocurrency', back_populates='user_associations')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "cryptocurrency_id": self.cryptocurrency_id,
            "alert_price": float(self.alert_price)
        }

class PriceHistory(db.Model):
    __tablename__ = 'price_history'

    id = db.Column(db.Integer, primary_key=True)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    price = db.Column(db.Numeric(20, 8), nullable=False)
    recorded_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    # Relationship
    cryptocurrency = db.relationship('Cryptocurrency', back_populates='price_history')

class TrendingCryptocurrency(db.Model):
    __tablename__ = 'trending_cryptocurrencies'

    id = db.Column(db.Integer, primary_key=True)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    rank = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    # Relationship
    cryptocurrency = db.relationship('Cryptocurrency', back_populates='trending_entries')
