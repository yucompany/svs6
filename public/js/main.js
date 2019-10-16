'use strict';


const IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;  // Detect Firefox, disable extra graphics buffers if so
    if(IS_FIREFOX)
      console.log("Firefox detected!");
    else
      console.log("Firefox NOT detected!");

// Global variables
var FIRSTNAME, LASTNAME;

const framerate = 12;
const duration = 10;

const START = 3.0;
var   DURATION = 1.0;

const WIDTH = 854;
const HEIGHT = 480;

const SFW = (WIDTH / 1280.0);
const SFH = (HEIGHT / 720.0);

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
  let bg = assets.background = createVideo(['../videos/bgnew.mp4'], () => {
      bg.volume(0);  // Ensure volume is set to 1

      bg.attribute('playsinline', '');
      bg.attribute('autoplay', '');
      bg.attribute('muted', '');

      bg.play();

      DURATION = bg.duration();
  });
  
  bg.hide();
  bg.hideControls();
  
  let matte = assets.matte = createVideo(['../videos/mlat.mp4'], () => {
    matte.volume(0);

    matte.attribute('playsinline', '');
    matte.attribute('autoplay', '');
    matte.attribute('muted', '');

    matte.play();
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
  frameRate(framerate);

  canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent(canvasHolder);
    canvas.class('w-100 h-100');
    //canvas.hide();

  let bg = elements.bg = assets.background; 
  let matte = assets.matte;
  
  let buffer = elements.buffer = createGraphics(WIDTH, HEIGHT);
      
  if(IS_FIREFOX){
    elements.aBuffer = createGraphics(WIDTH, HEIGHT);
    elements.bBuffer = createGraphics(WIDTH, HEIGHT);
  }

  // Set mask buffer to extra buffer IF FIREFOX
  let maskBuffer = assets.matte;
  if(IS_FIREFOX)
    maskBuffer = elements.bBuffer;

  let mask = elements.mask = new Mask(0, 0, maskBuffer, elements.buffer);
  let fx = elements.fx = assets.flares;       

  let line1 = elements.line1 = lineA.object = new Line(lineA.origin.x, lineA.origin.y, 2, 1, LINEWIDTH, .1, CHARSIZE, 3.625);
  let line2 = elements.line2 = lineB.object = new Line(lineB.origin.x, lineB.origin.y, 2, 1, LINEWIDTH, .1, CHARSIZE, 5.08);

}

let ready = false;
let capturing = false;

let gTime = 0;
let playing = false;

let f = (framerate * START);
let tf = (framerate * duration * 1.0);

let visible = false;


function draw(){
  if(!ready){
   // assets.background.play();
   // assets.matte.play();

    render();
    ready = true;
  }
}



  var TOTALPROGRESS = 0.0, TARGETPROGRESS = 0.0;
  var PHASES = [.4, .2, .4];


 function render(){
    TOTALPROGRESS += (TARGETPROGRESS - TOTALPROGRESS)*.033;
    updateProgressBar(TOTALPROGRESS);

    //canvas.elt.style.filter = `blur(${(1.0 - TOTALPROGRESS) * 20.0}px)`;

    if(capturing){
      let time = gTime;

      oncapture(time)

        .then(() => {
          requestAnimationFrame(render);
        })
    }
    else
      requestAnimationFrame(render);
}


var VIDEOREADY = false, VIDEOPLAY = false, SEEKED = false;
var PROGRESS = 0.0, SEQ = 0.0;


// Sequence variables
var offset = 0.0;
var center = {x:0, y:0};

function oncapture(t){

  return new Promise((resolve, reject) => {

      SEQ = clamp(PROGRESS * DURATION / 7.45833333, 0, 1);

      let bg = assets.background; let bgbf = bg.elt.buffered;
      let matte = assets.matte; let mbf = matte.elt.buffered;

      VIDEOREADY = (bgbf.length > 0 && bgbf.end(0) >= t) && (mbf.length > 0 && mbf.end(0) >= t);
      if(VIDEOREADY && !SEEKED){
        if(playing){
          bg.time(t);
          matte.time(t);
    
          SEEKED = true;
        }  
        else{
          bg.time(0);
          matte.time(0);
        }
      }
      VIDEOPLAY = !(bg.elt.seeking || matte.elt.seeking);


      // DRAWING

        blendMode(BLEND);
         // Draw buffers IF FIREFOX
        if(IS_FIREFOX){
          let aBuffer = elements.aBuffer;
          let bBuffer = elements.bBuffer;

          aBuffer.image(bg, 0, 0, WIDTH, HEIGHT);
          image(aBuffer, WIDTH2 , HEIGHT2, WIDTH, HEIGHT);

          bBuffer.image(matte, 0, 0, WIDTH, HEIGHT);
        }
        else 
          image(bg, WIDTH2, HEIGHT2, WIDTH, HEIGHT);


        let buffer = elements.buffer;
            buffer.clear();


        let dx = lerp(ORIGIN.x, ORIGIN.y, SEQ);
        let dy = lerp(DESTINATION.x, DESTINATION.y, SEQ);


        offset = lerp(.66, .97, SEQ);
        
        center.x = ((offset * lineOrigins[1].x) + dx)*SFW;
        center.y = ((offset * lineOrigins[1].y) + dy)*SFH;

        if(lineA.active){
          let line1 = elements.line1;
            line1.x = ((offset * lineA.origin.x) + dx)*SFW;
            line1.y = ((offset * lineA.origin.y) + dy)*SFH;
            line1.scale = offset;
            line1.render(buffer, 1, t);
        }
      
        if(lineB.active){
          let line2 = elements.line2;
              line2.x = ((offset * lineB.origin.x) + dx)*SFW;
              line2.y = ((offset * lineB.origin.y) + dy)*SFH;
              line2.scale = offset;
              line2.render(buffer, 1, t);
        }


        let mx = 127;
        let my = 67;

        let mh = my*offset*8*SFH;
        let mw = mx*offset*7*SFW;

        let mask = elements.mask;

        mask.mask(Math.floor(center.x - mw/3), Math.floor(center.y - 2*mh/3), Math.floor(center.x + 2*mw/3), Math.floor(center.y + mh/3), Date.now())

              .then(function(dt){
                  image(buffer, WIDTH2, HEIGHT2, WIDTH, HEIGHT);  

                  blendMode(SCREEN);

                  let fx = elements.fx;
                      image(fx, WIDTH2, HEIGHT2, WIDTH, HEIGHT);  

                  if(VIDEOREADY && VIDEOPLAY)
                    return capture.captureFrame(dt);
              })
                
              .then(function(fr){
                  if(fr) 
                    capture.addFrame(fr);

                  if(VIDEOPLAY && VIDEOREADY){
                    if(f <= tf)
                      f += 1.0;

                    gTime = clamp((f/tf)*DURATION, 0, DURATION);
                    SEEKED = false;
                  }

                  PROGRESS = clamp(f/tf, 0, 1);
                  if(PROGRESS >= 1.0){
                      capture.stopCapture();
                      capturing = false;
                  }
                  else
                    TARGETPROGRESS = ((PROGRESS - (START*framerate / tf))/(1.0 - START*framerate/tf)) * PHASES[0];
                })

              .then(() => {
                resolve();
              })


    });
}



const onReset = new Event("resetted");

function reset(){
    let bg = assets.background;
        bg.time(0);
    let matte = assets.matte;
        matte.time(0);

        PROGRESS = 0.0;
        TOTALPROGRESS = 0.0;
        TARGETPROGRESS = 0.0;

    gTime = 0; f = (framerate * START);
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
  f = (framerate * START);

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
    }
    else { // if last === ''
      lineA.origin = lineOrigins[1];
      lineA.time = lineTimes[0];

      lineB.active = false;
      lineA.active = true;
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
        
    bg.time(0);
    matte.time(0);

    PROGRESS = 0.0;
    TOTALPROGRESS = 0.0;
    TARGETPROGRESS = 0.0;

    gTime = 0; f = (framerate * START);
    playing = true;

    capture.beginCapture(framerate);
    dispatchEvent(onStart); // Fire initialized event
}

// Exec on page load
$(document).ready(() => {
    setTimeout(() => {
        const urlParams = getAllUrlParams(window.location.href);

        let line1, line2;

        // Check if we have the x parameter passed to prepopulate the input.
        if (urlParams.x) {
            console.log('Check if id x', urlParams.x, 'for deeplink exists');
            const response = checkDeepLinkId(urlParams.x);

            response
            .then((dl) => {

              line1 = dl.line1;
              line2 = dl.line2;
              let deepLinkId = dl.deeplink_id;

              console.log('deeplink', deepLinkId);
              populatePage(deepLinkId);
            })
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

        function populatePage(deepLinkId) {
            // Set input line 1
            $('#firstInput').val(line1);

            // Set input line 2
            $('#lastInput').val(line2);

            // Set share URL
            if (deepLinkId){
                DEEP_LINK_ID = deepLinkId;
               $('#shareurl').val(window.location.origin + '?x=' + deepLinkId);
            }

            // Play/Generate Video with DEEP LINK
            submitForm();
        }
    }, 1200);
});

// Checks if we already have a generated video stored in S3. Returns boolean.
function checkDeepLinkId(id) {
  console.log('Note to dev: Show Loading in UI...');

  return new Promise((resolve, reject) => {

    const result = fetch('aws/processId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          deepLinkId: id
      })
    });
  
    result
  
      .then((response) => {
          response.json()
  
          .then((r) => {
            resolve(r);
          })
          .catch((err) => {
            reject(err);
          })
      })
      .catch((err) =>{
        reject(err);
      })

  });
}
  

// Get params from URL
function getAllUrlParams(url) {

    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  
    // we'll store the parameters here
    var obj = {};
  
    // if query string exists
    if (queryString) {
  
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
  
      // split our query string into its component parts
      var arr = queryString.split('&');
  
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
  
        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
  
        // (optional) keep case consistent
        paramName = paramName.toLowerCase();
        if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
  
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
  
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
  
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string'){
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
  
    return obj;
  }