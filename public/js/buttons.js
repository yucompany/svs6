'use strict';

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
        console.log('DOWNLOADING PHOTO');
        save(canvas, 'screen.jpg');
    });
}

// Download Video Button
const downloadVideo = document.getElementById('dlVideo');
if (downloadVideo) {
    downloadVideo.addEventListener('click', () => {
        console.log('DOWNLOADING VIDEO');
        capture.video;
    });
}

// Share to Facebook Button
const facebookShare = document.getElementById('shareFacebook');
if (facebookShare) {
    facebookShare.addEventListener('click', async () => {
        const videoFilePath = capture.getVideoFile(this.name);

        if (videoFilePath) {
            // Start S3 Upload.
            await beginUploadToS3(videoFilePath);

            // showFacebookShare(videoFilePath);
        } else {
            alert('Please click the "Download" button first to generate an .mp4 video in the output directory.');
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
function beginUploadToS3(file) {
    console.log('Show Loading...');
      $.ajax({
        type: 'POST',
        url: '/aws/s3upload',
        data: {
            videoFilePath: '/output/MAX_SORTO.mp4'
        },

        success: (response) => {
             console.log({ response });
        },

        error: (err) => {
            throw err;
        },

        complete: () => {
            console.log('End Loading...');
        }
    });
}