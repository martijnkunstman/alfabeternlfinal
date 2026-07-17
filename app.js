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
    const startLezenAudio = new Audio('audio/start-lezen.mp3');
    const startNetnieuwsAudio = new Audio('audio/start-netnieuws.mp3');

    function stopAppButtonAudio() {
        startLezenAudio.pause();
        startLezenAudio.currentTime = 0;
        startNetnieuwsAudio.pause();
        startNetnieuwsAudio.currentTime = 0;
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
});
