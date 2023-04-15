import os

# Define route directory of Flask app
basedir = os.path.abspath(os.path.dirname(__file__))

# Define path to profile pics folder
PROFILE_PICS_FOLDER = os.path.join(basedir, 'static', 'profile_pics')
if not os.path.exists(PROFILE_PICS_FOLDER):
    os.makedirs(PROFILE_PICS_FOLDER)

# Define path to scrap pics folder
SCRAP_PICS_FOLDER = os.path.join(basedir, 'static', 'scrap_pics')
if not os.path.exists(SCRAP_PICS_FOLDER):
    os.makedirs(SCRAP_PICS_FOLDER)