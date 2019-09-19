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

function clamp(a, b, c){return Math.max(b,Math.min(c,a));}



/* * * * * * * * * * *

      Drawing

* * * * * * * * * * */

class Scene {
  
  constructor(width, height){
    this.width = width;
    this.height = height;
    
    this.objects = [];
  }
  
  register(object){
    if(!(object instanceof SceneObject)) return;
    
    let objects = this.objects;
    let index = objects.indexOf(object);
    if(index > -1) return;
    
    objects.push(object);
    console.log("Added : " + object.name);
  }
  
  unregister(object){
    let index = this.objects.indexOf(object);
    if(index < 0)
        return;
    
    this.objects.splice(index, 1);
  }
}

class SceneObject { 
  
  constructor(x, y, scene){
    this.x = x;
    this.y = y;
    
    this.scene = scene;
    this.init();
  }
  
  init() {
    let scene = this.scene;
    scene.register(this);
  }
  
  render(x, y){
    ellipse(x, y, 5, 5);
  }
  
}


class Camera extends SceneObject {
  
  constructor(x, y, width, height, scene){
    super(x, y, scene);
    
    this.width = width;
    this.height = height;
    
  }
  
  render(canvas){
    let scene = this.scene;
    let objects = scene.objects;
    
    if(!objects)
      return;
    
    for(let i = 0; i < objects.length; i++){
      let obj = objects[i];
      if(obj != this){
        let dx = (obj.x - this.x);
        let dy = (obj.y - this.y);
        
        
        obj.render(dx, dy);
      }
    }
  }
  
}

class SceneImage extends SceneObject {
  
  constructor(x, y, width, height, image, scene){
    super(x, y, scene);
    
    if(width > 0 && height > 0){
      this.width = width;
      this.height = height;
    }
    
    this.image = image;
  }
  
  render(x, y){
    let img = this.image;
    if(!img)
      return;
    
    let w = this.width; let h = this.height;
    
    if(w && h){
      image(img, x, y, w, h);
      return;
    }
    
    image(img, x, y);
  }
}

/* * * * * * * * * * *

      Capturing

* * * * * * * * * * */

var capturing = false;
var captureArr = [];
var captureTime = 10;

const framerate = 24;
var frames = 0;
var totalFrames = framerate * captureTime;


const saveButton = document.getElementById("saveButton");
      saveButton.addEventListener("click", function(){

        if(capturing)
          return;
       
        capturing = true;    
        saveFrames('frame', 'jpg', captureTime, framerate, function(arr) {
          frames = 0; totalFrames = arr.length;
          captureArr = arr;

          for(let i = 0; i < totalFrames; i++)
            sendFrame(arr[i].imageData);
        });

        
      });

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

const scene = new Scene(1080, 1080); console.log("Scene created at " + scene.width + "x" + scene.height);
const camera = new Camera(0, 0, 640, 640, scene);
var canvas;

var bg;
var ellipses = [];

const video = document.getElementById("video");
var vid;

function setup(){
  canvas = createCanvas(camera.width, camera.height);
  vid = createVideo([video.src], function(){ vid.loop(); bg = new SceneImage(5, 5, -1, -1, vid, scene);});
  vid.hide();
  
  stroke(255);
  frameRate(24);
  
  for(let i = 0; i < 50; i++){
    let e = new SceneObject(Math.floor(Math.random() * scene.width), Math.floor(Math.random() * scene.height), scene);
    ellipses.push(e);
  }
}

let y = 100;
function draw() {
  background(0);
  
  let dx = 0;
  if(r) dx += 1;
  if(l) dx -= 1;
  
  let dy = 0;
  if(u) dy -= 1;
  if(d) dy += 1;
  
  camera.x = clamp(camera.x + (dx * 10), 0, scene.width - camera.width); 
  camera.y = clamp(camera.y + (dy * 10), 0, scene.height - camera.height);
  
  camera.render(canvas);
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


/* * * * * * * * * * *

      Main

* * * * * * * * * * */

/*var t0 = Date.now();
function update(dt) {
  //x = 500*Math.cos(dt / 500);
  //y = 200*Math.sin(dt / 500);
   
  draw();
  
  if(capturing){
    let secondsElapsed = (totalFrames / framerate);
    if(secondsElapsed >= captureTime){
      capturing = false;
      return;
    }
    
    let frame = canvas.toDataURL();
        sendFrame(frame);
    
    ++totalFrames;
    console.log(totalFrames);
  }
};


function render(){
  requestAnimationFrame(render);
  
  var t1 = Date.now();
  var dt = (t1 - t0);

  update(dt);
}
render();*/


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
