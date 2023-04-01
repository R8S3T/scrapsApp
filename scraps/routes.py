import os
from dotenv import load_dotenv
import secrets
from PIL import Image
import json
from flask import Flask
from flask import render_template, url_for, flash, redirect, request, current_app, jsonify
from scraps import app, db, bcrypt
from scraps.forms import RegistrationForm, LoginForm, ProfileForm
from scraps.models import User, Item
from flask_login import login_user, current_user, logout_user, login_required
from json import JSONDecodeError


# HOME PAGE

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        # hashing turns password (or any other plaintext) into
        # a short, random looking string using encryption algorithm
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username=form.username.data, email=form.email.data, password= hashed_password)
        db.session.add(user)
        db.session.commit()
        # Redirects to home.html and creates success message
        flash('Your account has been created! You are now able to log in', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)


# LOGIN PAGE

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit(): 
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user)
            flash('You have been logged in!', 'success')
            return redirect(url_for('profile'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html', title='Login', form=form)
print("Update Login")


# SAVE PICTURE FUNCTION

def save_picture(form_picture, picture_path):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(picture_path, picture_fn)

    output_size = (125, 125)
    img = Image.open(form_picture)
    img.thumbnail(output_size)

    img.save(picture_path)

    # return the filename so that it can be stored in the database
    return picture_fn


# PROFILE PAGE

@app.route("/profile")
@login_required
def profile():
    form = ProfileForm()
    profile_picture = url_for('static', filename='profile_pics/' + current_user.profile_picture) if current_user.profile_picture else None
    items_for_trade = safe_json_loads(current_user.items_for_trade) if current_user.items_for_trade else []
    items_wanted = safe_json_loads(current_user.items_wanted) if current_user.items_wanted else []
    return render_template('profile.html', title='Profile', profile_picture=profile_picture,form=form, items_wanted=items_wanted, items_for_trade=items_for_trade)


# UPDATE PROFILE

@app.route("/update_profile", methods=['GET', 'POST'])
@login_required
def update_profile():
    form = ProfileForm()
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.email = form.email.data
        current_user.street = form.street.data
        current_user.postcode = form.postcode.data
        current_user.city = form.city.data
        current_user.country = form.country.data

        try:
            items_wanted_data = json.loads(form.items_wanted_hidden.data) if form.items_wanted_hidden.data else []
            items_for_trade_data = json.loads(form.items_for_trade_hidden.data) if form.items_for_trade_hidden.data else []

            items_wanted_data = [item.strip() for item in items_wanted_data]
            items_for_trade_data = [item.strip() for item in items_for_trade_data]

            current_user.items_wanted = json.dumps(items_wanted_data)
            current_user.items_for_trade = json.dumps(items_for_trade_data)
        except JSONDecodeError:
            flash("There was an error processing your items. Please try again.", "danger")
            return redirect(url_for("update_profile"))

        if form.profile_picture.data:
            picture_file = save_picture(form.profile_picture.data, current_app.config['PROFILE_PICS_FOLDER'])
            current_user.profile_picture = picture_file
        db.session.commit()
        flash('Your account has been updated!', 'success')
        return redirect(url_for('profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
        form.items_for_trade.data = safe_json_loads(current_user.items_for_trade)
        form.items_wanted.data = safe_json_loads(current_user.items_wanted)

    return render_template('update_profile.html', title='Update Profile', form=form)


# GET USER DATA
# Returns JSON object containing all user data

def safe_json_loads(s):
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        return []

@app.route('/api/users')
def get_users():
    users = User.query.all()
    user_list = []
    for user in users:
        user_data =({
            'id': user.id,
            'username': user.username,
            'street': user.street,
            'postcode': user.postcode,
            'city': user.city,
            'country': user.country,
            'items_wanted': safe_json_loads(user.items_wanted) if user.items_wanted and user.items_wanted.strip() else [],
            'items_for_trade': safe_json_loads(user.items_for_trade) if user.items_for_trade and user.items_for_trade.strip() else [],
            'lat': user.lat,
            'lng': user.lng
        })

        # append dict to user_list array for each user
        user_list.append(user_data)

    # after loop finishes jsonify converts user_list array
    # into JSON object, which is returned as response for API
    return jsonify(user_list)


# ABOUT PAGE

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', 'GOOGLE_MAPS_API_KEY_WAS_NOT_SET')

@app.route('/map')
def map():
    return render_template('map.html', api_key=GOOGLE_MAPS_API_KEY)


if __name__ == '__main__':
    app.run(debug=True)
    
