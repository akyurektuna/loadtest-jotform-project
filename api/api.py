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
    global formId, baseURL, count, resultDuration
    formId = input["formid"]
    #baseURL should be taken from the user
    #API Ufuk:507c5cf8b99fbed83bbeb42d3d0d7e1f || Tuna: 2da27739ce924bcaeb7957ab145b24d2
    baseURL = input["formhost"]
    apiKey = "2da27739ce924bcaeb7957ab145b24d2"
    data = getFormQuestions(baseURL, formId, apiKey)
    content = data["content"]
    listP = convertTypeNames(content)
    jsonStr = serializeJson(listP)
    #count and spawnRate are taken from app.js
    count = input["subcount"]
    spawnRateStr = input["spawnrate"]
    spawnRate = int(spawnRateStr)/100
    # print("**",type(spawnRate))
    # print(spawnRate)

    total_time=0
    average=0
    code=0
    errors=0
    done=False
    postBodyData = createMockData(jsonStr, count)
    today = datetime.datetime.now().date()
    d1 = today.strftime("%d/%m/%Y")
    temp_url='https://static.metacritic.com/images/products/movies/9/08b5f3a45845fa3b6d1cb5f4978b5081-250h.jpg'
    arrivalTimes = arrivalCalculationWithPoisson(count, spawnRate)
    arrivingSeconds = calculateArrivingSeconds(arrivalTimes)
   
    #debug
    timeBefore = datetime.datetime.now()
    print(arrivingSeconds)
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

            if(j+1==int(input["subcount"])):
                done=True

            total_time=total_time+float(resp_time)
            average=float(total_time)/(j+1)
            
            data = {
                "name": j+1,
                "value": resp_time,
                "average":average,
                "errors":errors,
                "done":done
            }
            print(resp_time)
            send(data)

            temp = i
            j = j + 1
           
    # Finding average of response time and getting error count.
    #Preparing the response data
    #debug

    timeAfter = datetime.datetime.now()
    diff = timeAfter - timeBefore
    resultDuration = str(diff.total_seconds()*1000)
    
    print("time after ",resultDuration)
    print("must last for: ", spawnRate)
    final_data=data
    #
    return None

@app.route('/database', methods=['POST','GET'])
def Insert_db():
    today = datetime.datetime.now().date()
    d1 = today.strftime("%d/%m/%Y")
    db_info = request.json
    insert_test(db_info["graph"],db_info["average"],db_info["errors"],d1,formId,baseURL,count,resultDuration)
    return "Data inserted"
    
if __name__ == '__main__':
    socketIo.run(app)

try:
    con = psycopg2.connect(
        database=DATABASE,
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD)

    cur = con.cursor()

    # GET: Fetch all test from the database
    @app.route('/list')
    def fetch_all_tests():
        cur.execute('SELECT * FROM tests')
        rows = cur.fetchall()
        print(rows)
        
        return jsonify(rows)


    @app.route('/<int:id>')
    def fetch_test(id):
        print(id)
        cur.execute("SELECT * FROM tests WHERE test_id ={0}".format(id))
        rows = cur.fetchone()
        print(rows)
        
        return jsonify(rows)
except:
    print('Error')