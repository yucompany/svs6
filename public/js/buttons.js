'use strict';

// Exec on page load - Adding button action assignments.
$(document).ready(() => {
    // Replay Button
    const replay = document.getElementById('replay');
    if (replay) {
        replay.addEventListener('click', () => {
            reset();
        });
    }

    // Download Photo Button
    const downloadPhoto = document.getElementById('dlPhoto');
    if (downloadPhoto) {
        downloadPhoto.addEventListener('click', () => {
            save(canvas, 'screen.jpg');
        });
    }

    // Download Video Button
    const downloadVideo = document.getElementById('dlVideo');
    if (downloadVideo) {
        downloadVideo.addEventListener('click', async () => {
            // Before encoding anything, let's see if this video is already stored in S3.
            const s3Key = generateKeyFromInput();
            const cacheVideo = await checkIfVideoExists(s3Key);

            if (!cacheVideo) {
                // Encode video
                console.log('No stored version of this video found - server now encoding to .mp4');
                const videoFile = await capture.video();

                // Begin download before we begin the upload to S3 server side..
                triggerDownload(videoFile, false);

                if (videoFile) {
                    console.log('Initiating S3 upload.');
                    const deepLinkId = await beginUploadToS3(videoFile);

                    // Show deepLink on client.
                    $('#shareurl').val(window.location.origin + '?x=' + deepLinkId);

                    // At this point we may want to delete the video from static storage in express.
                    console.log('WIP - deleting video from static storage. this should probably happen on the server');
                }
            } else {
                console.log('Trigger Download from S3 instead.');
                triggerDownload(s3Key, true)
            }
        });
    }

    // Share to Facebook Button
    const facebookShare = document.getElementById('shareFacebook');
    if (facebookShare) {
        facebookShare.addEventListener('click', async () => {
            const videoFilePath = capture.getVideoFile(this.name);

            if (videoFilePath) {
                showFacebookShare(videoFilePath);
            } else {
                alert('Please click the "Video" button first to generate an .mp4 video in the output directory.');
            }
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
                'og:url': window.location.href,
                'og:title': 'BE THE VALLEY DEEP LINK TITLE',
                'og:description': `#BeTheValley`
                // 'og:image': this.userData.output_still_1 || this.userData.output_file
            }
        })
    }, () => {});
}

// Helper function for Twitter sharing
function showTwitterShare() {
    window.open(`http://twitter.com/share?text=BE%20THE%20VALLEY&url=${encodeURIComponent('www.google.com')}&hashtags=#BeTheValley&via=leexperiential`, '', 'width=720,height=250');
}

// Begins upload to S3
async function beginUploadToS3(file) {
    try {
        console.log('Note to dev: Show Loading in UI...');

        const result = await fetch('aws/s3upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                videoFilePath: file
            })
        });

        const response = await result.text();

        console.log('Note to dev: End Loading in UI...');

        return response;
    } catch (err) {
        console.log(err);
        console.log('Error uploading::\n', err);
    }
}

// Checks if we already have a generated video stored in S3. Returns boolean.
async function checkIfVideoExists(s3Key) {
    try {
        console.log('Note to dev: Show Loading in UI...');

        const result = await fetch('aws/s3cacheKey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                s3Key: s3Key
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

// Creates a key based on the input values - used to check if we already have something stored in S3.
function generateKeyFromInput() {
    return `/output/${$('#firstInput').val().toUpperCase()}_${$('#lastInput').val().toUpperCase()}.mp4`;
}

// Starts a download.
function triggerDownload(videoFile, cached) {
    const link = document.createElement('a');

    if (cached) {
        // We'll want to replace this with the client's S3 bucket address.
        link.href = 'https://social-sharing-install.s3-us-west-2.amazonaws.com/tec-demo' + videoFile;
    } else {
        link.href = videoFile;
    }

    if (link.href) {
        // File name for downloaded file.
        link.download = FIRSTNAME + "_" + LASTNAME + "_VALLEY.mp4";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}