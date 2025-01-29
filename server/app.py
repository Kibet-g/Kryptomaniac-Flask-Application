from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from config import db, create_app
from models import User, Cryptocurrency, UserCryptocurrency, PriceHistory, TrendingCryptocurrency

app = create_app()  # Use factory function
api = Api(app)

@app.route('/')
def index():
    return '<h1>Krptomaniac Cryptocurrency Tracking APP</h1>'

class CryptocurrenciesResource(Resource):
    def get(self):
        cryptocurrencies = Cryptocurrency.query.all()
        return jsonify([
            {'id': c.id, 'name': c.name, 'symbol': c.symbol, 'market_price': str(c.market_price)}
            for c in cryptocurrencies
        ])

api.add_resource(CryptocurrenciesResource, '/cryptocurrencies')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
