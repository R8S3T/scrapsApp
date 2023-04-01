import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from dotenv import load_dotenv

load_dotenv()

mysql_password = os.getenv('MYSQL_PASSWORD')


app = Flask(__name__)
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'
app.config.from_pyfile('config.py')


# Initialize LoginManager
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)

# Set login view, which is the function that handles logins
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# change app.config like this for mysql connection (change user, password)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://root:{mysql_password}@localhost/users'


# unlike with sqlite3, sites.db is not visible in app folder under instance etc.

db = SQLAlchemy(app)

# This apparently is not neccessary for mysql
#app.app_context().push()

from scraps import routes, models

with app.app_context():
    db.create_all()
