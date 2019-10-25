from locust import HttpLocust, TaskSet, TaskSequence, task, seq_task, events

import os
import math
import random
import json
import base64

loc = 'locust/' # declare subfolder, IF CONTAINING FOLDER CHANGES, MAKE SURE TO UPDATE THIS

letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", ".", "-", "@"  ]

# grab images from local folder
frames = [];
for f in range(84):
    img = open(loc + 'frames/frame-' + str(f+36) + '.jpg', 'rb')
    rf = img.read()
   # byt = bytearray(rf)
    frames.append( { 'dat': "data:image/jpeg;base64, " + base64.b64encode(rf).decode("utf-8"), 'index': f }  )

#headers = {'content-type': 'application/json'}

# your own custom task set
class Process(TaskSequence):
    lineA = ""
    lineB = ""

    output = ""

    key = "false"
    link = ""

    # your task
    @seq_task(1)
    @task(1)
    def index(self):
        print("open")

        self.client.get('/')
        pass

    @seq_task(2)
    @task(1)
    def addFrames(self):
        print("add frames")
        res = self.client.post('/encoder/addFrames', data=json.dumps({ "frames" : frames}), headers={'content-type': 'application/json'}, catch_response=True)

        if res.status_code == 200 :
            res.success()
        else :
            res.failure("fail add frames")
        pass

    @seq_task(3)
    def defineKey(self):
        print("set key")

        al = math.floor(random.random() * 7)
        alt = ""
        for a in range(al):
            alt += letters[math.floor(random.random() * len(letters))]

        bl = math.floor(random.random() * 7)
        blt = ""
        for b in range(bl):
            blt += letters[math.floor(random.random() * len(letters))]

        self.lineA = alt
        self.lineB = blt
        pass

    @seq_task(4)
    def cacheKey(self):
        s3 = "/output/" + self.lineA + "~" + self.lineB + ".mp4"


        print("cache key")
        res = self.client.post('/aws/s3cacheKey',  data=json.dumps({ "s3Key" : s3 }), headers={'content-type': 'application/json'}, catch_response=True)

        if res.status_code == 200 :
            res.success()
        else :
            res.failure("fail cache key")

        self.key = res.content.decode('utf-8')
        print(self.key)

        pass

    @seq_task(5)
    def deeplink(self):
        v = "/output/" + self.lineA + "~" + self.lineB + ".mp4"
        p = "/output/" + self.lineA + "~" + self.lineB + ".jpg"

        print("cache key")
        res = self.client.post('/aws/deepLink',  data=json.dumps({ "videoFilePath" : v, "imageFilePath" : p }), headers={'content-type': 'application/json'}, catch_response=True)

        if res.status_code == 200 :
            res.success()
            self.link = res.content.decode('utf-8')
        else :
            res.failure("fail deeplink")

        pass

    @seq_task(6)
    def screenshot(self):
        print("screenshot")
        res = self.client.post('/encoder/screenshot',  data=json.dumps({ "fileName" : self.lineA + "~" + self.lineB + ".jpg", "dat" : frames[83].get("dat")}), headers={'content-type': 'application/json'}, catch_response=True)
        
        if res.status_code == 200 :
            res.success()
        else :
            res.failure("fail screenshot")
        pass

    @seq_task(7)
    def encode(self):
        print("encode")
        res = self.client.post('/encoder/encode', data=json.dumps( { "path" : self.lineA + '~' + self.lineB } ), headers={'content-type': 'application/json'}, catch_response=True)
        
        if res.status_code == 200 :
            res.success()
        else :
            res.failure("fail encode")

        self.output = res.content.decode('utf-8')
        pass
#
    @seq_task(8)
    def upload(self):
        print("upload")
        res = self.client.post('/aws/s3upload', data=json.dumps( { "videoFilePath": self.output, "imageFilePath" :  self.output.replace("mp4", "jpg", 1) } ), headers={'content-type': 'application/json'}, catch_response=True)
        
        if res.status_code == 200 :
            res.success()
        else :
            res.failure("fail upload")
        
        pass


# task runner
class LocustRunner(HttpLocust): 
    task_set = Process # add your set to the task runner
    min_wait = 1000
    max_wait = 15000