
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
app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve client
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

/* ENCODER ROUTER */
const encoderRouter = require('./routes/encoder_router.js');
app.use('/encoder/', encoderRouter);

/* AWS ROUTER */
const awsRouter = require('./routes/aws_router.js');
app.use('/aws/', awsRouter);

const listener = app.listen(port, function() {
    console.log('Your app is running on port ' + listener.address().port);
});
