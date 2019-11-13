'use strict';

const router      = require('express').Router();
const AWS         = require('aws-sdk');
const s3          = new AWS.S3();
const docClient   = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
const fs          = require('fs');


// Uploads video file to S3 bucket
router.post('/s3upload', (req, res) => {
    try {
        const videoFilePath = outputDir.split('/output')[0] + req.body.videoFilePath; 
        const imageFilePath = outputDir.split('/output')[0] + req.body.imageFilePath;

        fs.readFile(imageFilePath, (err, data) => { // Read image data from file
            if (err) { throw err; }

            const base64data = new Buffer.from(data, 'base64'); // Fetch buffer from octet-stream

            const params = {
                Bucket: process.env.AWS_BUCKET || 'social-sharing-install',
                Key: 'tec-demo' + req.body.videoFilePath.replace('.mp4', '.jpg'), // Key for image file on s3
                Body: base64data // Image data
            };

            console.log(`Uploading ${imageFilePath} to S3 bucket...`);
            s3.upload(params, async (err, data) => { // Upload image to s3!!
                if (err) {
                    console.log('Error uploading to S3::\n', err);
                } else { // Successful upload of image to s3
                    console.log('Upload complete!');

                    fs.readFile(videoFilePath, (err, data) => { // Read video data from file
                        if (err) { throw err; }

                        const base64data = new Buffer.from(data, 'binary'); // Fetch buffer from binary

                        const params = {
                            Bucket: process.env.AWS_BUCKET || 'social-sharing-install',
                            Key: 'tec-demo' + req.body.videoFilePath, // Key for video file on s3
                            Body: base64data // Video data
                        };

                        console.log(`Uploading ${req.body.videoFilePath} to S3 bucket...`);
                        console.log('Generating deep link');

                        s3.upload(params, async (err, data) => { // Upload video to s3!!
                            if (err) {
                                console.log('Error uploading to S3::\n', err);
                            } else { // Successful upload of video to s3
                                console.log('Upload complete!');
                                const deepLink = await generateDeepLink(req.body.videoFilePath, req.body.videoFilePath.replace('.mp4', '.jpg')); // Generate deep link for input from file paths
                                res.status(200).send(deepLink); // Send generated deeplink to client

                                console.log('Deleting image from temporary storage.');
                                fs.unlinkSync(imageFilePath); // Destroy image file from output dir

                                console.log('Deleting video from temporary storage.');
                                fs.unlinkSync(videoFilePath); // Destroy video file from output dir
                            }
                        });
                    });
                }
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
});

// Looks for key in S3 bucket for input
router.post('/s3cacheKey', (req, res) => {
    return new Promise((resolve, reject) => {
        //Check if this key is already stored in S3.
        const s3Key = req.body.s3Key; // Requested s3 key

        const params = {
            Bucket: process.env.AWS_BUCKET || 'social-sharing-install',
            Key: 'tec-demo' + s3Key
        };

        // Fetch s3 key from bucket
        s3.getObject(params, (err, data) => {
            if (err) {
                if (err.message === 'The specified key does not exist.') {
                    res.status(200).send(false);
                    resolve();
                } else {
                    res.status(400).send(err);
                    reject(err);
                }
            } else {
                if (data.Body) { // Key in s3 bucket!
                    res.status(200).send(true);
                } else { // No key in s3 bucket!
                    res.status(200).send(false);
                }
                resolve();
            }
        });
    });
});

// Looks for deeplink in DDB Table
router.post('/processId', (req, res) => {
    //Check if this key is already stored in S3.
    const deepLinkId = req.body.deepLinkId; // Fetch deeplink key from request

    return new Promise((resolve, reject) => {
        const params = {
            TableName : process.env.DDB_TABLE || 'tec-demo', // Table in question
            KeyConditionExpression: '#deeplink_id = :deeplink_id',
            ExpressionAttributeNames: {
                '#deeplink_id': 'deeplink_id' // Assign key to key-value pair in query
            },
            ExpressionAttributeValues: {
                ':deeplink_id': deepLinkId // Assign value to key-value pair in query
            },
            ScanIndexForward: false
        };

        // Look for requested deeplink in DDB table
        docClient.query(params, (err, data) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(data.Items[0]); // Send deeplink to client
            }
        });
    });
});

// Request from client for deeplink
router.post('/deepLink', (req, res) => {
    try {
        let fetchlink = async function(){
            let dl = await generateDeepLink(req.body.videoFilePath, req.body.videoFilePath.replace('.mp4', '.jpg')); // Generate deeplink from media paths
                res.status(200).send(dl); // Send deeplink to client
        }
        fetchlink();
    }
    catch(err) {
        console.log(err);
        res.status(500).send(err)
    }
    
})

// Generates a unique deeplink from input media paths
function generateDeepLink(videoFile, imageFile) {
    return new Promise((resolve, reject) => {
        const uniqueId = Math.random().toString(24).slice(2);

        const line1 = videoFile.split('output/')[1].split('~')[0]; // Get line 1 user input
        const line2 = videoFile.split('output/')[1].split('~')[1].split('.mp4')[0]; // Get line 2 user input

        // Construct post request to DDB table
        const paramsObj = {
            TableName : process.env.DDB_TABLE || 'tec-demo', // Table in question
            Item: {
                deeplink_id: uniqueId, // Generated deeplink
                line1: (line1 === '') ? undefined : line1,
                line2: (line2 === '') ? undefined : line2,
                timestamp: new Date().getTime(),
                output_video: videoFile,
                output_image: imageFile
            }
        };

        // Post a newly generated deeplink to DDB table
        docClient.put(paramsObj, (err, data) => {
            if (err) {
                console.log(err);
                reject('');
            } else {
                resolve(uniqueId);
            }
        });
    });
}

module.exports = router;