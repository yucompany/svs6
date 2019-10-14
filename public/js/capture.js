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
            let name = FIRSTNAME + '_' + LASTNAME;
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

    encodeFrames(frames){
        let encoded = [];

        function encodeFrame(frame, index){
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
            


        return frames.reduce((prev, curr, index) => {
            return prev
                .then(() => {
                    //console.log("encoded frame: " + index);
                    return encodeFrame(frames[index], index).then((frame) => {
                        encoded.push(frame);
                    });
                })
        }, Promise.resolve(encoded)) // Send all encoded frames to resolve
    }

    sendFrames() {
        let captured = this.captured;

        return this.encodeFrames(captured)
    
        .then((encodes) => {

            console.log("sending " + encodes.length);
            
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
            console.log("Error when sending frames: " + err);
        })
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