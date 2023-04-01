import os

# Define route directory of Flask app
basedir = os.path.abspath(os.path.dirname(__file__))

# Define path to profile pics folder
PROFILE_PICS_FOLDER= os.path.join(basedir, 'static', 'profile_pics')