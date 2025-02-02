import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_restful import Api
from flask_login import LoginManager
from dotenv import load_dotenv
from config import db, create_app
from models import User
from routes import routes  # Import the Blueprint

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Create the Flask application using the factory function
app = create_app()

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback_secret_key")
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  # Change to True in production with HTTPS

# Enable CORS with credentials support
CORS(app, supports_credentials=True)
api = Api(app)

# Set up Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "routes.login"  # This is used for redirection

# Customize the unauthorized handler to return a JSON response
@login_manager.unauthorized_handler
def unauthorized_callback():
    return jsonify({"error": "User not authenticated"}), 401

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register the blueprint for all routes
app.register_blueprint(routes)

@app.route("/")
def index():
    return "<h1>Kryptomaniac Cryptocurrency Tracking APP</h1>"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
