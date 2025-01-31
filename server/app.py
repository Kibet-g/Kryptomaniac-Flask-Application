import os
from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_login import LoginManager
from dotenv import load_dotenv
from config import db, create_app
from models import User
from routes import routes  # Import the Blueprint

# Load environment variables
load_dotenv()

# Initialize Flask app
app = create_app()
CORS(app, supports_credentials=True)  # Enable CORS with credentials
api = Api(app)

# Set secret key for session management
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback_secret_key")

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "routes.login"  # Adjusted for Blueprint

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))  # Ensure this correctly fetches users

# Register the Blueprint for routes
app.register_blueprint(routes)

@app.route("/")
def index():
    return "<h1>Kryptomaniac Cryptocurrency Tracking APP</h1>"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
