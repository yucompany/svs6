
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

app.use(express.static('public'));
app.use(express.static('output'));

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
  response.sendFile(__dirname + 'awdawdw.html');
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
   res.end();
});

app.post('/addFrame', (req, res) => {
  console.log("received frame" + req.body.frame);

  let frame = req.body.png.replace(/^data:image\/png;base64,/, "");
  let fName = sprintf('frame-%03d.png', parseInt(req.body.frame));
  let dir = tempDir.name + "/" + fName;
  
  fs.writeFile(dir, frame, 'base64', function(err){
    if(err)
        console.log("there was an error writing file: " + err);
    
    res.end();
  });
});

app.post('/encode', (req, res) => {
  let oldTemp = tempDir;
  
  console.log(req.body);
  
  console.log("Begin render...");
  var ffmpeg = cp.spawn('ffmpeg', [ '-y',
    '-framerate', '30',
    '-start_number', '0',
    '-i', 'frame-%03d.png',
    '-refs', '5',
    '-c:v', 'libx264',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-s', '640x480',
    '-b:v', '1024',
    '-b:a', '128k',
                                   
    outputDir + "/" + req.body.path + ".mp4"
  ], {
    cwd: oldTemp.name,
    stdio: 'inherit'
  });
  ffmpeg.on('close', function(code) {
    console.log('Finished rendering video. You can find it at: ' + outputDir + '/' + req.body.path + '.mp4');
    oldTemp.removeCallback();
  });
  
  tempDir = tmp.dirSync({unsafeCleanup: true});
  res.end();
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// listen for requests :)
const listener = app.listen(3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
