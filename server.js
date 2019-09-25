
'use strict';



// init project
const express = require('express');

const bodyParser = require('body-parser');

const tmp = require('tmp');
const fs = require('fs');
const sprintf = require('sprintf').sprintf;

const cp = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg')
      ffmpeg.setFfmpegPath(ffmpegPath);


const app = express();

var tempDir = tmp.dirSync({ unsafeCleanup: true });
            console.log(tempDir.name);
var outputDir = __dirname + "/output";
    if(!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir);


// Using

app.use(express.static('public'))
   .use(express.static('assets'))
   .use(express.static('lib'))
   .use(express.static('output'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

app.use(function(req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// Getting

app.get('/', function(request, response) {
  console.log("hi");	
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/view', (req, res) => {
  res.sendFile(__dirname + '/output/svs6.mp4');
});

app.get('/test', (req, res) => {
  res.send("test");
});



// Posting

var name = '';

app.post('/submit-name', (req, res) => {
   name = req.body.username;
   res.send("shit");
});

app.post('/addFrame', (req, res) => {
  let frame = req.body.dat.replace(/^data:image\/(png|jpg);base64,/, "");
  let fName = sprintf('frame-%03d.' + req.body.format, parseInt(req.body.frame));
  let dir = tempDir.name + "/" + fName;

  console.log('received frame: ' + fName);
  
  fs.writeFile(dir, frame, 'base64', function(err){
    if(err)
        console.log("there was an error writing file: " + err);
    
    res.end();
  });
});

app.post('/encode', (req, res) => {
  let oldTemp = tempDir;
  console.log(outputDir + "/" + req.body.path + ".mp4");
  
  var proc = new ffmpeg()
      .input(tempDir.name + '/frame-%03d.jpg')
      .fps(24)
      .outputOptions([
        '-framerate 24',
        '-start_number 0',
        '-refs 5',
        '-c:v libx264',
        '-crf 18',
        '-b:v 1024',
        '-b:a 128k'
      ])
      .on('start', function(){
        console.log("Begin render!");
      })
      .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', function() {
        console.log('End render!');
        oldTemp.removeCallback();
      })
      .save(outputDir + '/' + req.body.path + '.mp4')

  tempDir = tmp.dirSync({unsafeCleanup: true});
  res.end();
});

// listen for requests :)
const listener = app.listen(3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
