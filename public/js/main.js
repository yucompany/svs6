'use strict';

// Global variables
var FIRSTNAME, LASTNAME;

const framerate = 15;

const WIDTH = 1280;
const HEIGHT = 720;

const WIDTH2 = WIDTH/2;
const HEIGHT2 = HEIGHT/2;

const ORIGIN = { x: 744, y: 117 };
const DESTINATION = { x: 262, y: 713 };

const LINEWIDTH = 240;

// Core elements

var canvas; var canvasHolder = document.getElementById('canvas-holder');

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

const onEnd = new Event("ended");

// Load all base assets here
function preload(){
  let bg = assets.background = createVideo(['../videos/background.mp4'], () => {
      bg.time(.1);
      bg.volume(1);  // Ensure volume is set to 1

      bg.elt.playsInline = true; // Ensure video does not maximize
      bg.elt.WebKitPlaysInline = true;
  });
  bg.hide();
  bg.hideControls();
  bg.onended(async function(){
    console.log('Video generated!');
    dispatchEvent(onEnd);
  });

  let matte = assets.matte = createVideo(['../videos/matte.mp4'], () => {
    matte.time(0);
    matte.volume(0);

    matte.elt.playsInline = true;
    matte.elt.WebKitPlaysInline = true;
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

  canvas = createCanvas(WIDTH, HEIGHT); console.log(canvas);
    canvas.parent(canvasHolder);
    canvas.class('w-100 h-100');

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


const onReset = new Event("resetted");

function reset(){
    let bg = assets.background;
        bg.time(0);

        elements.line1.clear();
        elements.line2.clear();

    dispatchEvent(onReset);
}

const onRestart = new Event("restarted");

function restart(){
  let bg = assets.background;
    bg.stop();

    elements.line1.reset();
    elements.line2.reset();

    let promise = bg.elt.play();
    if (promise !== undefined) {
      promise.then(function() {
        console.log("video played success");

        dispatchEvent(onRestart);

      }).catch(function(error) {
        console.log("video played fail: " + error);
      });
    }
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

const onInitialized = new Event('initialized');

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

    let promise = bg.elt.play();
    if (promise !== undefined) {
      promise.then(function() {
        console.log("video played success");

        capture.beginCapture(framerate);
        dispatchEvent(onInitialized); // Fire initialized event
      }).catch(function(error) {
        console.log("video played fail: " + error);
      });
    }

   /* let matte = assets.matte;
    promise = matte.elt.play();
    if (promise !== undefined) {
      promise.then(function() {
        console.log("video played success");

      


      }).catch(function(error) {
        console.log("video played fail: " + error);
      });
    }*/
    
}

// Exec on page load
$(document).ready(() => {
    setTimeout(() => {
        const urlParams = getURLParams();

        // Check if we have the i parameter passed to prepopulate the input.
        if (urlParams.i) {
            // split on _ to get our 2 parameters
            if (urlParams.i.split('_').length === 2) {
                const first = urlParams.i.split('_')[0];
                const last = urlParams.i.split('_')[1];

                // Set input line 1
                $('#firstInput').val(first);

                // Set input line 2
                $('#lastInput').val(last);

                // Generate Video
                construct(first, last, capture.video);
            }
        }
    }, 1200);
});