"use strict";

/*const replay = document.getElementById("replay");
      replay.addEventListener("click", () => {
        reset();
      });
*/
const downloadPhoto = document.getElementById("dlPhoto");
const downloadVideo = document.getElementById("dlVideo");

    downloadPhoto.addEventListener("click", () => { 
      save(canvas, FIRSTNAME + "_" + LASTNAME + "_VALLEY.jpg"); 
    })

    downloadVideo.addEventListener("click", () => { 
      let vid = capture.video;
  });