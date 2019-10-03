'use strict';

const downloadPhoto = document.getElementById('dlPhoto');
const downloadVideo = document.getElementById('dlPhoto');
const facebookShare = document.getElementById('shareFacebook');
const twitterShare  = document.getElementById('shareTwitter');

downloadPhoto.addEventListener('click', () => {
    save(canvas, 'screen.jpg');
});

downloadVideo.addEventListener('click', () => {
    capture.video;
});

facebookShare.addEventListener('click', () => {
    const videoFilePath = capture.getVideoFile(this.name);

    if (videoFilePath) {
        console.log(videoFilePath);
        // showFacebookShare(videoFilePath);
    } else {
        alert('Please click the "Download" button first to generate an .mp4 video in the output directory.');
    }
});

twitterShare.addEventListener('click', () => {
    // showTwitterShare();
});

function showFacebookShare() {
    window.FB.ui({
        method: 'share_open_graph',
        action_type: 'og.shares',
        action_properties: JSON.stringify({
            object: {
                'og:url': window.location.href,
                'og:title': 'BE THE VALLEY DEEP LINK TITLE',
                'og:description': `#BeTheValley`,
                'og:image': this.userData.output_still_1 || this.userData.output_file
            }
        })
    }, () => {});
}

function showTwitterShare() {
    window.open(`http://twitter.com/share?text=${this.social.message}&url=${encodeURIComponent(this.userData.shareUrl)}&hashtags=${this.social.hashtags}&via=${this.social.via}`, '', 'width=720,height=250');
}