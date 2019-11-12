"use strict";


var PHOTOURL = ""; // Path to global photo url (AWS)
var VIDEOURL = ""; // Path to global video url (AWS)


/*     
    Class that drives the capture of intro
        1. Captures frames from canvas
        2. Bundles frames into array
        3. Sends bundle to server to be encoded
        4. Resolves with path for video in temp storage
*/

class Capture {
    constructor(name, duration, format){
        this.name = name; // Name of media file

        if(duration)
            this.duration = duration; // Duration of video
        else
            this.duration = 1;

        if(format)
            this.format = format; // File extension for frames
        else
            this.format = 'jpg';

        //this.capturing = false;
        this.encoding = false; // In the process of encoding?

        this.frames = 0;
        this.totalFrames = 0;

        this.captured = [];  // Raw frames captured
        this.encoded = [];  // Encoded frame URLs
    }

    // Clear out previous sequence and begin capture
    beginCapture(fps){
        capturing = true;
        this.captured = [];
        this.encoded = [];
    }

    // Adds captured frame to sequence
    addFrame(frame){
        this.captured.push(frame);
    }

    // Returns canvas image as blob
    captureFrame(dt){
        return new Promise(function(res, rej){
           // setTimeout(function(){
                canvas.elt.toBlob(res, 'image/jpeg', .85);
           // }, dt*2);
        })
    }

    // On stop capture immediately prepare to retrieve video (AWS) or encode
    stopCapture(){
        prepareExports()
        .then(() => {
            //console.log("Successfully prepared exports after capture! :-)");
            dispatchEvent(onEnd); // Has retrieved encoded video
        });
    }

    generate() {
        return new Promise((resolve, reject) => {
            let captured = this.captured;

            // Format first and last name in acceptable format for URL --> remove whitespace, # --> . , + --> *
            let f = FIRSTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');
            let l = LASTNAME.trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*');

            let name = f + '~' + l;  // Combine first and last
            console.log('Generating...  ' + name);

            this.encodeFrames(captured)  // Encode all frames in captured array
            .then(() => {

                let encodes = this.encoded;
                TARGETPROGRESS += PHASES[1]; // Increment progress bar
                
                // Make fetch request to express to encode frames to video
                const fetchRequest = fetch('/encoder/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name, // File name
                        frame: encodes[encodes.length-1], // Last frame for image export
                        frames: encodes // Frame sequence to be encoded
                    })
                });

                fetchRequest
                .then((url) => {
                    url.text()
                    .then((result) => {
                        TARGETPROGRESS += PHASES[2]; // Increment progress bar
                        
                        resolve(result); // Return temp path to video file
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
        })
    }

    // Constructs a data URL for a frame to be added to encode sequence
    encodeFrame(frame, index){
        return new Promise((resolve, reject) => {

            const reader = new FileReader();

                reader.onload = () => {  // Reader has finished constructing URL
                    const dataUrl = reader.result;

                    let frame = {
                        dat: dataUrl,
                        index: index + 1
                    };

                    //console.log("wrote frame " + index);
                    resolve(frame); // Return frame
                };

                reader.onerror = (err) => {
                    console.log('Issue reading file');
                    reject(err);
                };

                reader.readAsDataURL(frame);
        });
    }

    // Returns promise chain for encoding all frames
    encodeFrames(frames){
        let encoded = [];

        return frames.reduce((prev, curr, index) => {
            return prev
                .then((frame) => {
                    if(frame != undefined)  // If frame is not undefined, add to encoded sequence
                        this.encoded.push(frame);
                    return this.encodeFrame(frames[index], index);
                })
        }, Promise.resolve()) // Send all encoded frames to resolve
    }
}