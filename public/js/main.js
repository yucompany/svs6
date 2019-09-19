"use strict";

const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", () => capture);

// CONTROLS

var l = false, r = false, u = false, d = false;
window.addEventListener("keydown", function(e){
  let key = e.key;
  
  if(key == "a") l = true;
  if(key == "d") r = true;
  if(key == "s") d = true;
  if(key == "w") u = true;
});

window.addEventListener("keyup", function(e){
  let key = e.key;
  
  if(key == "a") l = false;
  if(key == "d") r = false;
  if(key == "s") d = false;
  if(key == "w") u = false;
});


const framerate = 24;

const scene = new Scene(1080, 1080);
const camera = new Camera(0, 0, 640, 640, scene);

var canvas;
var objects = [];

const drawing = new Drawing();

function init(){
    //drawing.init(camera, scene, framerate);
    build();
}

function setup(){
  canvas = createCanvas(camera.width, camera.height);
  frameRate(framerate);
}

function build(){
    for(let i = 0; i < 50; i++){
      let o = new SceneObject(Math.floor(Math.random() * scene.width), Math.floor(Math.random() * scene.height), scene);
      objects.push(o);
    }
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
    
    drawing.render(camera);
};


function render(){
  requestAnimationFrame(render);
  
  var t1 = Date.now();
  var dt = (t1 - t0);

  update(dt);
}

init();
render();


















/* * * * * * * * * * *

      Drawing

* * * * * * * * * * */

/*var x = 0, y = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
      ctx.font = "30px Arial";

const video = document.getElementById("video");
      video.play();

const maskCanvas = document.getElementById("canvasMask");
const maskCtx = maskCanvas.getContext('2d');
const maskVideo = document.getElementById("videoMask");

const w = canvas.width, h = canvas.height;
  

var draw = function(){ 
  ctx.clearRect(0, 0, w, h);
  
  maskCtx.drawImage(maskVideo, x, y); 
  
  ctx.drawImage(video, x, y);
  ctx.fillText("Hi there", 500, 200);
  
  let frame = maskCtx.getImageData(0, 0, w, h);
  let l = frame.data.length / 4;
  
  let cols = ctx.getImageData(0, 0, w, h);
  
  for (let i = 0; i < l; i++) {
    let r = frame.data[i * 4 + 0];
    let g = frame.data[i * 4 + 1];
    let b = frame.data[i * 4 + 2];
    if (g > 250 && r > 250 && b > 250)
      cols.data[i * 4 + 3] = 0;
  }
  
  ctx.putImageData(cols, 0, 0);
}*/


// client-side js
// run by the browser each time your view template is loaded

// our default array of dreams
/*const dreams = [
  'Find and count some sheep',
  'Climb a really tall mountain',
  'Wash the dishes'
];

// define variables that reference elements on our page
const dreamsList = document.getElementById('dreams');
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements['dream'];

const nameForm = document.forms[0];
const nameInput = nameForm.elements['name'];

// a helper function that creates a list item for a given dream
const appendNewDream = function(dream) {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = dream;
  dreamsList.appendChild(newListItem);
}

// iterate through every dream and add it to our page
dreams.forEach( function(dream) {
  appendNewDream(dream);
});

// listen for the form to be submitted and add a new dream when it is
nameForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  dreams.push(nameInput.value);
  appendNewDream(nameInput.value);

  // reset form 
  nameInput.value = '';
  nameInput.focus();
};*/