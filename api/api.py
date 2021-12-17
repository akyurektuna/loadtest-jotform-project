import time
from flask import Flask, request
from requests_main import *
from arrivalCalculation import *
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

socketIo = SocketIO(app, cors_allowed_origins="*")

app.debug = True
app.host = 'localhost'



@socketIo.on("message")
def get_input(input):
    print(input)
    formId = input["formid"]
    #baseURL should be taken from the user
    #API Ufuk:507c5cf8b99fbed83bbeb42d3d0d7e1f || Tuna: 2da27739ce924bcaeb7957ab145b24d2
    baseURL = "https://eejoinflowtest03nov2021test01.jotform.com"
    apiKey = "2da27739ce924bcaeb7957ab145b24d2"
    data = getFormQuestions(baseURL, formId, apiKey)
    content = data["content"]
    listP = convertTypeNames(content)
    jsonStr = serializeJson(listP)
    #count and spawnRate are taken from app.js
    count = input["subcount"]
    spawnRate = input["spawnrate"]
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
            task=executor.submit(submitForm, postBodyData[j], baseURL, formId)
            print(task.result())
            resp_time=task.result()[1]
            print(resp_time)
            send(resp_time)
            temp = i
            j = j + 1
           
    # Finding average of response time and getting error count.
    #Preparing the response data
    #debug
    currentTime = time.localtime()
    result = time.strftime("%I:%M:%S", currentTime)
    print("time after ",result)
    print("must last for: ", spawnRate)
    #

    return None
    
if __name__ == '__main__':
    socketIo.run(app)
