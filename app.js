document.addEventListener('DOMContentLoaded', () => {
    const frontScreen = document.getElementById('screen-front');
    const appsScreen = document.getElementById('screen-apps');
    const nextBtn = document.getElementById('next-btn');
    const audioBtn = document.getElementById('audio-btn');
    const wordEls = document.querySelectorAll('#front-text .word');

    const welcomeAudio = new Audio('audio/welkom.mp3');
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

    nextBtn.addEventListener('click', () => {
        welcomeAudio.pause();
        welcomeAudio.currentTime = 0;
        clearHighlight();
        frontScreen.classList.add('hidden');
        appsScreen.classList.remove('hidden');
    });

    audioBtn.addEventListener('click', () => {
        if (!welcomeAudio.paused) {
            welcomeAudio.pause();
            welcomeAudio.currentTime = 0;
            clearHighlight();
            return;
        }

        audioBtn.classList.add('speaking');
        welcomeAudio.play();
    });
});
