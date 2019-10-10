"use strict";


var PHOTOURL = "";
var VIDEOURL = "";


class Capture {
    constructor(name, duration, format){
    this.name = name;

    if(duration)
        this.duration = duration;
    else
        this.duration = 1;

    if(format)
        this.format = format;
    else
        this.format = 'jpg';

    //this.capturing = false;
    this.encoding = false;

    this.frames = 0;
    this.totalFrames = 0;

    this.captured = [];
    }

    beginCapture(fps){
        capturing = true;
        this.captured = [];
    }

    addFrame(frame){
        this.captured.push(frame);
    }

    captureFrame(dt){
        return new Promise(function(res, rej){
            setTimeout(function(){
                canvas.elt.toBlob(res, 'image/jpeg', .85);
            }, dt);         
        })
    }

    stopCapture(){
        capturing  = false;

        this.photo()
        .then((photoURL) => {
            console.log("Successfully created photo..." + photoURL);

            PHOTOURL = photoURL;
        });


        fetchVideo()
        .then((videoURL) => {
            console.log("Succesfully fetched video..." + videoURL);
            
            VIDEOURL = videoURL;
            dispatchEvent(onEnd);
        });
    }

    photo() {
        return new Promise((resolve, reject) => {
            const captured = this.captured;
            const reader = new FileReader();

            reader.onload = () => {
                const dataUrl = reader.result;
                resolve(dataUrl);
            };

            reader.onerror = (err) => {
                console.log('Issue reading file');
                reject(err);
            };

            reader.readAsDataURL(captured[captured.length-1]);
        })
        .then((buffer) => {
            const fetchRequest = fetch('/encoder/screenshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dat: buffer,
                    fileName: FIRSTNAME + '_' + LASTNAME + '.jpg'
                })
            });

            return fetchRequest;
        })
        .then((response) => {
            return response.text();
        })
        .then((result) => {
            console.log(result);
            return new Promise(function(res, rej){
                res(result);
            })
        })
    }

    video() {
        return new Promise((resolve, reject) => {
            let captured = this.captured;
            let promises = [];

            for (let i = 0; i < captured.length; i++) 
                promises.push(this.sendFrame(captured[i], i));

            this.name = FIRSTNAME + '_' + LASTNAME;

            console.log('Sending frames... ' + captured.length);

            Promise.all(promises)
            .then(() => {
                this.encode(this.name)
                .then((url) => {
                    resolve(url);
                })
            })
            .catch((err) => {
                reject(err);
            });
        });
    }

    sendFrame(frame, i) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const dataUrl = reader.result;
                resolve(dataUrl);
            };

            reader.onerror = (err) => {
                console.log('Issue reading file');
                reject(err);
            };

            reader.readAsDataURL(frame);
        })
        .then((buffer) => {
            let format = this.format;
            const fetchRequest = fetch('/encoder/addFrame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dat: buffer,
                    frame: (i + 1),
                    format: format
                })
            });

            fetchRequest
            .then((response) => {
                response.text()
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    console.log('Error parsing response');
                    throw err;
                });
            })
            .catch((err) => {
                console.log('Error communicating with server.');
                throw err;
            });
        })
        .catch((err) => {
            console.log('Error reading frame for Photo download.');
            throw err;
        });
    }

    encode(filename) {
        return new Promise((resolve, reject) => {
            console.log('Begin encode');
            const fetchResponse = fetch('/encoder/encode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: filename
                })
            });

            fetchResponse
            .then((response) => {
                response.text()
                .then((result) => {
                    console.log('Done encoding ' + result);
                    resolve(result);
                })
                .catch((err) => {
                    console.log('Error parsing response');
                    reject(err);
                });
            })
            .catch((err) => {
                console.log('Error communicating with server.');
                reject(err);
            });
        });
    }
}