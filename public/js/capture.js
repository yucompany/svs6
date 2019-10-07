"use strict";

var videoContainer;

const onCaptured  = new Event("captured");

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
       /* if(capturing)
            captures.stop();

        console.log('did it');

        captures.start();
        capturing = true;*/

       
        capturing = true;
        this.captured = [];

        /*let f = this.format; let d = this.duration;
        saveFrames('frame', f, d, fps, function(arr) {
            this.captured = arr;
            this.capturing = false;

            console.log("Frames have been captured => ");
            console.log(arr);

            dispatchEvent(onCaptured); // Fire captured
        }.bind(this));*/
    }

    addFrame(frame){
        this.captured.push(frame);
    }

    captureFrame(call){
            canvas.elt.toBlob(call, 'image/jpeg', .85);
            //res(canvas.elt.toDataURL("image/jpeg"));
    }

    async stopCapture(){
        console.log(this.captured);
        capturing  = false;

        await this.video();
        console.log("finished video");
    }

    get photo(){
        let output = elements.output;
        if(output)
            save(output, FIRSTNAME + "_" + LASTNAME + ".jpg");  // Grab output buffer
    }

    getLastFrame() {
        const captured = this.captured;
        if (captured == null || captured.length <= 0) return;

        const frame = captured[captured.length-1].imageData;
        return frame;
    }

    async video() {
      /*  captures.save(async function(blob){
            const path = await this.sendTAR(blob);
            const result = await this.encode(FIRSTNAME + "_" + LASTNAME);

            console.log("Successfully encoded video from unzip tar!");

        }.bind(this));*/
        
        
        let captured = this.captured;

        this.name = FIRSTNAME + "_" + LASTNAME;

        console.log('Sending frames... ' + captured.length);
        for (let i = 0; i < captured.length; i++) {
            await this.sendFrame(captured[i], i);
        }
        
        
        await this.encode(this.name);

        return `/output/${this.name}.mp4`;
    }

    async sendTAR(tar){
        let formdata = new FormData();
        formdata.append('tarz', tar);

        console.log(tar);

        try {
            const result = await fetch('/encoder/sendTAR', {
                method: 'POST',
                body: formdata
            });

            return result;
        } catch (err) {
            console.log(err);
            console.log("error uploading: ", err);
        }
    }

    sendFrame(frame, i) {
        let format = this.format;

        return new Promise(function(res, rej) {
            var reader = new FileReader();

            reader.onload = function(){
                var dataUrl = reader.result;
                res(dataUrl);
            }
            reader.readAsDataURL(frame);
        }).then(function(r){
            return fetch('/encoder/addFrame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dat: r,
                    frame: (i + 1),
                    format: format
                })
            });
        })
        .then(function(x){
            console.log(x);
            return new Promise(function(a, b){
                a(x);
            })
        })
    }

    /*async sendFrame(frame, i) {
        
        let formdata = new FormData();
        let id = "frame-" + pad(i, 7) + ".png";

        console.log("sent " + id);

        var reader = new FileReader();
        reader.readAsDataURL(frame); 
        reader.onloadend = function() {
            var base64data = reader.result;                
            console.log(base64data);
        }

        formdata.append('frame', frame, id);

        try {
            let format = this.format;

            const result = await fetch('/encoder/addFrame', {
                method: 'POST',
                body: formdata
            });

            return "pinged " + result;
        } catch (err) {
            console.log(err);
            console.log("error uploading: ", err);
        }
    }*/

    async encode(filename) {
        console.log("encded")

        try {
            const result = await fetch('/encoder/encode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: filename
                })
            });

            const response = await result.text();

            console.log("Done generating " + response);

            return response;
        } catch (err) {
            console.log('Encoding error::\n', err);
        }
    }
}