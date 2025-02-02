from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, login_user, logout_user, current_user
from models import db, Cryptocurrency, UserCryptocurrency, PriceHistory, TrendingCryptocurrency, User

routes = Blueprint("routes", __name__)

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

    login_user(user, remember=True)  # Ensure session persists
    return jsonify({"message": "Login successful", "user": {"id": user.id, "email": user.email}}), 200

# -------------------- LOGOUT ENDPOINT --------------------
# Note: We remove @login_required so that even if the user is not authenticated,
# the endpoint clears any residual session cookie and returns a success response.
@routes.route("/logout", methods=["POST"])
def logout():
    if current_user.is_authenticated:
        logout_user()
    response = jsonify({"message": "Logged out successfully"})
    # Delete the session cookie from the client.
    cookie_name = current_app.config.get("SESSION_COOKIE_NAME", "session")
    response.delete_cookie(cookie_name)
    return response, 200

@routes.route("/check-session", methods=["GET"])
def check_session():
    if current_user.is_authenticated:
        return jsonify({"user": {"id": current_user.id, "email": current_user.email}})
    return jsonify({"error": "User not authenticated"}), 401

@routes.route("/me", methods=["GET"])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({"id": current_user.id, "email": current_user.email})
    return jsonify({"error": "User not authenticated"}), 401

# -------------------- CRYPTOCURRENCY ROUTES --------------------

@routes.route("/cryptocurrencies", methods=["GET"])
def get_cryptocurrencies():
    cryptocurrencies = Cryptocurrency.query.all()
    return jsonify([crypto.to_dict() for crypto in cryptocurrencies])

@routes.route("/cryptocurrencies/<int:crypto_id>", methods=["GET"])
def get_cryptocurrency(crypto_id):
    cryptocurrency = Cryptocurrency.query.get(crypto_id)
    if not cryptocurrency:
        return jsonify({"message": "Cryptocurrency not found"}), 404
    return jsonify(cryptocurrency.to_dict())

# -------------------- PRICE HISTORY --------------------

@routes.route("/price-history/<int:cryptocurrency_id>", methods=["GET"])
def get_price_history(cryptocurrency_id):
    history = PriceHistory.query.filter_by(cryptocurrency_id=cryptocurrency_id).all()
    return jsonify([
        {"id": h.id, "price": str(h.price), "recorded_at": h.recorded_at.isoformat()}
        for h in history
    ])

# -------------------- USER CRYPTOCURRENCY TRACKING --------------------

@routes.route("/user-cryptocurrencies", methods=["GET"])
@login_required
def get_user_cryptocurrencies():
    user_cryptos = UserCryptocurrency.query.filter_by(user_id=current_user.id).all()
    return jsonify([
        {"id": uc.id, "crypto_id": uc.cryptocurrency_id, "alert_price": str(uc.alert_price)}
        for uc in user_cryptos
    ])

@routes.route("/user-cryptocurrencies", methods=["POST"])
@login_required
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

    existing_entry = UserCryptocurrency.query.filter_by(
        user_id=current_user.id, cryptocurrency_id=crypto_id
    ).first()
    if existing_entry:
        return jsonify({"error": "Cryptocurrency already in watchlist"}), 409

    user_crypto = UserCryptocurrency(
        user_id=current_user.id,
        cryptocurrency_id=crypto_id,
        alert_price=alert_price
    )
    db.session.add(user_crypto)
    db.session.commit()

    return jsonify({"message": "Cryptocurrency added to user watchlist"}), 201

# -------------------- TRENDING CRYPTOCURRENCIES --------------------

@routes.route("/trending-cryptocurrencies", methods=["GET"])
@login_required
def get_trending_cryptocurrencies():
    trending = TrendingCryptocurrency.query.order_by(TrendingCryptocurrency.rank.asc()).all()
    return jsonify([
        {"id": t.id, "cryptocurrency_id": t.cryptocurrency_id, "rank": t.rank}
        for t in trending
    ])

# -------------------- DEBUG SESSION --------------------

@routes.route("/debug-session", methods=["GET"])
def debug_session():
    return jsonify({
        "authenticated": current_user.is_authenticated,
        "user_id": current_user.id if current_user.is_authenticated else None
    })
