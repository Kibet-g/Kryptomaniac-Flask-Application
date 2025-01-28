from sqlalchemy.orm import validates
from config import db

class Cryptocurrency(db.Model):
    __tablename__ = 'cryptocurrencies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    symbol = db.Column(db.String(10), nullable=False, unique=True)
    market_price = db.Column(db.Numeric(20, 8), nullable=False)
    market_cap = db.Column(db.Numeric(20, 2))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    watchlists = db.relationship('Watchlist', back_populates='cryptocurrency', cascade='all, delete-orphan')
    price_history = db.relationship('PriceHistory', back_populates='cryptocurrency', cascade='all, delete-orphan')

    @validates('symbol')
    def validate_symbol(self, key, value):
        assert len(value) >= 3 and len(value) <= 10, "Symbol must be between 3 and 10 characters"
        assert value.isupper(), "Symbol must be in uppercase"
        return value

    @validates('market_price', 'market_cap')
    def validate_numeric_values(self, key, value):
        assert value >= 0, f"{key} must be a non-negative number"
        return value

    @validates('name')
    def validate_name(self, key, value):
        assert value.strip(), "Name cannot be empty or whitespace"
        return value

class Watchlist(db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    alert_price = db.Column(db.Numeric(20, 8), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    cryptocurrency = db.relationship('Cryptocurrency', back_populates='watchlists')

    @validates('alert_price')
    def validate_alert_price(self, key, value):
        assert value > 0, "Alert price must be greater than zero"
        return value

class PriceHistory(db.Model):
    __tablename__ = 'price_history'

    id = db.Column(db.Integer, primary_key=True)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    price = db.Column(db.Numeric(20, 8), nullable=False)
    recorded_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    # Relationships
    cryptocurrency = db.relationship('Cryptocurrency', back_populates='price_history')

    @validates('price')
    def validate_price(self, key, value):
        assert value > 0, "Price must be greater than zero"
        return value
