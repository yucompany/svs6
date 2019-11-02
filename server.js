
const express           = require('express');
const port              = process.env.PORT || 8080;
const bodyParser        = require('body-parser');
const tmp               = require('tmp');
const fs                = require('fs');
const cluster           = require('cluster');
const session           = require('express-session')

// Setup Express Server
const app = express();

app.use(express.static('public'))
   .use(express.static('assets'))
   .use(express.static('lib'))

// Serve client
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

/* ENCODER ROUTER */
//const encoderRouter = require('./routes/encoder_router.js');
//app.use('/encoder/', encoderRouter);

/* AWS ROUTER */
//const awsRouter = require('./routes/aws_router.js');
//app.use('/aws/', awsRouter);

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