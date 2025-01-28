#!/usr/bin/env python3

import requests
from app import app
from models import db, Cryptocurrency, Watchlist, PriceHistory

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
            response = requests.get(API_URL, params={"vs_currency": CURRENCY}, headers={"accept": "application/json", "x-cg-demo-api-key": API_KEY})
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data: {e}")
            exit()

        # Seed Cryptocurrencies and PriceHistory
        cryptocurrencies = []
        price_histories = []
        for coin in data[:10]:  # Limit to the top 10 cryptocurrencies for this seed
            cryptocurrency = Cryptocurrency(
                name=coin['name'],
                symbol=coin['symbol'].upper(),
                market_price=coin['current_price'],
                market_cap=coin.get('market_cap', 0)
            )
            cryptocurrencies.append(cryptocurrency)
            price_history = PriceHistory(
                cryptocurrency=cryptocurrency,
                price=coin['current_price'],
                recorded_at=db.func.now()
            )
            price_histories.append(price_history)

        db.session.add_all(cryptocurrencies)
        db.session.add_all(price_histories)
        db.session.commit()

        # Seed Watchlists with random alert prices
        watchlists = []
        for crypto in cryptocurrencies:
            alert_price = crypto.market_price * 1.1  # Example: set alert price 10% higher than current price
            watchlist = Watchlist(
                cryptocurrency=crypto,
                alert_price=alert_price
            )
            watchlists.append(watchlist)

        db.session.add_all(watchlists)
        db.session.commit()

        print("Seeding complete with real-time data!")
