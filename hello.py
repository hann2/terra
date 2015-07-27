import os

from flask import Flask
from views.homepage import homepage_app
from views.terrain import terrain_app
from util import Jsonifier

def create_app(debug=False):
    app = Flask(__name__)
    app.debug = debug
    app.secret_key = 'this is a secret'
    app.json_encoder = Jsonifier

    app.file_root = os.path.abspath(os.path.dirname(__file__))

    # app.before_request(before_request)
    # app.after_request(after_request)
    # app.context_processor(context_processor)

    # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

    # db.init_app(app)
    # with app.app_context():
    #     init_all()
    app.register_blueprint(homepage_app, url_prefix='/')
    app.register_blueprint(terrain_app, url_prefix='/terrain')

    return app

if __name__ == '__main__':
    # Run the development server.
    create_app(True).run(threaded=True, host='0.0.0.0')