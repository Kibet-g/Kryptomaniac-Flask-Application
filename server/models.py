from datetime import datetime
from config import db

# Table: Cryptocurrencies
class Cryptocurrency(db.Model):
    __tablename__ = 'cryptocurrencies'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    symbol = db.Column(db.String, nullable=False, unique=True)
    market_price = db.Column(db.Float, nullable=False, comment='Real-time price data')
    market_cap = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    watchlists = db.relationship('Watchlist', backref='cryptocurrency', lazy=True)
    price_histories = db.relationship('PriceHistory', backref='cryptocurrency', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "symbol": self.symbol,
            "market_price": self.market_price,
            "market_cap": self.market_cap,
            "created_at": self.created_at,
        }

# Table: Watchlists
class Watchlist(db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    alert_price = db.Column(db.Float, nullable=False, comment='User-submittable alert price for notifications')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "cryptocurrency_id": self.cryptocurrency_id,
            "alert_price": self.alert_price,
            "cryptocurrency": self.cryptocurrency.to_dict(),
            "created_at": self.created_at,
        }

# Table: Price History
class PriceHistory(db.Model):
    __tablename__ = 'price_history'

    id = db.Column(db.Integer, primary_key=True)
    cryptocurrency_id = db.Column(db.Integer, db.ForeignKey('cryptocurrencies.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, comment='Timestamp of the recorded price')

    def to_dict(self):
        return {
            "id": self.id,
            "cryptocurrency_id": self.cryptocurrency_id,
            "price": self.price,
            "recorded_at": self.recorded_at,
        }
