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
  matte: "",
  flares: "",
  letters: {

  }
}

function preload(){
  let bg = assets.background = createVideo(['/videos/bg222.mp4'], () => {
      bg.time(0);
      bg.volume(0);

      bg.onended(function(){
        console.log("Video has ended. Try again?");
      });
  });
  bg.hide();

  let matte = assets.matte = createVideo(['/videos/mat222.mp4'], () => {
    matte.time(0);
    matte.volume(0);

    matte.onended(function(){
      console.log("Video has ended. Try again?");
    });
  });
  matte.hide();

  let flares = assets.flares = createVideo(['/videos/flares.mp4'], () => {
    flares.time(0);
    flares.volume(0);

    flares.onended(function(){
      console.log("Video has ended. Try again?");
    });
  });
  flares.hide();

  
  function fetchLetters(letter){
    let letterPath = "images/letters/" + letter;
  
    let letterImages = [];
    for(let i = 0; i < 12; i++)
      letterImages.push(loadImage(letterPath + "/" + i + ".png"));
    
    return letterImages;
  }

  var letters = assets.letters;
  for(let i = 0; i < VALID_CHARS.length; i++){
    let char = VALID_CHARS[i];

    if(char != " ")
      assets.letters[char] = fetchLetters(char);
  }
}

var lineA = { origin: {x: 240, y:-620}, object: {} }
var lineB = { origin: {x: 100, y:-560}, object: {} }
var lines = [ lineA, lineB ];

function setup(){
  pixelDensity(1);

  canvas = createCanvas(camera.width, camera.height);
    canvas.parent(canvasHolder);
    canvas.class('mw-100 h-auto');

  build();
  blending();

  background(0);
  stroke(255);

  frameRate(framerate);
}



var offset = .67;

function build(){
    let bgLayer = new SceneLayer(camera);
      let bg = new SceneVideo(0, 0, 1, camera.width, camera.height, assets.background, scene);
      objects.push(bg);
      bgLayer.add(bg);

    let objectLayer = new SceneLayer(camera);

    let ao = lineA.object = new Line(0, 0, 550, 275, 1, scene);
    let bo = lineB.object = new Line(0, 0, 550, 275, 1, scene);
    let matte = new SceneMask(0, 0, 1, camera.width, camera.height, assets.matte, [255, 255, 255], scene);

    objectLayer.add(ao);
    objectLayer.add(bo);
    objectLayer.add(matte);
    
    let fxLayer = new SceneLayer(camera);
    

    drawing.addLayer(bgLayer);
    drawing.addLayer(objectLayer);
}

function blending(){
    blends["MULTIPLY"] = MULTIPLY;
    blends["DIFFERENCE"] = DIFFERENCE;
}

function construct(first, last){
  console.log(first, last);
  let letters = assets.letters;
  
  let char = "";
  let letter;
  let container;
  
  container = lineA.object;
  container.clear();
  for(let i = 0; i < first.length; i++){
     char = first[i];
     letter = new Letter(letters[char], scene);

     container.add(letter);
  }
  container.reset();

  container = lineB.object;
  container.clear();
  for(let i = 0; i < last.length; i++){
    char = last[i];
    letter = new Letter(letters[char], scene);

    container.add(letter);
 }
 container.reset();

 let bg = assets.background;
 let matte = assets.matte;

    bg.stop(); bg.play();
     

  built = 0;
}


var sequence = 0;
var built = 0;

function update(dt) {
    dt /= 1000;

    let bg = assets.background;
    let matte = assets.matte;
    let flares = assets.flares;
        matte.time(bg.time());
        flares.time(bg.time());
    
    let seq = sequence = clamp(bg.time() / 7.4583, 0, 1);
            offset = lerp(.66, .97, seq);

    let line;
    for(let i = 0; i < lines.length; i++){
      line = lines[i];

      line.object.x = (offset * line.origin.x) + lerp(744, 117, seq) ;
      line.object.y = (offset * line.origin.y) + lerp(262, 713, seq) ;
      line.object.scale = offset*.67;

      if(bg.time() > 3.625 && built <= 1){
        line.object.build();
        built++;
      }
    }

    drawing.render(camera);
};

var t0 = Date.now();
function draw(){  // Our tick function imported from p5.js
  var t1 = Date.now();
  let dt = (t1 - t0);

  update(dt);
  t0 = t1;
}

function render(){
  requestAnimationFrame(render);
  
  var t1 = Date.now();
  let dt = (t1 - t0);

  update(dt);
  t0 = t1;
}
// Trigger render loop here, split fps between draw and update
//var init = false; function draw() { if(!init){render();init=true;} }