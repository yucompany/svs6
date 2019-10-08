'use strict';

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
            capture.photo();
        });
    }

    // Download Video Button
    const downloadVideo = document.getElementById('dlVideo');
    if (downloadVideo) {
        downloadVideo.addEventListener('click', () => {
            prepareVideoDownload();
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
});

// Helper function for Facebook sharing
function showFacebookShare() {
    window.FB.ui({
        method: 'share_open_graph',
        action_type: 'og.shares',
        action_properties: JSON.stringify({
            object: {
                'og:url': 'https://developers.facebook.com/docs/',
                'og:title': 'BE THE VALLEY DEEP LINK TITLE',
                'og:description': `#BeTheValley`,
                'og:image': ''
            }
        })
    }, (response) => {
        console.log(response);
    });
}

// Helper function for Twitter sharing
function showTwitterShare() {
    window.open(`http://twitter.com/share?text=BE%20THE%20VALLEY&url=${encodeURIComponent('www.google.com')}&hashtags=#BeTheValley&via=leexperiential`, '', 'width=720,height=250');
}

// Goes throw the motions of uploading a video to S3/Server then returning it to user.
function prepareVideoDownload() {
    // Before encoding anything, let's see if this video is already stored in S3.
    const s3Key = generateKeyFromInput();

    checkIfVideoExists(s3Key)
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
}

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
    });
}

// Checks if we already have a generated video stored in S3. Returns boolean.
function checkIfVideoExists(s3Key) {
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
    return `/output/${$('#firstInput').val().toUpperCase()}_${$('#lastInput').val().toUpperCase()}.mp4`;
}

// Starts a video download.
function triggerVideoDownload(videoFile, cached) {
    const link = document.createElement('a');

    if (cached) {
        // We'll want to replace this with the client's S3 bucket address.
        link.href = 'https://social-sharing-install.s3-us-west-2.amazonaws.com/tec-demo' + videoFile;
    } else {
        link.href = videoFile;
    }

    if (link.href) {
        // File name for downloaded file.
        link.download = FIRSTNAME + "_" + LASTNAME +  "_VALLEY.mp4";

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
    link.download = FIRSTNAME + '_' + LASTNAME + '_VALLEY.jpg';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Rick dev
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

addEventListener('initialized', () => {
    updateUIVisibility(title, false);
    updateUIVisibility(submit, false);
});

addEventListener('captured', () => {
    updateUIVisibility(exporting, true);
});

addEventListener('resetted', () => {
    updateUIVisibility(exporting, false);
    updateUIVisibility(replay, false);

    // Clear form
    nameform.reset();

    setTimeout(function(){
        updateUIVisibility(submit, true);
    }, 1000);
})

addEventListener('restarted', () => {
    updateUIVisibility(replay, false);
});

addEventListener('ended', () => {
    updateUIVisibility(replay, true);
});