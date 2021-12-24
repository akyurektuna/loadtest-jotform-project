import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import os
from datetime import date
from requests_main import *
from database_insert import *
from arrivalCalculation import *
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask
from flask_socketio import SocketIO, emit, send

load_dotenv()
# PostgreSQL Database credentials loaded from the .env file
DATABASE = os.getenv('DATABASE')
DATABASE_USERNAME = os.getenv('DATABASE_USERNAME')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

CORS(app)

final_data={}

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
    apiKey = "507c5cf8b99fbed83bbeb42d3d0d7e1f"
    data = getFormQuestions(baseURL, formId, apiKey)
    content = data["content"]
    listP = convertTypeNames(content)
    jsonStr = serializeJson(listP)
    #count and spawnRate are taken from app.js
    count = input["subcount"]
    spawnRate = input["spawnrate"]
    total_time=0
    average=0
    code=0
    errors=0
    postBodyData = createMockData(jsonStr, count)
    today = datetime.datetime.now().date()
    d1 = today.strftime("%d/%m/%Y")
    temp_url='https://static.metacritic.com/images/products/movies/9/08b5f3a45845fa3b6d1cb5f4978b5081-250h.jpg'
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
            code=int(task.result()[0])
            if(code!=200):
                errors=errors+1
            total_time=total_time+float(resp_time)
            average=float(total_time)/(j+1)
            
            data = {
                "name": j+1,
                "value": resp_time,
                "average":average,
                "errors":errors
            }
            print(resp_time)
            send(data)

            temp = i
            j = j + 1
           
    # Finding average of response time and getting error count.
    #Preparing the response data
    #debug

    currentTime = time.localtime()
    result = time.strftime("%I:%M:%S", currentTime)
    print("time after ",result)
    print("must last for: ", spawnRate)
    final_data=data
    #
    insert_test(temp_url,average,errors,d1)
    return None
    
if __name__ == '__main__':
    socketIo.run(app)

try:
    con = psycopg2.connect(
        database=DATABASE,
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD)

    cur = con.cursor()

    # GET: Fetch all test from the database
    @app.route('/')
    def fetch_all_tests():
        cur.execute('SELECT * FROM tests')
        rows = cur.fetchall()
        print(rows)
        
        return jsonify(rows)
except:
    print('Error')