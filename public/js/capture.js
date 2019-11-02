"use strict";


var PHOTOURL = "";
var VIDEOURL = "";

const onQueue = new Event("queued");


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
            let url = canvas.elt.toDataURL("image/jpeg", .92);
            res(url);
        })
    }

    stopCapture(){
        this.generate()
        .then(() => {
            dispatchEvent(onQueue);
        })

       /* prepareExports()
        .then(() => {
            //console.log("Successfully prepared exports after capture! :-)");
            dispatchEvent(onEnd);
        });*/
    }

    loadFrame(frame){
        return new Promise((resolve, reject) => {
            let img = new Image;
        
            img.onload = function(){
                resolve(img);
            }
            img.src = frame;
        })
    }

    generate() {
        //return this.encodeFrames(this.captured)
       // .then(() => {
            return new Promise((resolve, reject) => {
                let frames = this.captured;
                frames.reduce((prev, curr, index) => {
                    return prev
                        .then((frame) => {
                            if(frame != undefined) 
                                previews.push(frame);
                            return this.loadFrame(frames[index]);
                        })
                        .catch((err) => {
                            reject(err);
                        })
                }, Promise.resolve()) // Send all encoded frames to resolve
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                })
            })
        //}) 
        /*

        return new Promise((resolve, reject) => {
            let captured = this.captured;

            let f = FIRSTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');
            let l = LASTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');

            let name = f + '~' + l;
            console.log('Generating...  ' + name);

            this.encodeFrames(captured)
            .then(() => {

                let encodes = this.encoded;
                //TARGETPROGRESS += PHASES[1];
                
                const fetchRequest = fetch('/encoder/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        frame: encodes[encodes.length-1],
                        frames: encodes
                    })
                });

                fetchRequest
                .then((url) => {
                    url.text()
                    .then((result) => {
                        //TARGETPROGRESS += PHASES[2];
                        
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
            .catch((err) => {
                reject(err);
            });
        })*/
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
}