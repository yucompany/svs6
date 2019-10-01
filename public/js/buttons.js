"use strict";

const downloadPhoto = document.getElementById("dlPhoto");
const downloadVideo = document.getElementById("dlVideo");

    downloadPhoto.addEventListener("click", () => { save(canvas, "screen.jpg"); })

    downloadVideo.addEventListener("click", () => { 
        let vid = capture.video;
        console.log(vid);

        downloadVideo.href = vid;
    });