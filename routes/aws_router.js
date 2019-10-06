'use strict';

const router = require('express').Router();
const AWS    = require('aws-sdk');
const s3     = new AWS.S3();
const fs     = require('fs');

router.post('/s3upload', (req, res) => {
    const videoFile = outputDir.split('/output')[0] + req.body.videoFilePath;

    try {
        fs.readFile(videoFile, (err, data) => {
            if (err) { throw err; }

            const base64data = new Buffer.from(data, 'binary');

            const params = {
                Bucket: 'social-sharing-install',
                Key: 'tec-demo' + req.body.videoFilePath,
                Body: base64data
            };

            console.log(`Uploading ${req.body.videoFilePath} to S3 bucket...`);
            s3.upload(params, function(err, data) {
                if (err) {
                    console.log('Error uploading to S3::\n', err);
                } else {
                    console.log('Upload complete!');
                    res.status(200).send(data);
                }
            });

        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
});

router.post('/s3cacheKey', (req, res) => {
    //Check if this key is already stored in S3.
    const s3Key = req.body.s3Key;
    console.log('tec-demo' + s3Key,);

    return new Promise((resolve, reject) => {
        const params = {
            Bucket: 'social-sharing-install',
            Key: 'tec-demo' + s3Key
        };

        s3.getObject(params, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send(err)
                reject();
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

module.exports = router;