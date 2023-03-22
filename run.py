import os
from scraps import app, load_dotenv

if __name__ == '__main__':
    project_home = '/home/rebecca/MEGAsync/FrauenLoop/Intermediate Webdevelopment/scrapsProject' 
    load_dotenv(os.path.join(project_home, '.env')) 
    app.run(debug=True)







