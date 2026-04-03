function playBootSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // Base resonant chime (complex multi-oscillator chord)
    const freqs = [329.63, 415.30, 493.88, 659.25, 830.61]; // E Majorish bright chord
    freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);

        // Add slight detune for richness
        osc.detune.setValueAtTime(i * 3, now);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        // Slow sweeping attack and very long echoing decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 / freqs.length, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // 5 sec echoing tail

        osc.start(now);
        osc.stop(now + 6);
    });

    // The sharp 'sparkle' high pitch component at start
    const oscHigh = audioCtx.createOscillator();
    const gainHigh = audioCtx.createGain();
    oscHigh.type = 'sine';
    oscHigh.frequency.setValueAtTime(2637.02, now); // High E
    oscHigh.frequency.exponentialRampToValueAtTime(1318.51, now + 0.5); // Sweeps down

    oscHigh.connect(gainHigh);
    gainHigh.connect(audioCtx.destination);

    gainHigh.gain.setValueAtTime(0, now);
    gainHigh.gain.linearRampToValueAtTime(0.05, now + 0.05); // Sharp attack
    gainHigh.gain.exponentialRampToValueAtTime(0.0001, now + 1.0); // Fast decay

    oscHigh.start(now);
    oscHigh.stop(now + 1.5);
}

window.addEventListener('load', () => {
    const bootContainer = document.getElementById('sony-boot');
    if (!bootContainer) return;

    // Inject Orbitron font
    if (!document.querySelector('link[href*="Orbitron"]')) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap';
        document.head.appendChild(fontLink);
    }

    // Create Start Overlay
    const startOverlay = document.createElement('div');
    startOverlay.style.cssText = 'position:absolute; inset:0; z-index:9999; background:#020205; display:flex; justify-content:center; align-items:center; color:#fff; font-family:"Orbitron", sans-serif; font-size:24px; font-weight:bold; cursor:pointer; text-align:center; flex-direction:column; padding:20px; overflow:hidden;';
    startOverlay.innerHTML = `
        <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.6;" viewBox="0 0 500 300" preserveAspectRatio="none">
            <defs>
                <linearGradient id="so-wg1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="rgba(80,30,180,0)" />
                    <stop offset="50%" stop-color="rgba(80,30,180,0.35)" />
                    <stop offset="100%" stop-color="rgba(80,30,180,0)" />
                </linearGradient>
                <linearGradient id="so-wg2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="rgba(40,80,220,0)" />
                    <stop offset="50%" stop-color="rgba(40,80,220,0.25)" />
                    <stop offset="100%" stop-color="rgba(40,80,220,0)" />
                </linearGradient>
                <linearGradient id="so-wg3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="rgba(120,50,200,0)" />
                    <stop offset="50%" stop-color="rgba(120,50,200,0.2)" />
                    <stop offset="100%" stop-color="rgba(120,50,200,0)" />
                </linearGradient>
            </defs>
            <path fill="none" stroke="url(#so-wg1)" stroke-width="2.5" filter="blur(2px)">
                <animate attributeName="d" values="M0,150 C125,100 250,200 375,130 500,150;M0,140 C125,190 250,90 375,160 500,140;M0,150 C125,100 250,200 375,130 500,150" dur="8s" repeatCount="indefinite" />
            </path>
            <path fill="none" stroke="url(#so-wg2)" stroke-width="2" filter="blur(3px)">
                <animate attributeName="d" values="M0,180 C100,140 200,210 300,160 400,190 500,170;M0,170 C100,200 200,130 300,190 400,150 500,180;M0,180 C100,140 200,210 300,160 400,190 500,170" dur="11s" repeatCount="indefinite" />
            </path>
            <path fill="none" stroke="url(#so-wg3)" stroke-width="3" filter="blur(4px)">
                <animate attributeName="d" values="M0,200 C160,160 320,240 500,190;M0,190 C160,230 320,150 500,200;M0,200 C160,160 320,240 500,190" dur="14s" repeatCount="indefinite" />
            </path>
        </svg>
        <div style="position:relative; z-index:1; letter-spacing:6px; font-size:18px; font-weight:700; color:rgba(255,255,255,0.9); text-shadow: 0 0 20px rgba(120,80,220,0.5), 0 0 40px rgba(60,120,255,0.2);">
            CLICK TO START <span style="font-weight:900; letter-spacing:8px;">PSP</span>
        </div>
        <div style="position:relative; z-index:1; margin-top:12px; font-size:10px; font-weight:400; letter-spacing:4px; color:rgba(255,255,255,0.3); text-transform:uppercase;">PlayStation Portable</div>
    `;

    // Append to screen div if exists, otherwise body
    const screen = document.getElementById('psp-screen');
    if (screen) {
        screen.appendChild(startOverlay);
    } else {
        document.body.appendChild(startOverlay);
    }

    startOverlay.addEventListener('click', () => {
        startOverlay.remove();

        // Show boot sequence (this triggers css animations since they were hidden)
        const bootOverlay = document.querySelector('.boot-overlay');
        if (bootOverlay) bootOverlay.style.display = 'flex';
        bootContainer.style.display = 'flex';

        // Start audio sequence naturally on load (Browser may block unless previously interacted, but animation plays)
        setTimeout(() => {
            try {
                initAudio();
                playBootSound();
            } catch (e) { }
        }, 1000);

        // Fade out the entire black boot screen to reveal XMB underneath
        setTimeout(() => {
            bootContainer.style.opacity = '0';
            setTimeout(() => {
                bootContainer.style.display = 'none';
                if (bootOverlay) bootOverlay.style.display = 'none';
                isBooted = true; // Unlock controls
            }, 2000);
        }, 10000); // Total boot animation is around ~10s
    });
});
