import requests
import json
from requests.structures import CaseInsensitiveDict
from marshmallow import Schema, fields

def getFormQuestions(formId):
    #get request for questions in the form
    #from id should be taken from the user
    #tuna apikey d7cf6727c091d4faecb509c7e9d26f99
    #ufuk apikey 5bb630dcd7b75679216357eb9073dba6
    URL = "https://api.jotform.com/form/"+formId+"/questions?apiKey=5bb630dcd7b75679216357eb9073dba6"
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
            parameterName = 'submission'+'['+n+' ]'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)
        
        if content[n]["type"] == 'control_textarea':
            parameterTypeMockaroo = 'Paragraphs'
            parameterName = 'submission'+'['+n+' ]'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)    
        
        if content[n]["type"] == 'control_email':
            parameterTypeMockaroo = 'Email Address'
            parameterName = 'submission'+'['+n+' ]'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)
        
        if content[n]["type"] == 'control_fullname':
            parameterTypeMockaroo = 'First Name'
            parameterName = 'submission'+'['+n+'_first]'
            parameter = dict(name=parameterName,type=parameterTypeMockaroo)
            parameterList.append(parameter)
            parameterTypeMockaroo = 'First Name'
            parameterName = 'submission'+'['+n+'_last]'
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

def submitForm(reqBody,formId):
    #submitting mock data to form
    #this part will be repeated with the count number
    #tuna apikey d7cf6727c091d4faecb509c7e9d26f99
    #ufuk apikey e0a5f3508d13cfe4724636dec7f2cd7c
    URLson = "https://api.jotform.com/form/"+formId+"/submissions?apiKey=e0a5f3508d13cfe4724636dec7f2cd7c"
    reqPostForm= requests.post(url=URLson, data=reqBody)
    resp=reqPostForm.json()
    print(resp)
    return resp
   



