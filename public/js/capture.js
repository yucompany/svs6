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
            this.sendFrames()
            .then(() => {
                this.encode()
                .then(resolve)
                .catch(reject)
            })
            .catch(reject);
        });
    }

    sendFrames() {
        return new Promise((resolve, reject) => {
            const capturedFrames = this.captured;
            const storedFrames = [];
            
            const promise = new Promise((resolve, reject) => {
                capturedFrames.forEach((frame, index) => {
                    const reader = new FileReader();

                    reader.onload = () => {
                        const dataUrl = reader.result;
                        storedFrames.push({
                            dat: dataUrl,
                            index: index + 1,
                            format: this.format
                        });
                        if (index === capturedFrames.length - 1) resolve();
                    };

                    reader.onerror = (err) => {
                        console.log('Issue reading file');
                        reject(err);
                    };

                    reader.readAsDataURL(frame);
                });
            });

            promise.then(() => {
                resolve(storedFrames);

                let format = this.format;
                const fetchRequest = fetch('/encoder/addFrames', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        frames: storedFrames
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
            .catch(reject);
        });
    }

    encode() {
        return new Promise((resolve, reject) => {
            console.log('Begin encode');
            const filename = FIRSTNAME + '_' + LASTNAME;            

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