from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_required, current_user
from . import db
from .models import User, Pal
from werkzeug.utils import secure_filename
import os
from random import randrange
from tika import parser
from openai import OpenAI 

main = Blueprint('main', __name__)
ALLOWED_EXTENSIONS = {'pdf'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/profile')
@login_required
def profile():
    if current_user.has_pal == False:
        return redirect(url_for('main.create_pal'))
    else:
        pal_stats = Pal.query.filter_by(uid=current_user.id).first()
        return render_template('profile.html', name=current_user.name, pal_name=pal_stats.name, paltype=pal_stats.pal_type, points=pal_stats.points, happiness=randrange(1, 6))
    
@main.route('/createpal')
@login_required
def create_pal():
    if current_user.has_pal == True:
        return redirect(url_for('main.profile'))
    else:
        return render_template('createpal.html', name=current_user.name)

@main.route('/createpal', methods=['POST'])
def create_pal_post():
    palname = request.form.get('name')
    paltype = request.form.get('pal')
    uid = current_user.id

    # create a new user with the form data. Hash the password so the plaintext version isn't saved.
    new_pal = Pal(name=palname, pal_type=paltype, uid=uid)
    edited_user = User.query.filter_by(id=current_user.id).first() 
    edited_user.has_pal = True

    db.session.add(new_pal)
    db.session.commit()
    return redirect(url_for('main.profile'))

@main.route("/match")
@login_required
def match():
    data = session.get('data', None)
    session['data'] = None

    return render_template('match.html', data = data)

@main.route("/crossword")
def crossword():
    data = [
    {"answer": "orange", "desc": "Both a fruit and a colour"},
    {"answer": "oval",   "desc": "Stretched circle"},
    {"answer": "northern", "desc": "Opposite of southern"},
    {"answer": "apple", "desc": "Tech company known for phones"},
    {"answer": "strawberry", "desc": "Fruit bearing seeds on the outside"},
    {"answer": "yellow", "desc": "Colour of a submarine"},
    {"answer": "gigantic", "desc": "Extremely large"},
    {"answer": "connection", "desc": "A link between two things"},
    {"answer": "address", "desc": "Representing location"},
    {"answer": "dictionary", "desc": "Book of many words"}]
    return render_template('crossword.html', data = data)

@main.route('/profile', methods=['POST'])
def profile_post():
    upload_folder = os.environ['UPLOAD_FOLDER']
    file1 = request.files['addfile']
    basedir = os.path.abspath(os.path.dirname(__file__))
    if allowed_file(file1.filename):
        full_path = os.path.join(basedir, upload_folder, secure_filename(file1.filename))
        file1.save(full_path)
        raw = parser.from_file(full_path)
        os.remove(full_path)
        client = OpenAI()
        if raw['content']: 
            completion = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content":  
              "You are a study assistant, helping students create questions to test themselves on study material."},
              {"role": "user", "content": "I have the following lesson content. Create 9 question and answer pairs from this content to help test myself for an upcoming exam. Every question and every answer should each have a limit of 70 characters. Please write them in the format Q1: Question 1, A1: Answer 1, Q2: Question 2 and so on. "+raw['content']}, 
            ]
            )
            data = []
            lines = completion.choices[0].message.content.strip().split("\n")
            for line in lines:
                line = line.strip()
                if line != '':
                    current_qa = {"name": line.split(":")[0].strip()[1], "desc": line.split(":")[1].strip()}
                    data.append(current_qa)
            session['data'] = data
            return redirect(url_for('main.match'))
        else:
            flash('No usable content was found in this PDF. Please try again.')
            return redirect(url_for('main.profile'))
    else:
        flash('Invalid file formats. Please try again.')
        return redirect(url_for('main.profile'))
    
