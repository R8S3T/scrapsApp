from flask import Flask, url_for, render_template, flash, redirect, request
from flask_sqlalchemy import SQLAlchemy
from forms import RegistrationForm, LoginForm
from markupsafe import escape


app = Flask(__name__)
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

#app.app_context().push()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(50), nullable=False)
    #image_file = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        #Creates confirmation message when account has been created
        flash(f'Account created for {form.username.data}!', 'success')
        return redirect(url_for('index'))
    return render_template('register.html', title='Register', form=form)

@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit(): 
        if form.email.data == 'admin@blog.com' and form.password.data == 'password':
            flash('You have been logged in!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Login Unsuccessful.', 'danger')
    return render_template('login.html', title='Login', form=form)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)


# ChatGPT register form
""" 
@app.route('/register1', methods=['GET', 'POST'])
def register1():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        user = User(name=name, email=email, password=password)
        db.session.add(user)
        db.session.commit()

        flash('Your account has been created!', 'success')
        return redirect('/')
    else:
        return render_template('register1.html', title='Register') 
"""