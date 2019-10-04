"use strict";

// Global variables

const framerate = 15;

const WIDTH = 1280;
const HEIGHT = 720;

const WIDTH2 = WIDTH/2;
const HEIGHT2 = HEIGHT/2;

const ORIGIN = { x: 744, y: 117 };
const DESTINATION = { x: 262, y: 713 };

const LINEWIDTH = 240;

// Core elements

var canvas; var canvasHolder = 'canvas-holder';

var assets = {
  background : "",
  matte: "",
  flares: "",

  letters: {}
}

var elements = {
  bg : "",
  buffer: "",
  mask : "",
  fx : "",

  line1 : "",
  line2 : ""
}

const capture = new Capture("svs6", 10, 'jpg'); // Duration of capture at framerate

// Load all base assets here
function preload(){
  let bg = assets.background = createVideo(['../videos/background.mp4'], () => {
      bg.time(0);
      bg.volume(1);  // Ensure volume is set to 1
  });
  bg.hide(); 
  bg.hideControls();

  let matte = assets.matte = createVideo(['../videos/matte.mp4'], () => {
    matte.time(0);
    matte.volume(0);
  });
  matte.hide(); 
  matte.hideControls();

  let flares = assets.flares = loadImage("../images/misc/optics.png");
}

var lineA = { origin: {x: 540, y:-290}, object: "" }
var lineB = { origin: {x: 400, y:-220}, object: "" }
var lines = [ lineA, lineB ];

function setup(){
  pixelDensity(1);
  background(0);
  stroke(255);
  imageMode(CENTER);
  frameRate(framerate);

  canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent(canvasHolder);
    canvas.class('w-100 h-auto');

  let bg = elements.bg = assets.bg;
  let buffer = elements.buffer = createGraphics(WIDTH, HEIGHT);
  let mask = elements.mask = new Mask(WIDTH2, HEIGHT2);
  let fx = elements.fx = assets.flares;

  let line1 = elements.line1 = lineA.object = new Line(lineA.origin.x, lineA.origin.y, 2, 1, LINEWIDTH, .1, CHARSIZE, 3.625);
  let line2 = elements.line2 = lineB.object = new Line(lineB.origin.x, lineB.origin.y, 2, 1, LINEWIDTH, .1, CHARSIZE, 5.08);
}


function draw(){  // Our tick function imported from p5.js
  let bg = assets.background;
  let time = bg.time();
  let matte = assets.matte;
      matte.time(time);

  let seq = clamp(time / 7.4583, 0, 1);
  let offset = lerp(.66, .97, seq);

  blendMode(BLEND);
  image(bg, WIDTH2, HEIGHT2, WIDTH, HEIGHT);
  let buffer = elements.buffer;
  buffer.clear();
      let line1 = elements.line1;
          line1.x = (offset * lineA.origin.x) + lerp(ORIGIN.x, ORIGIN.y, seq) ;
          line1.y = (offset * lineA.origin.y) + lerp(DESTINATION.x, DESTINATION.y, seq) ;
          line1.scale = offset;
          line1.render(buffer, 1, time);
      let line2 = elements.line2;
          line2.x = (offset * lineB.origin.x) + lerp(ORIGIN.x, ORIGIN.y, seq) ;
          line2.y = (offset * lineB.origin.y) + lerp(DESTINATION.x, DESTINATION.y, seq) ;
          line2.scale = offset;
          line2.render(buffer, 1, time);
  
  let mask = elements.mask;
    mask.mask(matte, buffer);
    
  image(buffer, WIDTH2, HEIGHT2, WIDTH, HEIGHT);  

 /* * * * * * * * */

  blendMode(SCREEN);
  let fx = elements.fx;
  image(fx, WIDTH2, HEIGHT2, WIDTH, HEIGHT);  
}


var FIRSTNAME, LASTNAME;

function reset(){
    let bg = assets.background;
        bg.stop();

        elements.line1.reset();
        elements.line2.reset();

    bg.play();
}

function construct(first, last){
  FIRSTNAME = first;
  LASTNAME = last;
  
  let loaded = 0;
    loadName(first, loadedLine);
    loadName(last, loadedLine);

  function loadedLine(){
    console.log("Loaded line " + loaded)

    ++loaded;
    if(loaded <= 1)
      return;

      initialize();
  }
}

function initialize(){
    let char = "";
    let letter;
    let container;

    container = lineA.object;
    container.clear();
    container.populate(FIRSTNAME);

    container = lineB.object;
    container.clear();
    container.populate(LASTNAME);

    let bg = assets.background;
        bg.stop(); 
        bg.play();

    capture.beginCapture(framerate);
}


var sequence = 0;
var built = 0;

function update(dt) {
    dt /= 1000;

    let bg = assets.background;
    let matte = assets.matte;
   // let flares = assets.flares;
        matte.time(bg.time());
      //  flares.time(bg.time());
    
    let seq = sequence = clamp(bg.time() / 7.4583, 0, 1);
            offset = lerp(.66, .97, seq);

    let line;
    for(let i = 0; i < lines.length; i++){
      line = lines[i];

      line.object.x = (offset * line.origin.x) + lerp(744, 117, seq) ;
      line.object.y = (offset * line.origin.y) + lerp(262, 713, seq) ;
      line.object.scale = offset*.67;

      if(i == 0 && bg.time() > 3.625 && built <= 0){
        line.object.build();
        built++;
      }
      else if(i == 1 && bg.time() > 5.08 && built <= 1){
        line.object.build();
        built++;
      }
    }

    drawing.render(camera);
};