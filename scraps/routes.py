import os
from dotenv import load_dotenv
import secrets
import requests
from PIL import Image
import json
from flask import Flask
from flask import render_template, url_for, flash, redirect, request, current_app, jsonify
from scraps import app, db, bcrypt
from scraps.forms import RegistrationForm, LoginForm, ProfileForm, ScrapForm
from scraps.models import User, Scrap
from flask_login import login_user, current_user, logout_user, login_required
from json import JSONDecodeError

# Save Profile Picture Function
def save_picture(form_picture, picture_path, output_size=(150, 150)):
    print("save pic function started")
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(picture_path, picture_fn)
    print("Picture filename:", picture_fn)
    print("Picture path:", picture_path)
    img = Image.open(form_picture)
    img.thumbnail(output_size)

    dir_path = os.path.dirname(picture_path)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    print("Picture path:", picture_path)

    img.save(picture_path)
    print("pic saved")
    return picture_fn

@app.route("/save_scrap_details", methods=['POST'])
@login_required
def save_scrap_details(): 
    scrap_id = request.form.get('scrap_id')
    scrap_id = request.form.get('scrap_id')
    description = request.form.get('description')
    image = request.files.get('image')

    if image:
        scrap_picture_file = save_picture(image, current_app.config['SCRAP_PICS_FOLDER'], (300, 300))
    else:
        scrap_picture_file = None

    scrap = Scrap.query.filter_by(user_id=current_user.id, scrap_id=scrap_id).first()
    if scrap:
        if scrap_picture_file:
            scrap.picture = scrap_picture_file
            scrap.description = description
        else: new_scrap = Scrap(scrap_id= scrap_id, pictures=scrap_picture_file, description=description, user=current_user)
        db.session.add(new_scrap)

    db.session.commit()

    return jsonify({"success": True})


# JSON FUNCTION
# Returns JSON object containing all user data
def safe_json_loads(s):
    if s is None:
        return []
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        return []

# LatLong FUNCTION
def get_lat_long(address, api_key):
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    print("API response:", data)
    if data["status"] == "OK":
        lat = data["results"][0]["geometry"]["location"]["lat"]
        lng = data["results"][0]["geometry"]["location"]["lng"]
        return lat, lng
    else:
        return None, None


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


# PROFILE PAGE (User only)
@app.route("/profile")
@login_required
def profile():
    form = ProfileForm()
    profile_picture = url_for('static', filename='profile_pics/' + current_user.profile_picture) if current_user.profile_picture else None
    print("Profile Picture URL:", profile_picture)
    items_for_trade = json.loads(current_user.items_for_trade) if current_user.items_for_trade else []
    items_wanted = json.loads(current_user.items_wanted) if current_user.items_wanted else []

    print("Items wanted:", items_wanted)
    print("Items for trade:", items_for_trade)
    all_items = ['Wood', 'Glass', 'Metal', 'Textiles', 'Plastics']

    return render_template('profile.html', title='Profile', profile_picture=profile_picture, form=form, items_wanted=items_wanted, items_for_trade=items_for_trade, all_items=all_items)


# UPDATE PROFILE
@app.route("/update_profile", methods=['GET', 'POST'])
@login_required
def update_profile():
    form = ProfileForm()
    scrap_form = ScrapForm()
    print("Checking form validation...")
    if form.validate_on_submit():
        address_updated = False

        if (form.street.data != current_user.street or
                form.postcode.data != current_user.postcode or
                form.city.data != current_user.city or
                form.country.data != current_user.country):
            address_updated = True

        current_user.username = form.username.data
        current_user.email = form.email.data
        current_user.about_me = form.about_me.data
        current_user.item_for_trade_description = form.item_for_trade_description.data
        current_user.item_wanted_description = form.item_wanted_description.data

        if address_updated:
            current_user.street = form.street.data
            current_user.postcode = form.postcode.data
            current_user.city = form.city.data
            current_user.country = form.country.data

            address = f"{form.street.data}, {form.postcode.data}, {form.city.data}, {form.country.data}"
            if address.strip() != ', , ,':  # Check if the address is not empty
                lat, lng = get_lat_long(address, GOOGLE_MAPS_API_KEY)
                if lat and lng:
                    current_user.lat = lat
                    current_user.lng = lng
                else:
                    print("Form validation errors:", form.errors)
                    flash("Unable to get the coordinate for the given address. Please check the address and try again.", "danger")
                    return redirect(url_for("update_profile"))
        try:
            items_wanted_data = request.form.get("items_wanted_hidden", "").split(",")
            items_for_trade_data = request.form.get("items_for_trade_hidden", "").split(",")

            items_wanted_data = [item.strip() for item in items_wanted_data if item.strip() not in ['Add Details', 'Delete Scrap', 'Add Scrap']]
            items_for_trade_data = [item.strip() for item in items_for_trade_data if item.strip() not in ['Add Details', 'Delete Scrap', 'Add Scrap']]

            current_user.items_wanted = json.dumps(items_wanted_data)
            current_user.items_for_trade = json.dumps(items_for_trade_data)
            db.session.commit()  # Make sure to commit the changes to the database
            print("Updated items_wanted:", current_user.items_wanted)
            print("Updated items_for_trade:", current_user.items_for_trade)
        except Exception as e:
            print(f"Error processing items: {e}")
            flash("There was an error processing your items. Please try again.", "danger")
            return redirect(url_for("update_profile"))

        if form.profile_picture.data:
            print("Processing profile picture...")
            picture_file = save_picture(form.profile_picture.data, current_app.config['PROFILE_PICS_FOLDER'], (125, 125))
            current_user.profile_picture = picture_file
            print("Profile picture updated:", current_user.profile_picture)

        db.session.commit()

        if scrap_form.scrap_picture.data:
            scrap_picture_file = save_picture(scrap_form.scrap_picture.data, current_app.config['SCRAP_PICS_FOLDER'], (300, 300))

            new_scrap = Scrap(picture=scrap_picture_file, description=scrap_form.scrap_description.data, user=current_user)
            db.session.add(new_scrap)

            items_wanted_data = form.items_wanted_hidden.data.split(',') if form.items_wanted_hidden.data else []
            items_for_trade_data = form.items_for_trade_hidden.data.split(',') if form.items_for_trade_hidden.data else []

            current_user.items_wanted = json.dumps(items_wanted_data)
            current_user.items_for_trade = json.dumps(items_for_trade_data)

            db.session.commit()
            print("Scrap after saving:", new_scrap)
        flash('Your account has been updated!', 'success')
        return redirect(url_for('profile'))

    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
        form.about_me.data = current_user.about_me
        form.street.data = current_user.street
        form.postcode.data = current_user.postcode
        form.city.data = current_user.city
        form.country.data = current_user.country
        form.item_for_trade_description.data = current_user.item_for_trade_description
        form.item_wanted_description.data = current_user.item_wanted_description
        items_for_trade = json.loads(current_user.items_for_trade) if current_user.items_for_trade else []
        items_wanted = json.loads(current_user.items_wanted) if current_user.items_wanted else []

        items_wanted_json = json.dumps(items_wanted)
        items_for_trade_json = json.dumps(items_for_trade)

        form.items_wanted_hidden.data = ','.join(items_wanted)
        form.items_for_trade_hidden.data = ','.join(items_for_trade)

        all_items = ['Wood', 'Glass', 'Metal', 'Textiles', 'Plastics']
        all_items_json = json.dumps(all_items)
        return render_template('update_profile.html', title='Update Profile', form=form, scrap_form=scrap_form, items_data=all_items, items_wanted_json=items_wanted_json, items_for_trade_json=items_for_trade_json)


# GET USER DATA
@app.route('/api/users')
def get_users():
    users = User.query.all()
    user_list = []

    for user in users:
        # Access items_for_trade and items_wanted attributes from the User object
        if user.items_for_trade:
            items_for_trade = json.loads(user.items_for_trade)
        if user.items_wanted:
            items_wanted = json.loads(user.items_wanted)

        user_data = ({
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


# PROFILE PAGE (Public)
@app.route("/user/<username>")
def user_profile(username):
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return "User not found", 404
    
    profile_picture = url_for('static', filename='profile_pics/' + user.profile_picture) if user.profile_picture else None
    items_for_trade = safe_json_loads(user.items_for_trade) if user.items_for_trade else []
    items_wanted = safe_json_loads(user.items_wanted) if user.items_wanted else []
    
    return render_template('user_profile.html', title=user.username, user=user, profile_picture=profile_picture, items_wanted=items_wanted, items_for_trade=items_for_trade)

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
    # Check if the user is logged in
    if current_user.is_authenticated:
        # User is logged in, render the map template
        return render_template('map.html', api_key=GOOGLE_MAPS_API_KEY)
    else:
        # User is not logged in, redirect to the registration page
        return redirect(url_for('register'))


if __name__ == '__main__':
    app.run(debug=True)
