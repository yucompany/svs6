"use strict";

var capturing = false;
var captureArr = [];
var captureTime = 10;

var frames = 0;
var totalFrames = 0;

const capture = function(){
  if(capturing)
    return;
  
  capturing = true;    
  saveFrames('frame', 'jpg', captureTime, framerate, function(arr) {
    frames = 0; totalFrames = arr.length;
    captureArr = arr;

    for(let i = 0; i < totalFrames; i++)
      sendFrame(arr[i].imageData);
  });
}


const sendFrame = function(frame){
    ++frames;
    
    $.ajax({
      type: 'POST',
      url: '/addFrame',
      data: {
        jpg: frame,
        frame: frames
      },
      
      success: function(){
        console.log("frames uploaded: ", frames, "/", totalFrames);
        
        if(frames >= captureArr.length-1){
          encode("svs6");
          capturing = false;
        }
      },
      error: function(err){
        console.log("error uploading: ", err);
        --totalFrames;
      }
    });
  }
  
  var encoded = false;
  const encode = function(filename){
    filename = filename || "unnamed";
  
    if(encoded)
      return;
    encoded = true;
    
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