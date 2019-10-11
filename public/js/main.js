'use strict';

// Global variables
var FIRSTNAME, LASTNAME;

const framerate = 15;
const duration = 10;

const WIDTH = 1280;
const HEIGHT = 720;

const WIDTH2 = WIDTH/2;
const HEIGHT2 = HEIGHT/2;

const ORIGIN = { x: 744, y: 117 };
const DESTINATION = { x: 262, y: 713 };

const LINEWIDTH = 240;

// Core elements

var canvas; const canvasHolder = document.getElementById('canvas-holder');
const capture = new Capture("svs6", 10, 'jpg'); // Duration of capture at framerate

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
  line2 : "",

  masker: "",
  aBuffer: "",
  bBuffer: ""
}

// Global events

const onStart = new Event("started");
const onEnd = new Event("ended");

p5.disableFriendlyErrors = true;

// Load all base assets here
function preload(){
  let bg = assets.background = createVideo(['../videos/background.mp4'], () => {
      bg.volume(0);  // Ensure volume is set to 1
  });
  
  bg.hide();
  bg.hideControls();
  

  
  bg.onended(function(){
   if(capturing)
      capture.stopCapture();
  });

  let matte = assets.matte = createVideo(['../videos/matte.mp4'], () => {
    matte.volume(0);
  });
  matte.hide();
  matte.hideControls();

  let flares = assets.flares = loadImage("../images/misc/optics.png");
}

const lineOrigins = 
[
  {x: 540, y:-290},
  {x: 470, y:-255},
  {x: 400, y:-220}
];

const lineTimes = 
[
  3.625,
  5.08
]

var lineA = { origin: "", time: 0, active: true, object: "" }
var lineB = { origin: "", time: 0, active: true, object: "" }
var lines = [ lineA, lineB ];

let t0 = Date.now();
let t1 = 0;
let dt = 0;

function setup(){
  pixelDensity(1);
  background(0);
  stroke(255);
  imageMode(CENTER);
  frameRate(15);

  canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent(canvasHolder);
    canvas.class('w-100 h-100');

  let bg = elements.bg = assets.background; 
  let matte = assets.matte;
  
  let buffer = elements.buffer = createGraphics(WIDTH, HEIGHT);
      elements.aBuffer = createGraphics(WIDTH, HEIGHT);
      elements.bBuffer = createGraphics(WIDTH, HEIGHT);

  let mask = elements.mask = new Mask(0, 0, elements.bBuffer, elements.buffer);
  let fx = elements.fx = assets.flares;

  let line1 = elements.line1 = lineA.object = new Line(lineA.origin.x, lineA.origin.y, 2, 1, LINEWIDTH, .1, CHARSIZE, 3.625);
  let line2 = elements.line2 = lineB.object = new Line(lineB.origin.x, lineB.origin.y, 2, 1, LINEWIDTH, .1, CHARSIZE, 5.08);

  bg.attribute('playsinline', '');
  bg.attribute('autoplay', '');
  bg.attribute('muted', '');

  matte.attribute('playsinline', '');
  matte.attribute('autoplay', '');
  matte.attribute('muted', '');
}

let ready = false;
let capturing = false;

let gTime = 0;
let playing = false;

let f = 0.0;
let tf = 150.0;


function draw(){
  if(!ready){
    assets.background.play();
    assets.matte.play();

    render();
    ready = true;
  }
}

let VIDEOREADY = false;
let VIDEOPLAY = false;




 function render(){
  function breakPromise(err){
    Promise.reject(err);
  }
  let time = gTime;

  let bg = assets.background; let bgbf = bg.elt.seekable;
  let matte = assets.matte; let mbf = matte.elt.seekable;

  VIDEOREADY = (bgbf.length > 0 && bgbf.end(0) >= time) && (mbf.length > 0 && mbf.end(0) >= time);

  if(VIDEOREADY){
    if(playing){
      bg.time(time);
      matte.time(time);
    }  
    else{
      bg.time(0);
      matte.time(0);
    }
  }

  let seq = clamp(time / 7.4583, 0, 1);
  let offset = lerp(.66, .97, seq);

  let aBuffer = elements.aBuffer;
  let bBuffer = elements.bBuffer;
  
  blendMode(BLEND);
    aBuffer.image(bg, 0, 0, WIDTH, HEIGHT);
    image(aBuffer, WIDTH2 , HEIGHT2, WIDTH, HEIGHT);

    bBuffer.image(matte, 0, 0, WIDTH, HEIGHT);

  let buffer = elements.buffer;
      buffer.clear();

      let dx = lerp(ORIGIN.x, ORIGIN.y, seq);
      let dy = lerp(DESTINATION.x, DESTINATION.y, seq);

      let center = 
      {
        x: (offset * lineOrigins[1].x) + dx,
        y: (offset * lineOrigins[1].y) + dy
      }

      if(lineA.active){
        let line1 = elements.line1;
          line1.x = (offset * lineA.origin.x) + dx ;
          line1.y = (offset * lineA.origin.y) + dy ;
          line1.scale = offset;
          line1.render(buffer, 1, time);
      }

      if(lineB.active){
        let line2 = elements.line2;
            line2.x = (offset * lineB.origin.x) + dx ;
            line2.y = (offset * lineB.origin.y) + dy ;
            line2.scale = offset;
            line2.render(buffer, 1, time);
      }

    let sc = offset;  

    let mx = 127;
    let my = 67;

    let mh = my*sc*8;
    let mw = mx*sc*7;

    let mask = elements.mask;
   mask.mask(Math.floor(center.x - mw/3), Math.floor(center.y - 2*mh/3), Math.floor(center.x + 2*mw/3), Math.floor(center.y + mh/3), Date.now())
  .then(function(dt){
      image(buffer, WIDTH2, HEIGHT2, WIDTH, HEIGHT);  

      blendMode(SCREEN);
      let fx = elements.fx;
      image(fx, WIDTH2, HEIGHT2, WIDTH, HEIGHT);  

      if(capturing)
        return capture.captureFrame(dt);
  }, breakPromise)
  .then(function(fr){
    if(fr)
      capture.addFrame(fr);

      if(playing){
        if(VIDEOREADY){
          f += 1.0;
          gTime = clamp((f/tf)*bg.duration(), 0, bg.duration());
        }

        updateProgressBar(clamp(f/tf, 0, 1));
      }
      else{
        gTime = 0;
        updateProgressBar(0);
      }

    requestAnimationFrame(render);
  }, breakPromise);
}



const onReset = new Event("resetted");

function reset(){
    let bg = assets.background;
        bg.time(0);
    let matte = assets.matte;
        matte.time(0);

    gTime = 0; f = 0.0;
    playing = false;

    elements.line1.clear();
    elements.line2.clear();
    $('#shareurl').val('');

    dispatchEvent(onReset);
}

const onRestart = new Event("restarted");

function restart(){
  let bg = assets.background;
  let matte = assets.matte;

  bg.time(0);
  matte.time(0);


  gTime = 0.0;
  f = 0.0;

    elements.line1.reset();
    elements.line2.reset();

    playing = true;

    dispatchEvent(onRestart);
}

function construct(first, last){
  FIRSTNAME = first;
  LASTNAME = last;
  
  let loaded = 0;
  loadName(first, loadedLine);
  loadName(last, loadedLine);


  if(first != '' && last != ''){
    console.log("neither empty");

    lineA.origin = lineOrigins[0];
    lineB.origin = lineOrigins[2];

    lineA.time = lineTimes[0];
    lineB.time = lineTimes[1];

    lineA.active = true;
    lineB.active = true;
  }
  else{
    if(first == ''){
      lineB.origin = lineOrigins[1];
      lineB.time = lineTimes[0];
      
      lineA.active = false;
      lineB.active = true;

      console.log("first empty");
    }
    else { // if last === ''
      lineA.origin = lineOrigins[1];
      lineA.time = lineTimes[0];

      lineB.active = false;
      lineA.active = true;

      console.log("last empty");
    }
  }


  function loadedLine(){
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
    container.populate(FIRSTNAME, lineA.time);

    container = lineB.object;
    container.clear();
    container.populate(LASTNAME, lineB.time);

    let bg = assets.background;
    let matte = assets.matte;
        
      //bg.time(0);
      //matte.time(0);


    gTime = 0; f = 0.0;
    playing = true;

    capture.beginCapture(framerate);
    dispatchEvent(onStart); // Fire initialized event
}

// Exec on page load
$(document).ready(() => {
    setTimeout(async () => {
        const urlParams = getURLParams();

        let line1;
        let line2;
        let deepLinkId;

        // Check if we have the x parameter passed to prepopulate the input.
        if (urlParams.x) {
            console.log('Check if id x', urlParams.x, 'for deeplink exists');
            const response = await checkDeepLinkId(urlParams.x);

            if (response && response.line1 && response.line2) {
                line1 = response.line1;
                line2 = response.line2;
                deepLinkId = response.deeplink_id;

                console.log('deeplink', deepLinkId);

                populatePage();
            }
        }

        // Check if we have the i parameter passed to prepopulate the input.
        if (urlParams.i) {
            // split on _ to get our 2 parameters
            if (urlParams.i.split('_').length === 2) {
                line1 = urlParams.i.split('_')[0];
                line2 = urlParams.i.split('_')[1];

                populatePage();
            };
        }

        function populatePage() {
            // Set input line 1
            $('#firstInput').val(line1);

            // Set input line 2
            $('#lastInput').val(line2);

            // Set share URL
            if (deepLinkId) $('#shareurl').val(window.location.origin + '?x=' + deepLinkId);

            // Play/Generate Video with DEEP LINK
            submitForm();
        }
    }, 1200);
});

// Checks if we already have a generated video stored in S3. Returns boolean.
async function checkDeepLinkId(id) {
    try {
        console.log('Note to dev: Show Loading in UI...');

        const result = await fetch('aws/processId', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deepLinkId: id
            })
        });

        const response = await result.json();

        console.log('Note to dev: End Loading in UI...');

        return response;
    } catch (err) {
        console.log(err);
        console.log('Error uploading::\n', err);
    }
}