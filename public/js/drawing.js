"use strict";

//var bg;
//const video = document.getElementById("video");
//var vid;

class Drawing {
    constructor(){}

    init(camera, scene, fps){
        console.log("did it");

        canvas = createCanvas(camera.width, camera.height);
        /*vid = createVideo([video.src], function(){ 
            vid.loop(); 
            bg = new SceneImage(5, 5, -1, -1, vid, scene);
        });*/
        vid.hide();

        frameRate(fps);
    }

    render(camera){
        background(0);
        stroke(255);

        camera.render(canvas);
    }
}



