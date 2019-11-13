
const express           = require('express');
const port              = process.env.PORT || 8080;
const bodyParser        = require('body-parser');
const tmp               = require('tmp');
const fs                = require('fs');
const cluster           = require('cluster');
const session           = require('express-session')

// Store all generated videos here
global.outputDir = __dirname + '/output'; // Stores photos and videos
global.baseDir = __dirname; // Path to root directory

// Check for existence of output directory.
if(!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir); // Create directory if not exists
}
// Setup Express Server
const app = express();

// Assign static assets
app.use(express.static('public'))
   .use(express.static('assets'))
   .use(express.static('lib'))
   .use('/output', express.static('output'));

// Server options, dictate body size sent from client
app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Create new session for each client
app.use(session(
	{
		'secret' : '832646d6dsvggvssdd76ge',
		'dir' : ''
	}
))

// Serve index.html
app.get('/', (req, res) => {
	let dir = req.session.dir = (tmp.dirSync({ unsafeCleanup: true })).name // Create temporary folder for session
    res.sendFile(__dirname + '/views/index.html');
});

/* ENCODER ROUTER */
const encoderRouter = require('./routes/encoder_router.js');
app.use('/encoder/', encoderRouter);

/* AWS ROUTER */
const awsRouter = require('./routes/aws_router.js');
app.use('/aws/', awsRouter);

// Reboot server automatically if crashes
if (cluster.isMaster) {
	cluster.fork();

	cluster.on('exit', function(deadWorker, code, signal) {
		// Restart the worker
		const worker = cluster.fork();

		// Note the process IDs
		const newPID = worker.process.pid;
		const oldPID = deadWorker.process.pid;

		// Log the event
		console.log('worker '+oldPID+' died.');
		console.log('worker '+newPID+' started.');
	});
} else {
    const listener = app.listen(port, function() {
        console.log('Your app is running on port ' + listener.address().port);
    });
}