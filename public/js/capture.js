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

        let capturing = this.capturing;
        if(capturing)
            return;
        this.capturing = true;

        let f = this.format; let d = this.duration;
        saveFrames('frame', f, d, fps, function(arr) {
            this.captured = arr;
            this.capturing = false;

            console.log("Frames have been captured => ");
            console.log(arr);

            dispatchEvent(onCaptured); // Fire captured
        }.bind(this));
    }

    downloadPhoto(){
        let output = elements.output;
        if(output)
            save(output, FIRSTNAME + "_" + LASTNAME + ".jpg");  // Grab output buffer
    }

    photo() {
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

        console.log('Sending frames...');
        for (let i = 0; i < captured.length; i++) {
            await this.sendFrame(captured[i].imageData, i);
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

    async sendFrame(frame, i) {
        try {
            let format = this.format;

            const result = await fetch('/encoder/addFrame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dat: frame,
                    frame: (i + 1),
                    format: format
                })
            });

            return result;
        } catch (err) {
            console.log(err);
            console.log("error uploading: ", err);
        }
    }

    async encode(filename) {
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