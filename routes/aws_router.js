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

module.exports = router;