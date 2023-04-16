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
    street = StringField('Street', validators=[Length(max=100)])
    postcode = StringField('Postcode', validators=[Length(max=5)])
    city = StringField('City', validators=[Length(max=50)])
    country = StringField('Country', validators=[Length(max=50)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    profile_picture = FileField('Profile Picture', validators=[FileAllowed(['jpg', 'jpeg', 'png'])])
    about_me = TextAreaField('About Me', validators=[Length(min=0, max=500)])
    items_for_trade_hidden = HiddenField(default="")
    items_wanted_hidden = HiddenField(default="")
    item_for_trade_description = TextAreaField('Add details about your scraps', validators=[Length(min=0, max=500)])
    item_wanted_description = TextAreaField('Tell others what you are looking for', validators=[Length(min=0, max=500)])
    submit = SubmitField('Update')

class ScrapForm(FlaskForm):
    items_for_trade = TextAreaField('Items for Trade')
    items_wanted = TextAreaField('Items Wanted')
    scrap_picture = FileField('Scrap Picture', validators=[FileAllowed(['jpg', 'jpeg', 'png'])])
    scrap_description = TextAreaField('Scrap Description', validators=[Length(min=0, max=100)])
    submit = SubmitField('Add Scrap')