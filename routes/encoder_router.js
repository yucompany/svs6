'use strict';

const router            = require('express').Router();
const ffmpegInstaller   = require('@ffmpeg-installer/ffmpeg');
const ffmpeg            = require('fluent-ffmpeg');
const sprintf           = require('sprintf');
const fs                = require('fs');
const tmp               = require('tmp');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// POSTs
router.post('/addFrame', (req, res) => {
    const frame = req.body.dat.replace(/^data:image\/(png|jpg);base64,/, "");
    const fName = sprintf('frame-%03d.' + req.body.format, parseInt(req.body.frame));
    const dir = tempDir.name + "/" + fName;

    console.log('received frame: ' + fName);

    fs.writeFile(dir, frame, 'base64', (err) => {
        if (err) {
            console.log('there was an error writing file: ' + err);
        }
        res.end();
    });
});

router.post('/screenshot', (req, res) => {
    let blob = req.body.dat;
    fs.writeFile(outputDir + "/screenshot.jpg", blob, 'binary', function(err){
      if(err){
        console.log(err);
        res.end();
      }
      else
        res.send('/output/screenshot.jpg');
    });
});

router.post('/encode', (req, res) => {
    let oldTemp = tempDir;

    console.log(outputDir + '/' + req.body.path + '.mp4');

    res.setHeader("Content-Type", "video/mp4");

    var proc = new ffmpeg()
        .input(tempDir.name + '/frame-%03d.jpg')
        .fps(15)
        .outputOptions([
          '-framerate 15',
          '-start_number 0',
          '-refs 5',
          '-c:v libx264',
          '-crf 18',
          '-b:v 1024',
          '-b:a 128k'
        ])
        .output(outputDir + '/' + req.body.path + '.mp4')
        .on('start', function(){
          console.log("Begin render!");
        })
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('End render!');
          oldTemp.removeCallback();

          console.log('/output/' + req.body.path + '.mp4');

          res.send('/output/' + req.body.path + '.mp4');
        })
        .run()

    tempDir = tmp.dirSync({unsafeCleanup: true});
});

module.exports = router;