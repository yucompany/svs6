from locust import HttpLocust, TaskSet, task

# your own custom task set
class CustomTaskSet(TaskSet):
    # your task
    @task(1) # how many times to run per execution cycle
    def index(self): # task function definition
        self.client.get('/') # hit '/' with a get request

# task runner
class LocustRunner(HttpLocust): 
    task_set = CustomTaskSet # add your set to the task runner
    min_wait = 5000
    max_wait = 15000