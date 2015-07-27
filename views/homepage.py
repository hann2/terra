from flask import render_template
from flask.blueprints import Blueprint

homepage_app = Blueprint('homepage', __name__)

@homepage_app.route('/')
def view():
    return render_template("index.html")
