
const express           = require('express');
const port              = process.env.PORT || 8080;
const bodyParser        = require('body-parser');
const tmp               = require('tmp');
const fs                = require('fs');
const sprintf           = require('sprintf').sprintf;
const ffmpegInstaller   = require('@ffmpeg-installer/ffmpeg');
const ffmpeg            = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = ffmpeg;


let tempDir = tmp.dirSync({ unsafeCleanup: true });
console.log(tempDir.name);

// Check for existence of output directory.
const outputDir = __dirname + '/output';

if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}


// Using
const app = express();

app.use(express.static('public'))
   .use(express.static('assets'))
   .use(express.static('lib'))
   .use(express.static('output'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

/* ROUTER */

// GETs
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

// POSTs
app.post('/addFrame', (req, res) => {
    const frame = req.body.dat.replace(/^data:image\/(png|jpg);base64,/, "");
    const fName = sprintf('frame-%03d.' + req.body.format, parseInt(req.body.frame));
    const dir = tempDir.name + "/" + fName;

    console.log('received frame: ' + fName);

    fs.writeFile(dir, frame, 'base64', function(err) {
        if(err) {
            console.log("there was an error writing file: " + err);
        }
        res.end();
    });
});

app.post('/encode', (req, res) => {
  let oldTemp = tempDir;

  console.log(outputDir + '/' + req.body.path + '.mp4');

  res.setHeader("Content-Type", "video/mp4");

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

const listener = app.listen(port, function() {
    console.log('Preview your app on port ' + listener.address().port);
});
