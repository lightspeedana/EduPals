from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_required, current_user
from . import db
from .models import User, Pal, Product
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
    data = session.get('match_data', None)
    session['match_data'] = None

    return render_template('match.html', data = data)

@main.route("/market")
@login_required
def market():
    if len(Product.query.all()) == 0:
        prd1 = Product(name="Mini Cooper Model", description="A miniature model of a Mini Cooper car.", image_url="https://m.media-amazon.com/images/I/913Z1CPD0WL._AC_UF894,1000_QL80_.jpg", points=150)
        prd2 = Product(name="Nike Keychain", description="A stylish keychain with the Nike logo.", image_url="https://i.ebayimg.com/images/g/O4AAAOSwPyVkFjW-/s-l1200.webp", points=100)
        prd3 = Product(name="Samsung Galaxy S22", description="The latest model of the Samsung Galaxy series.", image_url="https://www.trustedreviews.com/wp-content/uploads/sites/54/2022/08/S22-rear-upright-scaled.jpg", points=10000)
        prd4 = Product(name="Hershey's Chocolate Bar", description="A classic Hershey's chocolate bar.", image_url="https://www.hersheyland.com/content/dam/hersheyland/en-us/life-style/brands/hersheys/hersheys-bp-24-hero-v4.gif", points=15)
        prd5 = Product(name="Adidas T-shirt", description="A trendy T-shirt featuring the Adidas logo.", image_url="https://www.80scasualclassics.co.uk/images/adidas-originals-3-stripes-t-shirt-navy-blue-p20476-109208_zoom.jpg", points=50)
        prd6 = Product(name="Jansport Backpack", description="A durable backpack from Jansport.", image_url="https://jansport.co.uk/cdn/shop/products/JS0A4QVA_7H6_detail_9c4ae6f0-45b4-486e-ba79-c11c4647b3f4.png?v=1686817342&width=846", points=500)
        prd7 = Product(name="Bose Bluetooth Speaker", description="A portable Bluetooth speaker from Bose.", image_url="https://static.independent.co.uk/2021/03/10/12/Bose%20portable%20smart%20speaker%20review-1.jpg", points=1000)
        prd8 = Product(name="Swatch Watch", description="A luxurious wristwatch from Swatch.", image_url="https://i.ebayimg.com/images/g/FHIAAOSwTShi7lku/s-l1200.webp", points=5000)
        prd9 = Product(name="New Era Cap", description="A stylish cap from New Era.", image_url="https://i.ebayimg.com/images/g/Cl4AAOSwjaNixdrn/s-l1200.jpg", points=175)
        prd10 = Product(name="Ray-Ban Sunglasses", description="Fashionable sunglasses from Ray-Ban.", image_url="https://atttpgdeen.cloudimg.io/cdn/n/n/https://masterdb.co.uk/lux_images/ray-ban/rayban_0rb0840s_901_31_black.jpg", points=750)

        db.session.add(prd1)
        db.session.add(prd2)
        db.session.add(prd3)
        db.session.add(prd4)
        db.session.add(prd5)
        db.session.add(prd6)
        db.session.add(prd7)
        db.session.add(prd8)
        db.session.add(prd9)
        db.session.add(prd10)
        db.session.commit()

    pal_stats = Pal.query.filter_by(uid=current_user.id).first()
    return render_template('market.html', points=pal_stats.points, query=Product.query.all())

@main.route("/review", methods=['GET'])
@login_required
def review():
    score = request.args.get('score')
    won = request.args.get('won')
    gameWon = True if won == "1" else False
    score_int = int(score)
    pal_stats = Pal.query.filter_by(uid=current_user.id).first()
    pal_stats.points += score_int * 10
    db.session.commit()
    return render_template('review.html', score=score, gameWon=gameWon)

@main.route("/crossword")
def crossword():
    data = session.get('crossword_data', None)
    session['crossword_data'] = None
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
              {"role": "user", "content": "I have the following lesson content. Create 9 question and answer pairs from this content to help test myself for an upcoming exam. Every question and every answer should each have a limit of 70 characters. Please write them in the format Q1: Question 1, A1: Answer 1, Q2: Question 2 and so on. "+raw['content']}
              ]
            )
            data = []
            
            lines = completion.choices[0].message.content.strip().split("\n")
            for line in lines:
                line = line.strip()
                if line != '':
                    current_qa = {"name": line.split(":")[0].strip()[1], "desc": line.split(":")[1].strip()}
                    data.append(current_qa)
            session['match_data'] = data
            completion1 = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content":  
            "You are a study assistant, helping students create questions to test themselves on study material."},
            {"role": "user", "content": "I have the following lesson content. Create 10 keyword and definition pairs from this content to create a crossword to test myself for an upcoming exam. Every key word should be maximum 18 letters, written as uppercase and only one word, with no hyphens, spaces or special characters.Please write them in the format Q1: Word 1 <newline>A1: Definition 1 <newline>Q2: Word 2 and so on. "+raw['content']},
            ]
            )
            print(data)
            data = []
            current_qa = None
            lines = completion1.choices[0].message.content.strip().split("\n")
            for line in lines:
                if line != "":
                    if line[0] == "Q":
                        current_qa = {"answer": line.split(":")[1].strip(), "desc": ""}
                    else:
                        current_qa["desc"] += line.split(":")[1].strip()
                        data.append(current_qa)
                        current_qa = None
            session['crossword_data'] = data
            print(data)
            return redirect(url_for('main.select'))
        else:
            flash('No usable content was found in this PDF. Please try again.')
            return redirect(url_for('main.profile'))
    else:
        flash('Invalid file formats. Please try again.')
        return redirect(url_for('main.profile'))
    
@main.route('/select')
def select():
    return render_template('select.html')
    
@main.route('/redeem/<int:id>')
@login_required
def redeem(id):
    chosen_product = Product.query.get_or_404(id)
    details = Pal.query.filter_by(uid=current_user.id).first()
    if details.points < chosen_product.points:
        flash("You don't have enough points to redeem this item.")
        return redirect(url_for('main.market'))
    else:
        flash('Successfully redeemed '+chosen_product.name+'!')
        details.points = details.points - chosen_product.points
        db.session.commit()
        return redirect(url_for('main.market'))
