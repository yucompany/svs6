"use strict";

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

    this.frames = 0;
    this.totalFrames = 0;
  }

  capture(fps){
    let capturing = this.capturing;
    if(capturing)
      return;
    
    this.capturing = true;    
    
    let f = this.format; let d = this.duration;
    saveFrames('frame', f, d, fps, function(arr) {
      this.frames = 0; 
      let tf = this.totalFrames = arr.length;
  
      for(let i = 0; i < tf; i++)
        this.sendFrame(arr[i].imageData);
    }.bind(this));
  }


  sendFrame(frame){
    ++this.frames;

    let format = this.format;
    let frames = this.frames;
    let totalFrames = this.totalFrames;

    let encode = this.encode;
    let capturing = this.capturing;
    
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
        console.log("Succesfully triggered encoding!");
      }
    })
  }
}