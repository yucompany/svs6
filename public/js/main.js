"use strict";

// CONTROLS

var l = false, r = false, u = false, d = false, zi = false, zo = false;
window.addEventListener("keydown", function(e){
  let key = e.key;
  
  if(key == "a") l = true;
  if(key == "d") r = true;
  if(key == "s") d = true;
  if(key == "w") u = true;
  if(key == "z") zo = true;
  if(key == "x") zi = true;
});

window.addEventListener("keyup", function(e){
  let key = e.key;
  
  if(key == "a") l = false;
  if(key == "d") r = false;
  if(key == "s") d = false;
  if(key == "w") u = false;
  if(key == "z") zo = false;
  if(key == "x") zi = false;
});

/* * * ** * * * * * * * *  * * * * * * * * * * * * * * *  */

const framerate = 24;

const scene = new Scene(2667, 1500);
const camera = new Camera(0, 0, 1280, 720, scene);

var canvas; var canvasHolder = 'canvas-holder';
var objects = [];

const drawing = new Drawing();
      var blends = {}

const capture = new Capture("svs6", 10, 'jpg'); // Duration of capture at framerate

var assets = {
  background : "",
  letters: {
    "A" : [],
    "C" : [],
    "O" : []
  }
}

function preload(){
  let bg = assets.background = createVideo(['../../assets/videos/bg.mp4'], () => {
      bg.loop();
      bg.volume(0);
  });
  bg.hide();

  let letterPath = "../../assets/images/letters";
  let letters = assets.letters;

  let letterFramePath = "";
  for(let i = 0; i < 42; i++){
    letterFramePath = "A/A_512_" + (i+"").padStart(5, "0") + ".png";
    letters["A"].push(loadImage(letterPath + "/" + letterFramePath));
  }
}

function setup(){
  canvas = createCanvas(camera.width, camera.height);
    canvas.parent(canvasHolder);
    canvas.class('mw-100 h-auto');

  build();
  blending();

  background(0);
  stroke(255);

  frameRate(framerate);
}

var mesh;
    let meshOrigin = {x: 480, y:-360};
    let meshOffset = .67;

function build(){
    let bgLayer = new SceneLayer(camera);
      let bg = new SceneVideo(0, 0, 1, camera.width, camera.height, assets.background, scene);
      objects.push(bg);
      bgLayer.add(bg);

    let objectLayer = new SceneLayer(camera);

    let letters = assets.letters;
    let A = mesh = new SceneImageSequence(0, 0, 1, -1, -1, letters["A"], scene);
        objects.push(A);
        objectLayer.add(A);

    /*let o = mesh = new SceneImage(0, 0, 5, -1, -1, assets.letter, scene);
            objects.push(o);
            objectLayer.add(o);*/

    drawing.addLayer(bgLayer);
    drawing.addLayer(objectLayer);
}

function blending(){
    blends["MULTIPLY"] = MULTIPLY;
    blends["DIFFERENCE"] = DIFFERENCE;
}


var sequence = 0;

var t0 = Date.now();
function update(dt) {
    dt /= 1000;

    let dx = 0;
    if(r) dx += 1;
    if(l) dx -= 1;
    
    let dy = 0;
    if(u) dy -= 1;
    if(d) dy += 1;
    
    camera.x = clamp(camera.x + (dx * 10), 0, scene.width - camera.width); 
    camera.y = clamp(camera.y + (dy * 10), 0, scene.height - camera.height);
    
    let z = 0;
    if(zi) z += (dt);
    if(zo) z -= (dt);
    camera.zoom(z);

    let bg = assets.background;
    
    let seq = sequence = clamp(bg.time() / 7.4583, 0, 1);
            meshOffset = lerp(.66, .97, seq);
    
    mesh.x = (meshOffset * meshOrigin.x) + lerp(744, 117, seq) ;
    mesh.y = (meshOffset * meshOrigin.y) + lerp(262, 713, seq) ;
    mesh.scale = meshOffset*.67;

    drawing.render(camera);
};


function render(){
  requestAnimationFrame(render);
  
  var t1 = Date.now();
  let dt = (t1 - t0);

  update(dt);
  t0 = t1;
}
// Trigger render loop here, split fps between draw and update
var init = false; function draw() { if(!init){render();init=true;} }