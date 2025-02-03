# routes.py
from flask import Blueprint, jsonify, request, current_app, g
from functools import wraps
import jwt
import datetime

from models import db, Cryptocurrency, UserCryptocurrency, PriceHistory, TrendingCryptocurrency, User

routes = Blueprint("routes", __name__)

# Helper functions for JWT
def generate_token(user):
    payload = {
        "user_id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    # In PyJWT>=2.0, jwt.encode returns a string if no options are provided
    return token

def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# JWT required decorator
def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", None)
        if not auth:
            return jsonify({"error": "Authorization header missing"}), 401
        parts = auth.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            return jsonify({"error": "Invalid authorization header"}), 401
        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"error": "User not found"}), 401
        # Set user in Flask global for use in endpoints
        g.current_user = user
        return f(*args, **kwargs)
    return decorated

# -------------------- USER AUTHENTICATION --------------------

@routes.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing username, email, or password"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    user = User(username=username, email=email)
    user.set_password(password)  # Hash the password

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@routes.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user)
    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "token": token
    }), 200

# Since JWT is stateless, the logout endpoint simply instructs the client to remove the token.
@routes.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logout successful. Please remove the token from your client."}), 200

@routes.route("/check-session", methods=["GET"])
@jwt_required
def check_session():
    user = g.current_user
    return jsonify({"user": user.to_dict()}), 200

@routes.route("/me", methods=["GET"])
@jwt_required
def get_current_user():
    user = g.current_user
    # Check if the user has any favourite cryptocurrencies (watchlist)
    if not user.cryptocurrencies:
        return jsonify({"error": "No favourite cryptocurrencies found. Please add at least one to your watchlist."}), 403
    return jsonify(user.to_dict()), 200

# -------------------- CRYPTOCURRENCY ROUTES --------------------

@routes.route("/cryptocurrencies", methods=["GET"])
def get_cryptocurrencies():
    cryptocurrencies = Cryptocurrency.query.all()
    return jsonify([crypto.to_dict() for crypto in cryptocurrencies]), 200

@routes.route("/cryptocurrencies/<int:crypto_id>", methods=["GET"])
def get_cryptocurrency(crypto_id):
    cryptocurrency = Cryptocurrency.query.get(crypto_id)
    if not cryptocurrency:
        return jsonify({"message": "Cryptocurrency not found"}), 404
    return jsonify(cryptocurrency.to_dict()), 200

# -------------------- PRICE HISTORY --------------------

@routes.route("/price-history/<int:cryptocurrency_id>", methods=["GET"])
def get_price_history(cryptocurrency_id):
    history = PriceHistory.query.filter_by(cryptocurrency_id=cryptocurrency_id).all()
    return jsonify([
        {"id": h.id, "price": str(h.price), "recorded_at": h.recorded_at.isoformat()}
        for h in history
    ]), 200

# -------------------- USER CRYPTOCURRENCY TRACKING --------------------

# -------------------- USER CRYPTOCURRENCY TRACKING --------------------

@routes.route("/user-cryptocurrencies", methods=["GET"])
@jwt_required
def get_user_cryptocurrencies():
    user = g.current_user
    user_cryptos = UserCryptocurrency.query.filter_by(user_id=user.id).all()
    return jsonify([uc.to_dict() for uc in user_cryptos]), 200

@routes.route("/user-cryptocurrencies", methods=["POST"])
@jwt_required
def add_user_cryptocurrency():
    data = request.get_json()
    crypto_id = data.get("crypto_id")
    alert_price = data.get("alert_price")

    if not crypto_id or not alert_price:
        return jsonify({"error": "Missing crypto_id or alert_price"}), 400

    try:
        alert_price = float(alert_price)
    except ValueError:
        return jsonify({"error": "Alert price must be a valid number"}), 400

    user = g.current_user
    existing_entry = UserCryptocurrency.query.filter_by(
        user_id=user.id, cryptocurrency_id=crypto_id
    ).first()
    if existing_entry:
        return jsonify({"error": "Cryptocurrency already in watchlist"}), 409

    user_crypto = UserCryptocurrency(
        user_id=user.id,
        cryptocurrency_id=crypto_id,
        alert_price=alert_price
    )
    db.session.add(user_crypto)
    db.session.commit()

    return jsonify({"message": "Cryptocurrency added to user watchlist"}), 201

# NEW: Remove cryptocurrency from user's watchlist
@routes.route("/user-cryptocurrencies/<int:crypto_id>", methods=["DELETE"])
@jwt_required
def remove_user_cryptocurrency(crypto_id):
    user = g.current_user
    user_crypto = UserCryptocurrency.query.filter_by(
        user_id=user.id, cryptocurrency_id=crypto_id
    ).first()
    if not user_crypto:
        return jsonify({"error": "Cryptocurrency not found in your watchlist"}), 404

    db.session.delete(user_crypto)
    db.session.commit()

    return jsonify({"message": "Cryptocurrency removed from watchlist"}), 200


# -------------------- TRENDING CRYPTOCURRENCIES --------------------

@routes.route("/trending-cryptocurrencies", methods=["GET"])
@jwt_required
def get_trending_cryptocurrencies():
    trending = TrendingCryptocurrency.query.order_by(TrendingCryptocurrency.rank.asc()).all()
    return jsonify([
        {"id": t.id, "cryptocurrency_id": t.cryptocurrency_id, "rank": t.rank}
        for t in trending
    ]), 200

# -------------------- DEBUG SESSION --------------------

@routes.route("/debug-session", methods=["GET"])
def debug_session():
    # For debugging: if token is provided, decode and return user id.
    auth = request.headers.get("Authorization", None)
    if auth:
        parts = auth.split()
        if len(parts) == 2:
            payload = decode_token(parts[1])
            if payload:
                return jsonify({"authenticated": True, "user_id": payload.get("user_id")})
    return jsonify({"authenticated": False, "user_id": None})
