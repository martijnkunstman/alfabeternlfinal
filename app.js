document.addEventListener('DOMContentLoaded', () => {
    const frontScreen = document.getElementById('screen-front');
    const appsScreen = document.getElementById('screen-apps');
    const nextBtn = document.getElementById('next-btn');
    const audioBtn = document.getElementById('audio-btn');
    const audioBtnHd = document.getElementById('audio-btn-hd');
    const wordEls = document.querySelectorAll('#front-text .word');

    const welcomeAudio = new Audio('audio/welkom.mp3');
    const welcomeAudioHd = new Audio('audio/welkom-hd.mp3');
    let cues = [];

    fetch('audio/welkom.json')
        .then(res => res.json())
        .then(data => { cues = data.cues || []; })
        .catch(() => { cues = []; });

    function clearHighlight() {
        wordEls.forEach(el => el.classList.remove('active'));
    }

    function highlightForTime(time) {
        let current = null;
        for (const cue of cues) {
            if (cue.time <= time) {
                current = cue;
            } else {
                break;
            }
        }
        clearHighlight();
        if (current) {
            const el = document.querySelector(`#front-text .word[data-i="${current.i}"]`);
            if (el) el.classList.add('active');
        }
    }

    let pollTimer = null;

    function pollHighlight() {
        highlightForTime(welcomeAudio.currentTime);
        pollTimer = setTimeout(pollHighlight, 30);
    }

    function startPolling() {
        stopPolling();
        pollTimer = setTimeout(pollHighlight, 30);
    }

    function stopPolling() {
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
    }

    function stopWelcomeAudio() {
        welcomeAudio.pause();
        welcomeAudio.currentTime = 0;
    }

    function stopWelcomeAudioHd() {
        welcomeAudioHd.pause();
        welcomeAudioHd.currentTime = 0;
    }

    welcomeAudio.addEventListener('play', startPolling);
    welcomeAudio.addEventListener('timeupdate', () => highlightForTime(welcomeAudio.currentTime));
    welcomeAudio.addEventListener('ended', () => {
        stopPolling();
        audioBtn.classList.remove('speaking');
        clearHighlight();
    });
    welcomeAudio.addEventListener('pause', () => {
        stopPolling();
        audioBtn.classList.remove('speaking');
    });

    welcomeAudioHd.addEventListener('ended', () => audioBtnHd.classList.remove('speaking'));
    welcomeAudioHd.addEventListener('pause', () => audioBtnHd.classList.remove('speaking'));

    nextBtn.addEventListener('click', () => {
        stopWelcomeAudio();
        stopWelcomeAudioHd();
        clearHighlight();
        frontScreen.classList.add('hidden');
        appsScreen.classList.remove('hidden');
    });

    audioBtn.addEventListener('click', () => {
        if (!welcomeAudio.paused) {
            stopWelcomeAudio();
            clearHighlight();
            return;
        }

        stopWelcomeAudioHd();
        audioBtn.classList.add('speaking');
        welcomeAudio.play();
    });

    audioBtnHd.addEventListener('click', () => {
        if (!welcomeAudioHd.paused) {
            stopWelcomeAudioHd();
            return;
        }

        stopWelcomeAudio();
        clearHighlight();
        audioBtnHd.classList.add('speaking');
        welcomeAudioHd.play();
    });

    const appBtnLezen = document.getElementById('app-btn-lezen');
    const appBtnNetnieuws = document.getElementById('app-btn-netnieuws');
    const infoBtn = document.getElementById('info');
    const startLezenAudio = new Audio('audio/start-lezen.mp3');
    const startNetnieuwsAudio = new Audio('audio/start-netnieuws.mp3');
    const meerInformatieAudio = new Audio('audio/meer-informatie.mp3');

    const underlayVideoAudios = [
        [document.getElementById('underlayvideo1'), new Audio('audio/underlayvideo1.mp3')],
        [document.getElementById('underlayvideo2'), new Audio('audio/underlayvideo2.mp3')],
        [document.getElementById('underlayvideo3'), new Audio('audio/underlayvideo3.mp3')],
        [document.getElementById('underlayvideo4'), new Audio('audio/underlayvideo4.mp3')]
    ];

    function stopAppButtonAudio() {
        startLezenAudio.pause();
        startLezenAudio.currentTime = 0;
        startNetnieuwsAudio.pause();
        startNetnieuwsAudio.currentTime = 0;
        meerInformatieAudio.pause();
        meerInformatieAudio.currentTime = 0;
        underlayVideoAudios.forEach(([, audio]) => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    appBtnLezen.addEventListener('mouseenter', () => {
        stopAppButtonAudio();
        startLezenAudio.play();
    });
    appBtnLezen.addEventListener('mouseleave', stopAppButtonAudio);

    appBtnNetnieuws.addEventListener('mouseenter', () => {
        stopAppButtonAudio();
        startNetnieuwsAudio.play();
    });
    appBtnNetnieuws.addEventListener('mouseleave', stopAppButtonAudio);

    infoBtn.addEventListener('mouseenter', () => {
        stopAppButtonAudio();
        meerInformatieAudio.play();
    });
    infoBtn.addEventListener('mouseleave', stopAppButtonAudio);

    underlayVideoAudios.forEach(([el, audio]) => {
        el.addEventListener('mouseenter', () => {
            stopAppButtonAudio();
            audio.play();
        });
        el.addEventListener('mouseleave', stopAppButtonAudio);
    });

    const videoModal = document.getElementById('video-modal');
    const videoModalPlayer = document.getElementById('video-modal-player');
    const videoModalClose = document.getElementById('video-modal-close');
    const videoSources = {
        underlayvideo1: 'videos/video1.mp4',
        underlayvideo2: 'videos/video2.mp4',
        underlayvideo3: 'videos/video3.mp4',
        underlayvideo4: 'videos/video4.mp4'
    };

    function openVideoModal(src) {
        stopAppButtonAudio();
        videoModalPlayer.src = src;
        videoModal.classList.remove('hidden');
        videoModalPlayer.play();
    }

    function closeVideoModal() {
        videoModal.classList.add('hidden');
        videoModalPlayer.pause();
        videoModalPlayer.src = '';
    }

    underlayVideoAudios.forEach(([el]) => {
        el.addEventListener('click', () => openVideoModal(videoSources[el.id]));
    });

    videoModalClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
    });
});
