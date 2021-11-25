import time
import sys
from flask import Flask, request, render_template
from flask.helpers import url_for
from flask.json.tag import JSONTag
from werkzeug.utils import redirect
from requests_main import *

app = Flask(__name__)


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


@app.route('/api/input', methods=['GET', 'POST'])
def get_input():
    place = request.get_json()
    formId = '212862025288053'
    data = getFormQuestions(formId)
    content = data["content"]
    listP = convertTypeNames(content)
    jsonStr = serializeJson(listP)
    count = place["subcount"]
    codes = []
    times = []
    postBodyData = createMockData(jsonStr, count)
    for i in range(int(count)):
        resp = submitForm(postBodyData[i], formId)
        codes.append(resp["responseCode"])
        times.append(resp["duration"])
    results = {"codes": codes, "times": times}
    return results
