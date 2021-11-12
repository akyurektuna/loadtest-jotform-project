import time,sys
from flask import Flask,request,render_template
from flask.helpers import url_for
from werkzeug.utils import redirect

app = Flask(__name__)

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}
    
@app.route('/api/input', methods = ['GET','POST'])
def get_input():
    if request.method=="POST":
        place=request.form
        return place
        