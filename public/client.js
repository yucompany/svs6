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



/* * * * * * * * * * *

      Drawing

* * * * * * * * * * */

var x = 0, y = 0;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
      ctx.font = "30px Arial";

const video = document.getElementById("video");

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
}



/* * * * * * * * * * *

      Capturing

* * * * * * * * * * */


var capturing = false;
var captureArr = [];
var captureTime = 8;

var form = document.getElementById('file-form');
var fileSelect = document.getElementById('file-select');
var uploadButton = document.getElementById('upload-button');

form.onsubmit = function(event) {
  event.preventDefault();
 
  // Update button text.
  uploadButton.innerHTML = 'Uploading...';
 
  var files = fileSelect.files;
  var formData = new FormData();
  
  for (var i = 0; i < files.length; i++) {
   var file = files[i];
 
   // Check the file type.
   if (!file.type.match('image.*')) {
     continue;
   }
 
   // Add the file to the request.
  formData.append('photos[]', file, file.name);
 }
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/sendImages', true);
  
  xhr.onload = function () {
  if (xhr.status === 200) {
    // File(s) uploaded.
    uploadButton.innerHTML = 'Upload';
  } else {
    alert('An error occurred!');
  }
};
  
  xhr.send(formData);
}


const saveButton = document.getElementById("saveButton");
      saveButton.addEventListener("click", function(){

        if(capturing)
          return;
        
        capturing = true;
        captureArr = [];
        
      });

var frameCount = -1;

var framerate = 30;

var framesCompleted = 0;
var totalFrames = 0;

const sendFrame = function(frame){
  ++frameCount;
  
  $.ajax({
    type: 'POST',
    url: '/addFrame',
    data: {
      png: frame,
      frame: frameCount
    },
    
    success: function(){
      ++framesCompleted;
      console.log("frames uploaded: ", framesCompleted, "/", totalFrames);
      
      if(framesCompleted >= totalFrames)
        encode("svs6");
    },
    error: function(err){
      console.log("error uploading: ", err);
      --totalFrames;
    }
  });
}

const encode = function(filename){
  filename = filename || "unnamed";
  
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

var t0 = Date.now();
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
render();

