"use strict";

//const saveButton = document.getElementById("saveButton");
 //     saveButton.addEventListener("click", () => capture.capture(framerate));


const downloadPhoto = document.getElementById("dlPhoto");
const downloadVideo = document.getElementById("dlVideo");

    downloadPhoto.addEventListener("click", () => { save(canvas, "screen.jpg"); })

    downloadVideo.addEventListener("click", () => { 
      let vid = capture.video;
  });