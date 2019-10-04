"use strict";

var videoContainer;

const onCaptured = new Event('captured');

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

    this.capturing = false;
    this.encoding = false;

    this.frames = 0;
    this.totalFrames = 0;

    this.captured = [];
  }

  beginCapture(fps){
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

  get photo(){
    let captured = this.captured;

    if(captured == null || captured.length <= 0) return;

    let frame = captured[captured.length-1].imageData; console.log(frame);
    var json = JSON.stringify(frame),
            blob = new Blob([json], {type: "image/octet-stream"}),
            url = window.URL.createObjectURL(blob);

    downloadPhoto.href = url;
    downloadPhoto.download = "screenshot.jpg";
    downloadPhoto.click();
  }

  get video(){
    let encoding = this.encoding;
    if(encoding)
      return;

    this.encoding = true;
    
    let captured = this.captured;
	  this.name = FIRSTNAME + "_" + LASTNAME;

    this.frames = 0; let tf = this.totalFrames = captured.length;
  
    for(let i = 0; i < tf; i++)
      this.sendFrame(captured[i].imageData);
    this.encoding = false;
  }

  sendFrame(frame){
    ++this.frames;

    let format = this.format;
    let frames = this.frames;
    let totalFrames = this.totalFrames;

    let encode = this.encode;
    let capturing = this.capturing;

	let name = this.name;
    
    $.ajax({
      type: 'POST',
      url: '/addFrame',
      data: {
        dat: frame,
        frame: (frames-1),
        format: format
      },
      
      success: function(){
        console.log("frames uploaded: ", frames, "/", totalFrames);
        
        if(frames >= totalFrames){
          encode(name);
          capturing = false;
        }
      },
      error: function(err){
        console.log("error uploading: ", err);
        --totalFrames;
      }
    });
  }
  
  
  encode(filename){
    filename = filename || "unnamed";
    
    $.ajax({
      type: 'POST',
      url: '/encode',
      data: {
        path: filename
      },
      
      success: function(data){
        console.log("Received " + data);

        let link = document.createElement('a');
            link.href = data;
            link.download = FIRSTNAME + "_" + LASTNAME + "_VALLEY.mp4";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
      }
    })
  }
}