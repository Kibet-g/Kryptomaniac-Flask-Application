from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, create_access_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Cryptocurrency, User, UserCryptocurrency, PriceHistory, TrendingCryptocurrency

routes = Blueprint('routes', __name__)

# -------------------- User Authentication --------------------

# Register a new user
@routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password") or not data.get("username"):
        return jsonify({"error": "Missing fields"}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    # Hash the password
    hashed_password = generate_password_hash(data["password"])

    # Create new user
    new_user = User(username=data["username"], email=data["email"], password_hash=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT token upon registration
    access_token = create_access_token(identity=new_user.id)

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token
    }), 201

# Login user and return a JWT token
@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate JWT token
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "message": "Login successful",
        "access_token": access_token
    }), 200

# -------------------- Cryptocurrencies --------------------

# Get all cryptocurrencies
@routes.route('/cryptocurrencies', methods=['GET'])
@jwt_required()
def get_cryptocurrencies():
    cryptocurrencies = Cryptocurrency.query.all()
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'symbol': c.symbol,
            'market_price': str(c.market_price),
            'market_cap': str(c.market_cap),
            'market_cap_change_24h': str(c.market_cap_change_24h),  # Ensure string conversion for JSON compatibility
            'logo_url': c.logo_url
        }
        for c in cryptocurrencies
    ])

# Get a single cryptocurrency by ID
@routes.route('/cryptocurrencies/<int:crypto_id>', methods=['GET'])
@jwt_required()
def get_cryptocurrency(crypto_id):
    cryptocurrency = Cryptocurrency.query.get(crypto_id)
    if not cryptocurrency:
        return jsonify({'message': 'Cryptocurrency not found'}), 404
    return jsonify({
        'id': cryptocurrency.id,
        'name': cryptocurrency.name,
        'symbol': cryptocurrency.symbol,
        'market_price': str(cryptocurrency.market_price),
        'market_cap': str(cryptocurrency.market_cap),
        'market_cap_change_24h': str(cryptocurrency.market_cap_change_24h),  # Ensure it's a string
        'logo_url': cryptocurrency.logo_url
    })

# -------------------- Price History --------------------

# Get price history for a cryptocurrency
@routes.route('/price-history/<int:cryptocurrency_id>', methods=['GET'])
@jwt_required()
def get_price_history(cryptocurrency_id):
    history = PriceHistory.query.filter_by(cryptocurrency_id=cryptocurrency_id).all()
    return jsonify([
        {'id': h.id, 'price': str(h.price), 'recorded_at': h.recorded_at.isoformat()}  # Ensure datetime format
        for h in history
    ])

# -------------------- User Cryptocurrency Tracking --------------------

# Get user's tracked cryptocurrencies
@routes.route('/user-cryptocurrencies', methods=['GET'])
@jwt_required()
def get_user_cryptocurrencies():
    user_id = get_jwt_identity()
    user_cryptos = UserCryptocurrency.query.filter_by(user_id=user_id).all()
    return jsonify([
        {'id': uc.id, 'crypto_id': uc.cryptocurrency_id, 'alert_price': str(uc.alert_price)}
        for uc in user_cryptos
    ])

# Add cryptocurrency to user tracking list
@routes.route('/user-cryptocurrencies', methods=['POST'])
@jwt_required()
def add_user_cryptocurrency():
    user_id = get_jwt_identity()
    data = request.get_json()
    crypto_id = data.get('crypto_id')
    alert_price = data.get('alert_price')

    if not crypto_id or not alert_price:
        return jsonify({'error': 'Missing crypto_id or alert_price'}), 400

    user_crypto = UserCryptocurrency(user_id=user_id, cryptocurrency_id=crypto_id, alert_price=alert_price)
    db.session.add(user_crypto)
    db.session.commit()

    return jsonify({'message': 'Cryptocurrency added to user watchlist'}), 201

# -------------------- Trending Cryptocurrencies --------------------

# Get trending cryptocurrencies
@routes.route('/trending-cryptocurrencies', methods=['GET'])
@jwt_required()
def get_trending_cryptocurrencies():
    trending = TrendingCryptocurrency.query.order_by(TrendingCryptocurrency.rank.asc()).all()
    return jsonify([
        {'id': t.id, 'cryptocurrency_id': t.cryptocurrency_id, 'rank': t.rank}
        for t in trending
    ])
