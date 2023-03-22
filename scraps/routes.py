import os
from dotenv import load_dotenv
import secrets
from PIL import Image
from flask import Flask
from flask import render_template, url_for, flash, redirect, request, current_app
from scraps import app, db, bcrypt
from scraps.forms import RegistrationForm, LoginForm, ProfileForm
from scraps.models import User, Item
from flask_login import login_user, current_user, logout_user, login_required




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


''' Create save_picutre function to save an uploaded 
    image file to server's filesytem'''
def save_picture(form_picture):
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(current_app.root_path, 'static/profile_pics', picture_fn)
    
    # resize image to max size of 125 x 125
    output_size = (125, 125)
    img = Image.open(form_picture)
    img.thumbnail(output_size)

    img.save(picture_path)
    return picture_fn

@app.route("/profile")
@login_required
def profile():
    if current_user.items_for_trade:
        items_for_trade = current_user.items_for_trade.split('\n')
    else:
        items_for_trade = None
    
    if current_user.items_wanted:
        items_wanted = current_user.items_wanted.split('\n')
    else:
        items_wanted = None
    
    profile_picture = url_for('static', filename='profile_pics/' + current_user.profile_picture) if current_user.profile_picture else None
    form = ProfileForm()
    return render_template('profile.html', title='Profile', profile_picture=profile_picture, items_for_trade=items_for_trade, items_wanted=items_wanted, form=form)


@app.route("/update_profile", methods=['GET', 'POST'])
@login_required
def update_profile():
    form = ProfileForm()
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.email = form.email.data
        current_user.items_for_trade = form.items_for_trade.data
        current_user.items_wanted = form.items_wanted.data
        if form.profile_picture.data:
            picture_file = save_picture(form.profile_picture.data)
            current_user.profile_picture = picture_file
        db.session.commit()
        flash('Your account has been updated!', 'success')
        return redirect(url_for('profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
        form.items_for_trade.data = current_user.items_for_trade
        form.items_wanted.data = current_user.items_wanted
    return render_template('update_profile.html', title='Update Profile', form=form)

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
    
