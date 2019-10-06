"use strict";

const redo = document.getElementById("redo");
      redo.addEventListener("click", () => {
        reset();
      });

const replay = document.getElementById("replay");
      replay.addEventListener("click", () => {
        restart();
      });

const downloadPhoto = document.getElementById("dlPhoto");
const downloadVideo = document.getElementById("dlVideo");

    downloadPhoto.addEventListener("click", () => { 
      let photo = capture.photo;
    })

    downloadVideo.addEventListener("click", async function(){ 
        // Encode video
      console.log('Video now encoding to .mp4');
      const fileName = await capture.video();
      console.log({fileName});
      // Get filename
      if (fileName) {
          console.log('MS: Initiating S3 upload now that video has been generated.');
          await beginUploadToS3(fileName);
      }
  });

  const title = document.getElementById("titlecard");
  const submit = document.getElementById("submission");
  const exporting = document.getElementById("exports");

      
  const updateUIVisibility = function(e, visible){
    if(e == null) return;

    if(visible){
      if(e.classList.contains("shown")) return;

      if(e.classList.contains("hidden"))
        e.classList.remove("hidden");

      e.classList.add("shown");
    }
    else{
      if(e.classList.contains("hidden")) return;

      if(e.classList.contains("shown"))
        e.classList.remove("shown");

      e.classList.add("hidden");
    }
  }

  addEventListener('initialized', () => {
    updateUIVisibility(title, false);
    updateUIVisibility(submit, false);
  });

  addEventListener('captured', () => {
    updateUIVisibility(exporting, true);
  });

  addEventListener('resetted', () => {
    updateUIVisibility(exporting, false);
    updateUIVisibility(replay, false);

    // Clear form
    nameform.reset();

    setTimeout(function(){
      updateUIVisibility(submit, true);
    }, 1000);
  })

  addEventListener('restarted', () => {
    updateUIVisibility(replay, false);
  });

  addEventListener('ended', () => {
    updateUIVisibility(replay, true);
  });