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
    resp = request.get_json()
    formId = resp["formid"]
    #baseURL should be taken from the user
    #API Ufuk:507c5cf8b99fbed83bbeb42d3d0d7e1f || Tuna: 2da27739ce924bcaeb7957ab145b24d2
    baseURL = "https://eejoinflowtest03nov2021test01.jotform.com"
    apiKey = "2da27739ce924bcaeb7957ab145b24d2"
    data = getFormQuestions(baseURL, formId, apiKey)
    content = data["content"]
    listP = convertTypeNames(content)
    jsonStr = serializeJson(listP)
    #count and spawnRate are taken from app.js
    count = resp["subcount"]
    spawnRate = resp["spawnrate"]
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
            processes.append(executor.submit(submitForm, postBodyData[j], baseURL, formId))
            temp = i
            j = j + 1
      
        for task in as_completed(processes):
            print(task.result())
            codes.append(task.result()[0])
            times.append(float(task.result()[1]))

    # Finding average of response time and getting error count.
    average= sum((times))/len(times)    
    error_count=0
    for i in range(len(codes)):
        if codes[i]!=200:
            error_count=error_count+1

    #Preparing the response data.
    results = {"codes": codes,"times": times,"average": average,"error":error_count}
   
    #debug
    currentTime = time.localtime()
    result = time.strftime("%I:%M:%S", currentTime)
    print("time after ",result)
    print("must last for: ", spawnRate)
    #
    return results
