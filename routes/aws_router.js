'use strict';

const router = require('express').Router();
const AWS    = require('aws-sdk');
const s3     = new AWS.S3();

router.post('/s3upload', (req, res) => {
    const videoFile = req.body.videoFilePath;
    console.log(videoFile);
    process.exit();

    try {
        const params = {
            Bucket: 'social-sharing-install',
            Key: '/tec-demo/' + videoFile,
            Body: videoFile
        };

        s3.upload(params, function(err, data) {
            console.log(err, data);
        });
    } catch (err) {
        res.status(500).send(err)
    }
});

module.exports = router;