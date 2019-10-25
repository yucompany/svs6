Note to HBO team:

- I've placed all POST/GET requests in sequence to err on the side of maximum requests per user. 
  In actual implementation, users will not always make all AWS-related requests found in 'aws_router.js'

- I've also included a folder of each generated frame that will be pulled by 'test.py' as I don't believe
we can run through p5.js sequence via locust.

- Make sure to comment out lines 127 and 132 of 'encoder_router.js' to avoid self-collision if running locally!


Let me know if you have any questions/comments/concerns!

Best,
Rick