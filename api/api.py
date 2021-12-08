import time
import datetime
import sys
from flask import Flask, request, render_template
from flask.helpers import url_for
from flask.json.tag import JSONTag
from werkzeug.utils import redirect
from requests_main import *
from arrivalCalculation import *
from concurrent.futures import ThreadPoolExecutor, as_completed

app = Flask(__name__)


@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


@app.route('/api/input', methods=['GET', 'POST'])
def get_input():
    place = request.get_json()
    formId = '212851147550048'
    data = getFormQuestions(formId)
    content = data["content"]
    listP = convertTypeNames(content)
    jsonStr = serializeJson(listP)
    #count and spawnRate are taken from app.js
    count = place["subcount"]
    spawnRate = place["spawnrate"]
    codes = []
    times = []
    postBodyData = createMockData(jsonStr, count)
    
    arrivalTimes = arrivalCalculationWithPoisson(count, spawnRate)
    arrivingSeconds = calculateArrivingSeconds(arrivalTimes)
   
    #debug
    currentTime = time.localtime()
    result = time.strftime("%I:%M:%S", currentTime)
    print("time before ",result)
    print("arriving seconds: ", arrivingSeconds)
    #
   
    temp = 0
    j = 0
   
    #creating threads with max_worker default value
    #Future objects are kept in processes[]
    processes = []
    with ThreadPoolExecutor() as executor:
        for i in arrivingSeconds:
            print("waiting time in seconds: ",i-temp)
            time.sleep(i-temp)
            processes.append(executor.submit(submitForm, postBodyData[j], formId))
            temp = i
            j = j + 1

        for task in as_completed(processes):
            codes.append(task.result()["responseCode"])
            times.append(task.result()["duration"])

        results = {"codes": codes, "times": times}
   
    #debug
    currentTime = time.localtime()
    result = time.strftime("%I:%M:%S", currentTime)
    print("time after ",result)
    print("must last for: ", spawnRate)
    #
    return results
