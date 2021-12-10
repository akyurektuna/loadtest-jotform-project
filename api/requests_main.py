import requests
import json
from requests import api
from requests.structures import CaseInsensitiveDict
from marshmallow import Schema, fields
from datetime import datetime

def getFormQuestions(baseUrl, formId, apiKey):
    #get request for questions in the form
    #from id should be taken from the user
    #tuna apikey d7cf6727c091d4faecb509c7e9d26f99
    #ufuk apikey 5bb630dcd7b75679216357eb9073dba6
    URL = baseUrl + "/API/" + "form/" + formId + "/questions?apiKey=" +apiKey
    r = requests.get(url = URL)
    return r.json()

def convertTypeNames(content):
    parameterList = []    
    for n in content:
        # print("content t: ",content[n]["type"])
        # print("content name: ",content[n]["name"])

        #data types and names are created for Mockaroo
        #type needs to be hardcoded for each, because each type is written different in Mockaroo and Jotform
        #name is created as -> submission + question number
        #different type names should be converted here

        if content[n]["type"] == 'control_textbox':
            parameterTypeMockaroo = 'Sentences'
            parameterName = 'q'+n+'_name'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)
        
        if content[n]["type"] == 'control_textarea':
            parameterTypeMockaroo = 'Paragraphs'
            parameterName = 'q'+n+'_name'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)    
        
        if content[n]["type"] == 'control_email':
            parameterTypeMockaroo = 'Email Address'
            parameterName = 'q'+n+'_email'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)
        
        if content[n]["type"] == 'control_fullname':
            parameterTypeMockaroo = 'First Name'
            parameterName = 'q'+n+'_name[first]'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)
            parameterTypeMockaroo = 'First Name'
            parameterName = 'q'+n+'_name[last]'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter) 
    return parameterList

def serializeJson(parameterList):
    #using marshmallow to serialize objects to strings
    class ObjectSchema(Schema):
        name = fields.Str()
        type = fields.Str()

    object_schema = ObjectSchema()
    jsonStr = object_schema.dumps(parameterList, many=True)
    return jsonStr

def createMockData(jsonStr, count):
    #post request to mockaroo to create mock data
    #count should be taken from the user
    mockURL = "https://api.mockaroo.com/api/generate.json?key=33ffe4e0" +"&count=" + count
    reqMock = requests.post(url = mockURL, data=jsonStr)
    return reqMock.json()

def submitForm(reqBody, baseUrl,formId):
    #submitting mock data to form
    #this part will be repeated with the count number
    #tuna apikey d7cf6727c091d4faecb509c7e9d26f99
    #ufuk apikey e0a5f3508d13cfe4724636dec7f2cd7c
    URLson = baseUrl + "/submit/" + formId
    dtBefore = datetime.now()
    pf = requests.post(url=URLson, data=reqBody, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    dtAfter = datetime.now()
    duration = dtAfter - dtBefore
    return [pf.status_code, str(duration.microseconds)]
   
# baseURL = "https://eejoinflowtest03nov2021test01.jotform.com"
# formId = "213421479225049"
# apiKey = "2da27739ce924bcaeb7957ab145b24d2"
# data = getFormQuestions(baseURL, formId, apiKey)
# content = data["content"]
# listP = convertTypeNames(content)
# jsonStr = serializeJson(listP)
# count = "1"
# postBodyData = createMockData(jsonStr, count)
# print("postbd: ", postBodyData)
# submitForm(postBodyData, baseURL, formId)

