# app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_restful import Api
from dotenv import load_dotenv
from config import db, create_app
from routes import routes

# Load environment variables
load_dotenv()

# Create the Flask application using the factory function
app = create_app()

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fallback_secret_key")
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  # Change to True in production with HTTPS

# Enable CORS with credentials support
CORS(app, supports_credentials=True)
api = Api(app)

# Register the blueprint for all routes
app.register_blueprint(routes)

@app.route("/")
def index():
    return "<h1>Kryptomaniac Cryptocurrency Tracking APP</h1>"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
