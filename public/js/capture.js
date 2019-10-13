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

/*
    function asyncFunc(e) {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(e), e * 1000);
        });
      }
      
      const arr = [1, 2, 3];
      let final = [];
      
      function workMyCollection(arr) {
        return arr.reduce((promise, item) => {
          return promise
            .then((result) => {
              console.log(`item ${item}`);
              return asyncFunc(item).then(result => final.push(result));
            })
            .catch(console.error);
        }, Promise.resolve());
      }
      
      workMyCollection(arr)
        .then(() => console.log(`FINAL RESULT is ${final}`));
        */


   

    video() {
        let captured = this.captured;
        console.log('Sending frames... ' + captured.length);
        
        return this.sendFrames(captured)
        .then(() => {
            return new Promise(function(resolve, reject){
                let name = FIRSTNAME + '_' + LASTNAME;
                
                this.encode(name)
                .then((url) => {
                    resolve(url);
                })
                .catch((err) => {
                    reject(err);
                })
            }.bind(this))
            
        })

    }

    sendFrames(frames){

        console.log("shit");

        return new Promise((res, rej) => {

            let sent = 0;
            let sending = false;

            function onSentFrame(frame){
                sending = false;
                ++sent;
            }
            
            while(sent <= frames.length){
                if(!sending){
                    if(sent == frames.length){
                        res();
                        break;
                    }
                    else {
                        console.log("sent frame: " + sent);
                        this.sendFrame(frames[sent], sent, onSentFrame);
                        sending = true;
                    }
                }
            }

        });
        
    }

    sendFrame(frame, i, callback) {

        function onFailRead(err){
            console.log('Issue reading file ' + err);
        }

        function onSuccessRead(url){
            const fetchRequest = fetch('/encoder/addFrame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dat: buffer,
                    frame: (i + 1),
                    format: format
                })
            });

            console.log(url + "hahhaah")

            fetchRequest
            .then((response) => {
                response.text()
                .then((result) => {
                    console.log("ended frame-" + i);
                    callback(result);
                })
                .catch((err) => {
                    console.log('Error parsing response');
                    console.log(err);
                });
            })
            .catch((err) => {
                console.log('Error communicating with server.');
                console.log(err);
            });
        }
        
        const reader = new FileReader();
        reader.onload = () => {
            console.log('caigjt');
            const dataUrl = reader.result;
            onSuccessRead(dataUrl);
        };
        reader.onerror = (err) => { onFailRead(err); };

        reader.readAsDataURL(frame);
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