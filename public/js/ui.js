'use strict';

let DEEP_LINK_ID = ""; // Deeplink to be appended to URL
const S3URL = 'https://social-sharing-install.s3-us-west-2.amazonaws.com/tec-demo'; // Base URL for where to look for encoded videos on AWS

// Exec on page load - Adding button action assignments.
$(document).ready(() => {
    // Re-do button
    const redo = document.getElementById("redo");
    if (redo) {
        redo.addEventListener("click", () => {
            reset();
        });
    }

    // Replay Button
    const replay = document.getElementById('replay');
    if (replay) {
        replay.addEventListener('click', () => {
            restart();
        });
    }

    // Download Photo Button
    const downloadPhoto = document.getElementById('dlPhoto');
    if (downloadPhoto) {
        downloadPhoto.addEventListener('click', () => {
            triggerPhotoDownload(PHOTOURL);
        });
    }

    // Download Video Button
    const downloadVideo = document.getElementById('dlVideo');
    if (downloadVideo) {
        downloadVideo.addEventListener('click', () => {
            triggerVideoDownload(VIDEOURL);
        });
    }

    // Share to Facebook Button
    const facebookShare = document.getElementById('shareFacebook');
    if (facebookShare) {
        facebookShare.addEventListener('click', () => {
            showFacebookShare();
        });
    }

    // Share to Twitter Button
    const twitterShare  = document.getElementById('shareTwitter');
    if (twitterShare) {
        twitterShare.addEventListener('click', () => {
            showTwitterShare();
        });
    }

    // Share to Email Button
    const emailShare = document.getElementById('shareEmail');
    if(emailShare){
        emailShare.addEventListener('click', () => {
            showEmailShare();
        });
    }
});

const videoPreview = document.getElementById("video-preview");

const loading = document.getElementById("loading");
const loadingHolder = document.getElementById("loading-holder");
const progress = document.getElementById("percentage");

// Updates the percentage value displayed from progress to retrieve encoded video
function updateProgressBar(percent){
    if(progress == undefined)
        return;

    let prg = Math.floor(percent*100);
    progress.innerHTML = prg + "%"; // Set display text
}

const onPreview = new Event("previewed"); // Has previewed the encoded video

// When video can be played past first frame, show preview
videoPreview.oncanplay = () => {
    dispatchEvent(onPreview);
}

function showVideoPreview(){
    videoPreview.src = VIDEOURL // Set video source to AWS URL
    videoPreview.load();

    updateUIVisibility(videoPreview, true); // Show video preview
}


// Helper function for Facebook sharing
function showFacebookShare() {
    window.FB.ui({
        method: 'share',
        href: `http://sv6.yuco.com/?x=${DEEP_LINK_ID}`,
        quote: 'Celebrate the final season with this custom title sequence generator.'
    }, (response) => {
        //console.log(response);
    });
}

// Helper function for Twitter sharing
function showTwitterShare() {
    // Opens a pop-up with twitter sharing dialog
    let shareURL = 'http://twitter.com/share?'; //url base
    //params
    const params = {
     url: `http://sv6.yuco.com/?x=${DEEP_LINK_ID}`,
     text: 'Celebrate the final season with this custom title sequence generator.',
     via: 'HBO',
     hashtags: "BeTheValley,SiliconValley,HBO"
    }
    for (let prop in params) shareURL += '&' + prop + '=' + encodeURIComponent(params[prop]);

    window.open(shareURL, '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');
}

// Helper function for Email sharing
function showEmailShare(){
    // Sets subject line and body copy for email
    const params = {
        subject: "Be The Valley",
        body: `Here is a link to your video: ${VIDEOURL}`
    }

    const link = document.createElement('a');

    link.href = `mailto:test@example.com?subject=${params.subject}&body=${params.body}`;
    link.setAttribute('target', '_blank'); //Trigger download in new window

    // Trigger email URL (opens new window*)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


/*
    Creates video and photo exports for sequence 
      1. Check for key in AWS table
      2. If exists, fetch video from s3 storage
         If not, generate video with capture 
      3. Set video and photo URLs
      4. Resolve with deeplink
*/
function prepareExports(){
    const s3Key = generateKeyFromInput(); // Generate custom key for input

    return checkIfKeyExists(s3Key) // Check if key exists in AWS table
    .then((cached) => {

        return new Promise(function(resolve, reject){

            if(!cached){  // NO => existing data on S3

                capture.generate() // Generate video frames in controlled sequence
                .then((path) => { // Resolve with path to video file

                    beginUploadToS3(path) // Upload video and photo to AWS S3
                    .then((deeplink) => { // Receive deeplink
                        window.history.replaceState(null, null, '?x=' + deeplink); // Replace window URL with deeplink
                        resolve(deeplink); // Found cached media, return URL
                    })
                    .catch((err) => {
                        console.log("Error uploading media to S3!")
                        reject(err);
                    })

                })

            }
            else { // YES => existing data on S3

                let videoFile = s3Key + ".mp4"; // Full video path

                // Generate deeplink from input
                const fetchResponse = fetch('aws/deepLink', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        videoFilePath: videoFile,
                        imageFilePath: videoFile.replace('.mp4', '.jpg')
                    })
                });

                fetchResponse
                .then((response) => { // Received deeplink
                    response.text()
                    .then((link) => {
                        //console.log("Successfully fetched deeplink = " + link);
                        resolve(link);
                    })
                    .catch((err) => {
                        console.log("Unable to fetch deeplink..." + err);
                        reject(err);
                    })
                })
                .catch((err) => {
                    console.log("Unable to fetch deeplink..." + err);
                    reject(err);
                })
            }

        })

    })
    .then((deeplink) => {
        if(deeplink){
            //console.log("Successfully bound exports!");

            PHOTOURL = S3URL + s3Key + ".jpg"; // Set global photo path on S3
            VIDEOURL = S3URL + s3Key + ".mp4"; // Set global video path on S3

            DEEP_LINK_ID = deeplink; // Set deeplink
            $('#shareurl').val(window.location.origin + '?x=' + deeplink); // Update the deeplink in sharing
        }
    })


}

// Uploads video and photo to S3 Bucket, resolves with deeplink
function beginUploadToS3(videoFile) {
    return new Promise((resolve, reject) => {
        //console.log('Note to dev: Show Loading in UI...');

        const fetchResponse = fetch('aws/s3upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoFilePath: videoFile,
                imageFilePath: videoFile.replace('.mp4', '.jpg')
            })
        });

        fetchResponse
        .then((response) => {
            response.text()
            .then((result) => {
                //console.log('Note to dev: End Loading in UI...');
                resolve(result);
            })
            .catch((err) => {
                console.log('Error parsing response');
                reject(err);
            });
        })
        .catch((err) => {
            console.log('Error communicating with server.');
            reject(err);
        });
    })
    .then((deepLinkId) => {
        return new Promise(function(res, rej){
            res(deepLinkId);
        })
    });
}

// Checks if we already have a generated video stored in S3. Returns boolean.
function checkIfKeyExists(s3Key) {
    s3Key += ".mp4";  // Append mp4 ext to key for video lookup

    return new Promise((resolve, reject) => {
        //console.log('Note to dev: Show Loading in UI...');

        const fetchResponse = fetch('aws/s3cacheKey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                s3Key: s3Key
            })
        });

        fetchResponse
        .then((response) => {
            response.json()
            .then((result) => {
                //console.log('Note to dev: End Loading in UI...');
                resolve(result);
            })
            .catch((err) => {
                console.log('Error parsing response');
                reject(err);
            });
        })
        .catch((err) => {
            console.log('Error communicating with server.');
            reject(err);
        });
    });
}

// Creates a key based on the input values - used to check if we already have something stored in S3.
function generateKeyFromInput() {
    return `/output/${$('#firstInput').val().toUpperCase().trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*')}~${$('#lastInput').val().toUpperCase().trim().split(' ').join('_').replace(/#/g, '.').replace(/\+/g, '*')}`;
}


/* * * * *

    Downloads

* * * * * */

// Starts a video download.
function triggerVideoDownload(videoFile) {
    const link = document.createElement('a');

    link.href = videoFile;

    if (link.href) {
        // File name for downloaded file.
        link.download = `${$('#firstInput').val().toUpperCase().trim()}_${$('#lastInput').val().toUpperCase().trim()}~VALLEY.mp4`;

        // Open video URL, triggers download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Starts a photo download.
function triggerPhotoDownload(imageFile) {
    const link = document.createElement('a');

    // We'll want to replace this with the client's S3 bucket address.
    link.href = imageFile;

    // File name for downloaded file.
    link.download = `${$('#firstInput').val().toUpperCase().trim()}~${$('#lastInput').val().toUpperCase().trim()}~VALLEY.jpg`
    //console.log(link);

    // Open video URL, triggers download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}




/* * * * *

    UI

* * * * * */


const title = document.getElementById("titlecard");
const submit = document.getElementById("submission");
const exporting = document.getElementById("exports");

// Shared function for updating visibility of UI element with classes (shown/hidden)
const updateUIVisibility = function(e, visible){
    if(e == null) return;

    if(visible){
      if(e.classList.contains("shown")) return; // Already shown

      if(e.classList.contains("hidden"))
        e.classList.remove("hidden");

      e.classList.add("shown");

    }
    else{
      if(e.classList.contains("hidden")) return; // Already hidden

      if(e.classList.contains("shown"))
        e.classList.remove("shown");

      e.classList.add("hidden");

    }
    updateFooterPos();
}

// Check if UI element is shown/hidden
const checkUIVisibility = function(e){
    if(e.classList.contains("hidden"))
        return false;

    return true;
}

// When sequence generation starts
addEventListener('started', () => {
    updateTitleCardImage(true); // Blur title card
    updateUIVisibility(document.getElementById("defaultCanvas0"), true); // Show canvas
    updateUIVisibility(title, false); // Hide title card

    updateUIVisibility(loadingHolder, true); // Show loader

    updateUIVisibility(submit, false); // Hide submit form
    toTop();
});

// When sequence generation ends
addEventListener('ended', () => {
    updateUIVisibility(loadingHolder, false); // Hide loader

    showVideoPreview(); // Show preview
});

// When video assets have loaded
addEventListener('loadcomplete', () => {
    updateUIVisibility(submit, true); // Show submit form
})

// When video preview has loaded
addEventListener('previewed', () => {
    updateUIVisibility(document.getElementById("defaultCanvas0"), false); // Hide canvas
    updateUIVisibility(exporting, true); // Show export options

});

// When experience has been reset to the beginning (name input)
addEventListener('resetted', () => {
    updateTitleCardImage(false); // Unblur title card
    updateUIVisibility(title, true); // Show title

    updateUIVisibility(exporting, false); // Hide export options
    updateUIVisibility(videoPreview, false); // Hide preview
    
    // Clear form
    nameform.reset();

    updateUIVisibility(title, true); // Show title
    setTimeout(function(){
        updateUIVisibility(submit, true); // Wait 1 second until show submit form
    }, 1000);
})

// Sets the title card image asset to normal/blur
function updateTitleCardImage(blurred, shown){
    if(blurred)
        title.src = "../images/misc/title card blurred.jpg";
    else
        title.src = "../images/misc/title_card.jpg";
}

var footerHolder;

//update footer position per screen size (especially height) since hidden elements still have heights
const updateFooterPos = function(){
    const actabs = document.getElementById('actionables');
    actabs.style.height = "fit-content";
    const hboFooter = document.getElementById('footerChecker');
    const actFooter = document.getElementById('footer');
    footerHolder = document.getElementById('footer-holder');
    var shownH = 5;
    let i = 0;
    while (actabs.children[i]) {
        //getting height of current showing elements
        if (actabs.children[i].classList.contains("shown")) {
            let tempH = 0;
            //mobile view, buttons are laying down vertically
            if (window.innerWidth < 576) {
                for (let j = 0; actabs.children[i].children[j]; j += 1) {
                    tempH += actabs.children[i].children[j].clientHeight;
                }
            }
            //for other views buttons are laying down horizontally
            else {
                for (let j = 0; actabs.children[i].children[0].children[j]; j += 1) {
                    //go in one more level to ensure hight wont be effect by it's parent
                    tempH += actabs.children[i].children[0].children[j].clientHeight;
                }
                tempH += 25;
            }
            shownH = tempH;
        }
        i += 1;
    }
    var height = window.innerHeight ? window.innerHeight : $(window).height();
    actabs.style.height = String(shownH + 65) + "px";
    var hboFooterPos = hboFooter.getBoundingClientRect();
    //occupy whole reaming height if screen is too high
    if (hboFooter.offsetTop + 150 < window.innerHeight) {
        footerHolder.style.height = String(window.innerHeight - hboFooter.offsetTop) + "px";
    }
    //default height of footer
    else{
        footerHolder.style.height = "150px";
    }
}

// When window resizes, update footer
window.addEventListener("resize", () => {
    if (window.innerWidth != windowWidth) {
        updateFooterPos();
    }
});

// Show footer when DOM loads
window.addEventListener("DOMContentLoaded", () => {
    updateUIVisibility(footerHolder, true);
}); 

// Move window to top during sequence
function toTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}