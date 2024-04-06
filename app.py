from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def hello():
    return render_template('homepage.html')


@app.route('/tasks')
def tasks():
    return render_template('tasks.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/login_action', methods = ['POST'])
def login_action():
    return True


@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/register_action', methods = ['POST'])
def register_action():
    return True

if __name__ == '__main__':
    app.run(debug=True)