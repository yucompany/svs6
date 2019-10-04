
const express           = require('express');
const port              = process.env.PORT || 8080;
const bodyParser        = require('body-parser');
const tmp               = require('tmp');
const fs                = require('fs');

global.tempDir = tmp.dirSync({ unsafeCleanup: true });

// Store all generated videos here.
global.outputDir = __dirname + '/output';

// Check for existence of output directory.
if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}
// Setup Express Server
const app = express();

app.use(express.static('public'))
   .use(express.static('assets'))
   .use(express.static('lib'))
   .use('/output', express.static('output'));

// Server options
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

<<<<<<< HEAD
// Serve client
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
=======


// Getting

app.get('/', function(request, response) {
  console.log("hello.");
  response.sendFile(__dirname + '/views/index.html');
});


// Posting

app.post('/screenshot', (req, res) => {
  let blob = req.body.dat;
  fs.writeFile(outputDir + "/screenshot.jpg", blob, 'binary', function(err){
    if(err){
      console.log(err);
      res.end();
    }
    else
      res.send('../output/screenshot.jpg');
  });
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
>>>>>>> 2120fa9b02f716ec245d7f511d84aa0affd16491
});
/* ENCODER ROUTER */
const encoderRouter = require('./routes/encoder_router.js');
app.use('/encoder/', encoderRouter);

<<<<<<< HEAD
/* AWS ROUTER */
const awsRouter = require('./routes/aws_router.js');
app.use('/aws/', awsRouter);
=======
let userdir;

app.post('/encode', (req, res) => {
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

        res.send('../output/' + req.body.path + '.mp4');
      })
      .run()

  tempDir = tmp.dirSync({unsafeCleanup: true});
});
>>>>>>> 2120fa9b02f716ec245d7f511d84aa0affd16491

const listener = app.listen(port, function() {
    console.log('Your app is running on port ' + listener.address().port);
});
