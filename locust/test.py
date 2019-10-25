from locust import HttpLocust, TaskSet, TaskSequence, task, seq_task

import pickle

import os
import json
import base64

loc = 'locust/' # declare subfolder

# grab images from local folder
frames = [];
for f in range(84):
    img = open(loc + 'frames/frame-' + str(f+36) + '.jpg', 'rb')
    rf = img.read()
   # byt = bytearray(rf)
    frames.append( { 'dat': "data:image/jpeg;base64,/" + base64.b64encode(rf).decode("utf-8"), 'index': f }  )

#headers = {'content-type': 'application/json'}

# your own custom task set
class EncodeTasks(TaskSequence):
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
        pass

    @seq_task(3)
    def screenshot():
        print("screenshot")
        self.client.post(/encoder/screenshot,  data=json.dumps({ "frames" : frames[84]}), headers={'content-type': 'application/json'}, catch_response=True)
        pass

    @seq_task(4)
    def encode(self):
        print("encode")
        self.client.post('/encoder/encode')
        pass

#class AWSTasks(TaskSet):
#
#    @task
#    def index():
#        print("open")
#        self.client.get('/')
#
   # @task
   # def deeplink():
   #     print("deeplink")
   #     self.client.post('/aws/deepLink')
#
   # def processId():
   #     print("process id")
   #     self.client.post('/aws/processId')
#
   # def upload():
   #     print("upload")
   #     self.client.post('/aws/s3upload')
#
   # def cacheKey:
   #     print("cache key")
   #     self.client.post('/aws/s3cacheKey')


# task runner
class LocustRunner(HttpLocust): 
    task_set = EncodeTasks # add your set to the task runner
    min_wait = 5000
    max_wait = 15000