'use strict';

let DEEP_LINK_ID = null;
const S3URL = 'https://social-sharing-install.s3-us-west-2.amazonaws.com/tec-demo';

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

    if(videoPreview){
        /*videoPreview.addEventListener('click', () => {
            videoPreview.pause();
            videoPreview.currentTime = '0';
            videoPreview.play();
        });*/
    }
});

const videoPreview = document.getElementById("video-preview");

const loading = document.getElementById("loading");
const loadingHolder = document.getElementById("loading-holder");
const progress = document.getElementById("percentage");

function updateProgressBar(percent){
    if(progress == undefined)
        return;

    let prg = Math.floor(percent*100);
    progress.innerHTML = prg + "%";
}

const onPreview = new Event("previewed");

videoPreview.onloadeddata = () => {
    dispatchEvent(onPreview);
}

function showVideoPreview(){
    videoPreview.src = VIDEOURL
    videoPreview.load();

    updateUIVisibility(videoPreview, true);
}


// Helper function for Facebook sharing
function showFacebookShare() {
    window.FB.ui({
        method: 'share',
        href: `http://bethevalley-test.us-west-2.elasticbeanstalk.com/?x=${DEEP_LINK_ID}`,
        quote: 'LOOK AT THIS CREATION!'
    }, (response) => {
        console.log(response);
    });
}

// Helper function for Twitter sharing
function showTwitterShare() {
    // Opens a pop-up with twitter sharing dialog
    let shareURL = 'http://twitter.com/share?'; //url base
    //params
    const params = {
     url: `http://bethevalley-test.us-west-2.elasticbeanstalk.com/?x=${DEEP_LINK_ID}`,
     text: 'BE THE VALLEY - CHECK THIS LINK OUT ->',
     via: 'leexperiential',
     hashtags: "BeTheValley,Creation"
    }
    for (let prop in params) shareURL += '&' + prop + '=' + encodeURIComponent(params[prop]);

    window.open(shareURL, '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');
}

/*function fetchVideo(){
    console.log("Attempting to fetch video...");
    // Before encoding anything, let's see if this video is already stored in S3.
    const s3Key = generateKeyFromInput();

    return checkIfKeyExists(s3Key)
    .then((cacheVideo) => {
        return new Promise(function(res, rej){
            if(!cacheVideo){
                // Encode video
                console.log('No stored version of this video found - server now encoding to .mp4');
                capture.video()
                .then((videoFile) => {
                    if(videoFile){
                        res(videoFile);
                        beginUploadToS3(videoFile);
                    }
                })
            }
            else{
                let s3path = 'https://social-sharing-install.s3-us-west-2.amazonaws.com/tec-demo' + s3Key;
                res(s3path); // Found cached video, return this
            }

        })
    })
}*/

function prepareExports(){
    const s3Key = generateKeyFromInput();

    return checkIfKeyExists(s3Key)
    .then((cached) => {

        return new Promise(function(resolve, reject){

            if(!cached){  // NO => existing data on S3

                capture.photo()
                .then((imageFile) => {

                    capture.video()
                    .then((videoFile) => {

                        beginUploadToS3(videoFile)
                        .then((deeplink) => {
                            window.history.replaceState(null, null, '?x=' + deeplink);
                            resolve(deeplink); // Found cached media, return URL
                        })
                        .catch((err) => {
                            console.log("Error uploading media to S3!")
                            reject(err);
                        })

                    })
                    .catch((err) => {
                        console.log("Error creating video..." + err);
                        reject(err);
                    })

                })
                .catch((err) => {
                    console.log("Error creating photo..." + err);
                    reject(err);
                })

            }
            else { // YES => existing data on S3

                let videoFile = s3Key + ".mp4";

                const fetchResponse = fetch('aws/deepLink', {
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
                    .then((link) => {
                        console.log("Successfully fetched deeplink = " + link);
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
            console.log("Successfully bound exports!");

            PHOTOURL = S3URL + s3Key + ".jpg";
            VIDEOURL = S3URL + s3Key + ".mp4";

            $('#shareurl').val(window.location.origin + '?x=' + deeplink);
        }
    })


}

/*
// Goes through the motions of uploading a video to S3/Server then returning it to user.
function prepareVideoDownload() {
    // Before encoding anything, let's see if this video is already stored in S3.
    const s3Key = generateKeyFromInput();

    checkIfKeyExists(s3Key)
    .then((cacheVideo) => {
        if (!cacheVideo) {
            // Encode video
            console.log('No stored version of this video found - server now encoding to .mp4');

            capture.video()
            .then((videoFile) => {
                // Begin download before we begin the upload to S3 server side..
                triggerVideoDownload(videoFile, false);

                if (videoFile) {
                    console.log('Initiating S3 upload.');

                    beginUploadToS3(videoFile)
                    .then((deepLinkId) => {
                        DEEP_LINK_ID = deepLinkId;
                        // Show deepLink on client.
                        $('#shareurl').val(window.location.origin + '?x=' + deepLinkId);
                    })
                    .catch((err) => {
                        throw err;
                    });
                }
            })
            .catch((err) => {
                throw err;
            });
        } else {
            console.log('Trigger Download from S3 instead.');
            triggerVideoDownload(s3Key, true)
        }
    })
    .catch((err) => {
        throw err;
    });
}*/

// Begins upload to S3
function beginUploadToS3(videoFile) {
    return new Promise((resolve, reject) => {
        console.log('Note to dev: Show Loading in UI...');

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
                console.log('Note to dev: End Loading in UI...');
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
        console.log('Note to dev: Show Loading in UI...');

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
                console.log('Note to dev: End Loading in UI...');
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
    return `/output/${$('#firstInput').val().toUpperCase()}_${$('#lastInput').val().toUpperCase()}`;
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
        link.download = `${$('#firstInput').val().toUpperCase()}_${$('#lastInput').val().toUpperCase()}_VALLEY.mp4`;

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
    link.download = `${$('#firstInput').val().toUpperCase()}_${$('#lastInput').val().toUpperCase()}_VALLEY.jpg`
    console.log(link);

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

const updateUIVisibility = function(e, visible){
    if(e == null) return;

    if(visible){
      if(e.classList.contains("shown")) return;

      if(e.classList.contains("hidden"))
        e.classList.remove("hidden");

      e.classList.add("shown");
    }
    else{
      if(e.classList.contains("hidden")) return;

      if(e.classList.contains("shown"))
        e.classList.remove("shown");

      e.classList.add("hidden");
    }
}

addEventListener('started', () => {
    updateTitleCardImage(true);

    updateUIVisibility(loadingHolder, true);

    updateUIVisibility(submit, false);
    updateFooterPos();
});

addEventListener('ended', () => {

    updateUIVisibility(title, false);
    updateUIVisibility(loadingHolder, false);

    showVideoPreview();
    updateFooterPos();
});

addEventListener('previewed', () => {
    updateUIVisibility(exporting, true);
    updateFooterPos();
});

addEventListener('resetted', () => {
    updateTitleCardImage(false);
    updateUIVisibility(title, true);

    updateUIVisibility(exporting, false);
    updateUIVisibility(videoPreview, false);

    updateFooterPos();

    // Clear form
    nameform.reset();

    updateUIVisibility(title, true);
    setTimeout(function(){
        updateUIVisibility(submit, true);
    }, 1000);
})

function updateTitleCardImage(blurred, shown){
    if(blurred)
        title.src = "../images/misc/title card blurred.jpg";
    else
        title.src = "../images/misc/title card.jpg";
}

const updateFooterPos = function(){
    const actabs = document.getElementById('actionables');
    var childH = actabs.children[0].clientHeight;
    var longH = actabs.children[0].clientHeight;
    let i = 1;
    while (actabs.children[i]) {
        if (actabs.children[i].classList.contains("shown")) {
            childH = actabs.children[i].clientHeight;
        }
        if (actabs.children[i].clientHeight > longH) {
            longH = actabs.children[i].clientHeight;
        }
        i += 1;
    }
    childH += 30;
    //if (childH < longH) childH = longH;
    console.log("newHeight is:" + childH);
    actabs.style.height = childH + "px";
}

window.onload = updateFooterPos();
window.onresize = updateFooterPos();