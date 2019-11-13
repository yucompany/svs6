'use strict';

const express           = require('express');
const router            = express.Router();
const ffmpegInstaller   = require('@ffmpeg-installer/ffmpeg');
const ffmpeg            = require('fluent-ffmpeg');
const sprintf           = require('sprintf');
const fs                = require('fs');
const fse               = require('fs-extra')
const tmp               = require('tmp');

var tempDir = tmp.dirSync({ unsafeCleanup: true }); // Create temporary directory to write frames to

ffmpeg.setFfmpegPath(ffmpegInstaller.path); // Set the install path for FFMPEG

// Writes individual frame from sequence array to temp dir
function writeFrameToDisk(fr, path){
  return new Promise((resolve, reject) => {
      const frame = fr.dat.replace(/^data:image\/(png|jpeg);base64,/, ""); // Clear appended information from data url
      const fName = sprintf('frame-%03d.jpg', parseInt(fr.index)); // Create name from frame index
      const dir = path + "/" + fName; // Path to frame

      fs.writeFile(dir, frame, 'base64', (err) => { // Write frame to disk
        if (err) {
          console.log('there was an error writing file: ' + err);
          reject(err);
        }
        else {
          console.log("successfully wrote frame" + fr.index + " to disk");
          resolve();
        }
      });
  })
}

// Write final frame of sequence array to output dir
function writeScreenshot(name, frame){
  console.log("SCREENSHOT");

  const fr = frame.dat.replace(/^data:image\/(png|jpeg);base64,/, ""); // Clear appended information from data url
  const dir = outputDir + '/' + name; // Path to screenshot

  fs.writeFile(dir, fr, 'base64', (err) => { // Write screenshot to output dir
    if (err)
      console.log('there was an error writing file: ' + err);
  });
}

// Encodes video from sequence array, primary route for generation of videos
router.post('/generate', (req, res) => {
  let frames = req.body.frames; // Fetch sequence array

  console.log('FRAMES: ');
  let dir = req.session.dir; // Get temp dir for session
  console.log("write to: " + dir);

  // Returns promise chain, write all frames to temp dir
  frames.reduce((prev, next, index) => {
      console.log("f" + index);

      return prev
        .then(() => {
          return writeFrameToDisk(next, dir); // Write frame
        })
  }, Promise.resolve())

  .then(() => { // Successfully wrote all frames to temp dir
    console.log("wrote all frames to disk");
    writeScreenshot(req.body.name + '.jpg', req.body.frame); // Write screenshot (final frame of sequence) to output dir

    let oldTemp = req.session.dir; // Assign current temp dir

    console.log("ENCODE")

    // Encoding process created here
    var proc = new ffmpeg()
        .input(req.session.dir + '/frame-%03d.jpg').inputFPS(12) // Get folder of frames in temp dir as source
        .outputOptions([ // Output options for encoded video
          '-framerate 12', // Framerate 
          '-start_number 0', // Start frame
          '-refs 5', // # of reference frames
          '-c:v libx264', // 'H264' encode
          '-crf 23', // Quality
          '-b:v 2500' // Bitrate
        ])
        .output(outputDir + '/' + req.body.name + ".mp4") // Where to send encoded video
        .on('start', function(){
          console.log("Begin render!");
        })
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('End render!' + '/output/' + req.body.name + ".mp4");
          
          fse.emptyDirSync(oldTemp); // Clear out temp dir
          res.status(200).send('/output/' + req.body.name + ".mp4"); // Send video file path to client
        })
        .run()

        req.session.dir = (tmp.dirSync({unsafeCleanup: true})).name; // Create new temp dir for subsequent encode request
  })
  .catch((err) => {
    console.log(err);
  });
})

module.exports = router;