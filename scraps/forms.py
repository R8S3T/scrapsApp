from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, HiddenField, TextAreaField, SelectMultipleField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from flask_wtf.file import FileField, FileAllowed
from scraps.models import User


class RegistrationForm(FlaskForm):
    username = StringField('Username',
                        validators=[DataRequired(), Length(min=2, max=80)])
    email = StringField('Email',
                        validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password',
                                    validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is taken. Please choose a different one.')


class LoginForm(FlaskForm):
    email = StringField('Email',
                        validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')


class ProfileForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=2, max=80)])
    street = StringField('Street', validators=[DataRequired(), Length(max=100)])
    postcode = StringField('Postcode', validators=[DataRequired(), Length(max=5)])
    city = StringField('City', validators=[DataRequired(), Length(max=50)])
    country = StringField('Country', validators=[DataRequired(), Length(max=50)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    profile_picture = FileField('Profile Picture', validators=[FileAllowed(['jpg', 'jpeg', 'png'])])
    items_for_trade = TextAreaField('Items for Trade')
    items_wanted = TextAreaField('Items Wanted')
    items_for_trade_hidden = HiddenField()
    items_wanted_hidden = HiddenField()
    submit = SubmitField('Update')