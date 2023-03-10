from flask import Flask
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'

# change app.config like this for mysql connection (change user, password)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:cartside@localhost/users'
# unlike with sqlite3, sites.db is not visible in app folder under instance etc.

db = SQLAlchemy(app)

# This apparently is not neccessary for mysql
#app.app_context().push()

from scraps import routes