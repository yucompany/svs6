'use strict';

const router      = require('express').Router();
const AWS         = require('aws-sdk');
const s3          = new AWS.S3();
const docClient   = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
const fs          = require('fs');


router.post('/s3upload', (req, res) => {
    try {
        const videoFilePath = outputDir.split('/output')[0] + req.body.videoFilePath;
        const imageFilePath = outputDir.split('/output')[0] + req.body.imageFilePath;

        console.log(imageFilePath);

        // Now Upload Image
        fs.readFile(imageFilePath, (err, data) => {
            if (err) { throw err; }

            const base64data = new Buffer.from(data, 'base64');

            const params = {
                Bucket: process.env.AWS_BUCKET || 'social-sharing-install',
                Key: req.body.videoFilePath.replace('.mp4', '.jpg'),
                Body: base64data
            };

            console.log(`Uploading ${imageFilePath} to S3 bucket...`);
            s3.upload(params, async (err, data) => {
                if (err) {
                    console.log('Error uploading to S3::\n', err);
                } else {
                    console.log('Upload complete!');

                    // Now Upload Video
                    fs.readFile(videoFilePath, (err, data) => {
                        if (err) { throw err; }

                        const base64data = new Buffer.from(data, 'binary');

                        const params = {
                            Bucket: process.env.AWS_BUCKET || 'social-sharing-install',
                            Key: req.body.videoFilePath,
                            Body: base64data
                        };

                        console.log(`Uploading ${req.body.videoFilePath} to S3 bucket...`);
                        console.log('Generating deep link');

                        s3.upload(params, async (err, data) => {
                            if (err) {
                                console.log('Error uploading to S3::\n', err);
                            } else {
                                console.log('Upload complete!');
                                const deepLink = await generateDeepLink(req.body.videoFilePath, req.body.videoFilePath.replace('.mp4', '.jpg'));
                                res.status(200).send(deepLink);

                                console.log('Deleting image from temporary storage.');
                                fs.unlinkSync(imageFilePath);

                                console.log('Deleting video from temporary storage.');
                                fs.unlinkSync(videoFilePath);
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

router.post('/s3cacheKey', (req, res) => {
    return new Promise((resolve, reject) => {
        //Check if this key is already stored in S3.
        const s3Key = req.body.s3Key;

        const params = {
            Bucket: process.env.AWS_BUCKET || 'social-sharing-install',
            Key: s3Key
        };

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
                if (data.Body) {
                    res.status(200).send(true);
                } else {
                    res.status(200).send(false);
                }
                resolve();
            }
        });
    });
});

router.post('/processId', (req, res) => {
    //Check if this key is already stored in S3.
    const deepLinkId = req.body.deepLinkId;

    return new Promise((resolve, reject) => {
        const params = {
            TableName : process.env.DDB_TABLE || 'tec-demo',
            KeyConditionExpression: '#deeplink_id = :deeplink_id',
            ExpressionAttributeNames: {
                '#deeplink_id': 'deeplink_id'
            },
            ExpressionAttributeValues: {
                ':deeplink_id': deepLinkId
            },
            ScanIndexForward: false
        };

        docClient.query(params, (err, data) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(data.Items[0]);
            }
        });
    });
});

router.post('/deepLink', (req, res) => {
    try {
        let fetchlink = async function(){
            let dl = await generateDeepLink(req.body.videoFilePath, req.body.videoFilePath.replace('.mp4', '.jpg'));
                res.status(200).send(dl);   
        }
        fetchlink();
    }
    catch(err) {
        console.log(err);
        res.status(500).send(err)
    }
    
})

function generateDeepLink(videoFile, imageFile) {
    return new Promise((resolve, reject) => {
        const uniqueId = Math.random().toString(24).slice(2);

        const line1 = videoFile.split('output/')[1].split('~')[0];
        const line2 = videoFile.split('output/')[1].split('~')[1].split('.mp4')[0];

        const paramsObj = {
            TableName : process.env.DDB_TABLE || 'tec-demo',
            Item: {
                deeplink_id: uniqueId,
                line1: (line1 === '') ? undefined : line1,
                line2: (line2 === '') ? undefined : line2,
                timestamp: new Date().getTime(),
                output_video: videoFile,
                output_image: imageFile
            }
        };

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