import requests
from decimal import Decimal
from app import app
from models import db, Cryptocurrency, PriceHistory, TrendingCryptocurrency

API_URL = "https://api.coingecko.com/api/v3/coins/markets"
CURRENCY = "usd"
API_KEY = "CG-4oeYbHRkBCY8kTQ1YXbyV7GF"  # Replace with your actual API key

if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")
        db.drop_all()
        db.create_all()

        # Fetch real-time data from the CoinGecko API
        try:
            response = requests.get(
                API_URL,
                params={
                    "vs_currency": CURRENCY,
                    "order": "market_cap_desc",
                    "per_page": 100,  # Changed to 100 to seed 100 cryptocurrencies
                    "page": 1,
                    "price_change_percentage": "24h"
                },
                headers={"accept": "application/json", "x-cg-demo-api-key": API_KEY}
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            exit()

        # Seed Cryptocurrencies and PriceHistory
        cryptocurrencies = []
        for coin in data[:100]:  # Iterate over the 100 cryptocurrencies returned
            # Check if cryptocurrency with the same symbol already exists
            existing_crypto = Cryptocurrency.query.filter_by(symbol=coin['symbol'].upper()).first()
            if existing_crypto:
                print(f"Skipping {coin['name']} (symbol: {coin['symbol'].upper()}) - Already exists in the database.")
                continue

            cryptocurrency = Cryptocurrency(
                name=coin['name'],
                symbol=coin['symbol'].upper(),
                market_price=Decimal(str(coin['current_price'])),
                market_cap=Decimal(str(coin.get('market_cap', 0))),
                logo_url=coin.get('image'),
            )
            cryptocurrencies.append(cryptocurrency)
            db.session.add(cryptocurrency)

            # Add initial price history for each cryptocurrency
            price_history = PriceHistory(
                cryptocurrency=cryptocurrency,
                price=Decimal(str(coin['current_price'])),
                recorded_at=db.func.now()
            )
            db.session.add(price_history)

        db.session.commit()

        # Seed Trending Cryptocurrencies with a ranking based on the order from CoinGecko
        for rank, crypto in enumerate(cryptocurrencies, start=1):
            trending_crypto = TrendingCryptocurrency(
                cryptocurrency=crypto,
                rank=rank
            )
            db.session.add(trending_crypto)

        db.session.commit()

        print("Seeding complete with real-time data")
