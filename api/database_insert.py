from dotenv import load_dotenv
import psycopg2
import os

load_dotenv()
# PostgreSQL Database credentials loaded from the .env file
def insert_test(url,average,error,date,formid,baseurl,count,resultduration):
    DATABASE = os.getenv('DATABASE')
    DATABASE_USERNAME = os.getenv('DATABASE_USERNAME')
    DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')

    con = psycopg2.connect(
        database=DATABASE,
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD)
    cur = con.cursor()
    cur.execute("INSERT INTO tests(img_url, avg_resp_time, error_count, test_date,formid,baseurl,clientcount,duration) VALUES (%s, %s, %s, %s,%s, %s, %s, %s)",
                        (url,str("{:.2f}".format(average)),str(error),date, formid, baseurl,count,str(resultduration)))
    return con.commit()
    