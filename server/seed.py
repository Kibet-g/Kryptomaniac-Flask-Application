import requests
from decimal import Decimal
from app import app
from models import db, User, Cryptocurrency, UserCryptocurrency, PriceHistory, TrendingCryptocurrency

API_URL = "https://api.coingecko.com/api/v3/coins/markets"
CURRENCY = "usd"
API_KEY = "CG-dUzuLDSJt8VrHDxtbCsPnbjH"  # Replace with your actual API key

if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")
        db.drop_all()
        db.create_all()

        # Fetch real-time data from the CoinGecko API
        try:
            response = requests.get(
                API_URL,
                params={"vs_currency": CURRENCY},
                headers={"accept": "application/json", "x-cg-demo-api-key": API_KEY}
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            exit()

        # Seed Cryptocurrencies and PriceHistory
        cryptocurrencies = []
        for coin in data[:10]:  # Limit to the top 10 cryptocurrencies for this seed
            cryptocurrency = Cryptocurrency(
                name=coin['name'],
                symbol=coin['symbol'].upper(),
                market_price=Decimal(str(coin['current_price'])),
                market_cap=Decimal(str(coin.get('market_cap', 0)))
            )
            cryptocurrencies.append(cryptocurrency)
            db.session.add(cryptocurrency)

            # Add initial price history
            price_history = PriceHistory(
                cryptocurrency=cryptocurrency,
                price=Decimal(str(coin['current_price'])),
                recorded_at=db.func.now()
            )
            db.session.add(price_history)

        db.session.commit()

        # Seed Trending Cryptocurrencies
        for rank, crypto in enumerate(cryptocurrencies, start=1):
            trending_crypto = TrendingCryptocurrency(
                cryptocurrency=crypto,
                rank=rank
            )
            db.session.add(trending_crypto)
        
        db.session.commit()

        print("Seeding complete with real-time data!")
