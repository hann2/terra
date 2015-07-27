from flask import render_template
from flask.blueprints import Blueprint

terrain_app = Blueprint('terrain', __name__)

@terrain_app.route('/')
def view():
    return render_template("terrain.html")
