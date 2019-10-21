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
    this.encoded = [];
    }

    beginCapture(fps){
        capturing = true;
        this.captured = [];
        this.encoded = [];
    }

    addFrame(frame){
        this.captured.push(frame);
    }

    captureFrame(dt){
        return new Promise(function(res, rej){
           // setTimeout(function(){
                canvas.elt.toBlob(res, 'image/jpeg', .85);
           // }, dt*2);
        })
    }

    stopCapture(){
        prepareExports()
        .then(() => {
            console.log("Successfully prepared exports after capture! :-)");
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
            let f = FIRSTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');
            let l = LASTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');

            const fetchRequest = fetch('/encoder/screenshot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dat: buffer,
                    fileName: f + '~' + l + '.jpg'
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

            let f = FIRSTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');
            let l = LASTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');

            let name = f + '~' + l;
            console.log('Sending frames... ' + captured.length);

            this.sendFrames(captured)
            .then(() => {
                this.encode(name)
                .then((url) => {
                    resolve(url);
                })
            })
            .catch((err) => {
                reject(err);
            });
        })
    }

    encodeFrame(frame, index){
        return new Promise((resolve, reject) => {

            const reader = new FileReader();

                reader.onload = () => {
                    const dataUrl = reader.result;

                    let frame = {
                        dat: dataUrl,
                        index: index + 1
                    };

                    //console.log("wrote frame " + index);
                    resolve(frame);
                };

                reader.onerror = (err) => {
                    console.log('Issue reading file');
                    reject(err);
                };

                reader.readAsDataURL(frame);
        });
    }

    encodeFrames(frames){
        let encoded = [];

        return frames.reduce((prev, curr, index) => {
            return prev
                .then((frame) => {
                    if(frame != undefined)
                        this.encoded.push(frame);
                    return this.encodeFrame(frames[index], index);
                })
        }, Promise.resolve()) // Send all encoded frames to resolve
    }

    sendFrames() {
        let captured = this.captured;

        return this.encodeFrames(captured)
    
        .then(() => {
            return new Promise((resolve, reject) => {

                let encodes = this.encoded;

                console.log(encodes);
                console.log("sending " + encodes.length);

                TARGETPROGRESS += PHASES[1];
                
                const fetchRequest = fetch('/encoder/addFrames', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        frames: encodes
                    })
                });

                fetchRequest
                .then((response) => {
                    response.text()
                    .then((result) => {
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

            })
        
        })
        .catch((err) => {
            console.log("Error when sending frames: " + err);
        })
    }

    encode(filename) {
        return new Promise((resolve, reject) => {
            console.log('Begin encode');

            TARGETPROGRESS += PHASES[2];

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