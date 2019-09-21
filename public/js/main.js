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
const capture = new Capture("svs6", 10, 'jpg'); // Duration of capture at framerate

function setup(){
  canvas = createCanvas(camera.width, camera.height);
    canvas.parent(canvasHolder);
    canvas.class('mw-100 h-auto');

  build();

  background(0);
  stroke(255);

  frameRate(framerate);
}

function build(){
    let objectLayer = new SceneLayer(camera);

    for(let i = 0; i < 50; i++){
      let o = new SceneObject(Math.floor(Math.random() * scene.width), Math.floor(Math.random() * scene.height), scene);
      objects.push(o);
      objectLayer.add(o);
    }

    drawing.addLayer(objectLayer);

    let opticLayer = new SceneLayer(camera);
}

var t0 = Date.now();
function update(dt) {
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
    camera.zoom(z * .01);

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


const saveButton = document.getElementById("saveButton");
      saveButton.addEventListener("click", () => capture.capture(framerate));

const submitButton = document.getElementById()