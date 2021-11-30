import random
from decimal import Decimal
import time

def arrivalCalculationWithPoisson(n, timeSpan):
    #n is the number of virtual users
    #avg arrival rate is calculated by (number of users)/(time)
    #avgArrivalRate = n/timeSpan 
    events=[]
    #place n events uniformly distributed and place in array events.
    n = int(n)
    timeSpan = float(timeSpan)
    for j in range(0,n)  :
        events.append(random.random())
        #print("normalizasyon öncesi ", events[j])
    #sort the array
    events.sort()
    #at this point the events array contains n events distributed from 
    #(0.0 to 1.0). The next step is to scale the timing of all events by multiplying by timeSpan

    arrivalTimes = []
    for j in range(0,n)  :
        events[j]*=timeSpan
        minutes = int(events[j])
        seconds = events[j] % 1

        if seconds >= 0.6:
            minutes = minutes + 1
            seconds = seconds - 0.6
        
        formattedSeconds = "{:.2f}".format(seconds)
        formattedSeconds = formattedSeconds[2::]
        arrivalTime = str(minutes) + ":" + formattedSeconds
        arrivalTimes.append(arrivalTime)
    #The events array now contains an array of event times which are approximate the #Poisson distribution with a mean arrival rate of mu per time interval.
    return arrivalTimes

def calculateArrivingSeconds(at):
    temp = 0
    arrivingSeconds = []
    for i in at:
        #totalSeconds is the time of the request to be sent
        #to find the amount of seconds for sleep, arrival time of two requests should be subtracted
        totalSeconds = int(i.split(':')[0])*60 + int(i.split(':')[1])
        arrivingSeconds.append(totalSeconds)
    
    arrivingSeconds.sort()
    return arrivingSeconds
