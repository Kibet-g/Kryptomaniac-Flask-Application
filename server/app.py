import os
from flask import Flask, request, jsonify, session
from flask_restful import Api, Resource
from flask_login import (
    LoginManager, login_user, logout_user, login_required, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from config import db, create_app
from models import User, Cryptocurrency

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = create_app()
api = Api(app)

# Set SECRET_KEY securely
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback_secret_key')

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return '<h1>Kryptomaniac Cryptocurrency Tracking APP</h1>'

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing username, email, or password'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 409

    user = User(username=username, email=email)
    user.set_password(password)  # Use the method to hash the password

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):  # Call check_password() method
        return jsonify({'error': 'Invalid credentials'}), 401

    login_user(user)
    return jsonify({'message': 'Login successful'})

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

class CryptocurrenciesResource(Resource):
    @login_required
    def get(self):
        cryptocurrencies = Cryptocurrency.query.all()
        return jsonify([crypto.to_dict() for crypto in cryptocurrencies])

class CryptocurrencyResource(Resource):
    @login_required
    def get(self, crypto_id):
        cryptocurrency = Cryptocurrency.query.get(crypto_id)
        if not cryptocurrency:
            return jsonify({"message": "Cryptocurrency not found"}), 404
        return jsonify(cryptocurrency.to_dict())

# Register API endpoints
api.add_resource(CryptocurrenciesResource, '/cryptocurrencies')
api.add_resource(CryptocurrencyResource, '/cryptocurrencies/<int:crypto_id>')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
