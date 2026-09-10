class SoundController {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.ringtoneTimer = null;
    this.bgmTimer = null;
    this.isRingtonePlaying = false;
    this.isBgmPlaying = false;
  }
  init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.22;
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") this.audioCtx.resume();
  }
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }
  playNote(freq, duration, type = "sine", timeOffset = 0, volume = 0.3) {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const start = this.audioCtx.currentTime + timeOffset;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(start); osc.stop(start + duration);
    } catch (e) { console.warn(e); }
  }
  startRingtone() {
    if (this.isRingtonePlaying) return;
    this.init();
    this.isRingtonePlaying = true;
    const playRingtonePattern = () => {
      if (!this.isRingtonePlaying) return;
      const notes = [
        { f: 659.25, d: 0.14, t: 0.0 }, { f: 830.61, d: 0.14, t: 0.16 },
        { f: 987.77, d: 0.14, t: 0.32 }, { f: 1318.51, d: 0.28, t: 0.48 },
        { f: 987.77, d: 0.14, t: 0.82 }, { f: 1318.51, d: 0.35, t: 0.98 }
      ];
      notes.forEach(n => this.playNote(n.f, n.d, "triangle", n.t, 0.35));
    };
    playRingtonePattern();
    this.ringtoneTimer = setInterval(playRingtonePattern, 2400);
  }
  stopRingtone() {
    this.isRingtonePlaying = false;
    if (this.ringtoneTimer) { clearInterval(this.ringtoneTimer); this.ringtoneTimer = null; }
  }
  playConnectChime() {
    this.init();
    const chord = [
      { f: 523.25, t: 0.0 }, { f: 659.25, t: 0.09 },
      { f: 783.99, t: 0.18 }, { f: 1046.5, t: 0.27 }
    ];
    chord.forEach(n => this.playNote(n.f, 0.45, "sine", n.t, 0.4));
  }
  playDeclineSound() {
    this.init();
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const start = this.audioCtx.currentTime;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, start);
      osc.frequency.exponentialRampToValueAtTime(110, start + 0.3);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(start); osc.stop(start + 0.3);
    } catch (e) { console.warn(e); }
  }
  startBirthdayBGM() {
    if (this.isBgmPlaying) return;
    this.init();
    this.isBgmPlaying = true;
    const melody = [
      { f: 261.63, d: 0.28, t: 0.0 }, { f: 261.63, d: 0.14, t: 0.35 },
      { f: 293.66, d: 0.45, t: 0.55 }, { f: 261.63, d: 0.45, t: 1.05 },
      { f: 349.23, d: 0.45, t: 1.55 }, { f: 329.63, d: 0.85, t: 2.05 },
      { f: 261.63, d: 0.28, t: 3.1 }, { f: 261.63, d: 0.14, t: 3.45 },
      { f: 293.66, d: 0.45, t: 3.65 }, { f: 261.63, d: 0.45, t: 4.15 },
      { f: 392.0, d: 0.45, t: 4.65 }, { f: 349.23, d: 0.85, t: 5.15 },
      { f: 261.63, d: 0.28, t: 6.2 }, { f: 261.63, d: 0.14, t: 6.55 },
      { f: 523.25, d: 0.45, t: 6.75 }, { f: 440.0, d: 0.45, t: 7.25 },
      { f: 349.23, d: 0.45, t: 7.75 }, { f: 329.63, d: 0.45, t: 8.25 },
      { f: 293.66, d: 0.6, t: 8.75 }, { f: 466.16, d: 0.28, t: 9.6 },
      { f: 466.16, d: 0.14, t: 9.95 }, { f: 440.0, d: 0.45, t: 10.15 },
      { f: 349.23, d: 0.45, t: 10.65 }, { f: 392.0, d: 0.45, t: 11.15 },
      { f: 349.23, d: 1.1, t: 11.65 }
    ];
    const loopLength = 13.5;
    const playLoop = () => {
      if (!this.isBgmPlaying) return;
      melody.forEach(note => {
        this.playNote(note.f, note.d, "triangle", note.t, 0.28);
        this.playNote(note.f * 0.5, note.d * 0.9, "sine", note.t, 0.15);
      });
    };
    playLoop();
    this.bgmTimer = setInterval(playLoop, loopLength * 1000);
  }
  stopBirthdayBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
  }
}

const sounds = new SoundController();

const generateBalloons = () => {
  const container = document.getElementById("baloons-container");
  if (!container) return;
  const positions = [
    { top: 10, left: 5, cls: "b1", delay: 0 }, { top: 15, right: 8, cls: "b2", delay: 0.5 },
    { top: 25, left: 30, cls: "b3", delay: 1 }, { top: 40, right: 20, cls: "b1", delay: 1.5 },
    { top: 55, left: 15, cls: "b2", delay: 2 }, { top: 65, right: 5, cls: "b3", delay: 2.5 },
    { top: 75, left: 45, cls: "b1", delay: 0.8 }, { top: 30, left: 75, cls: "b2", delay: 1.2 },
    { top: 60, right: 40, cls: "b3", delay: 1.8 }, { top: 80, right: 25, cls: "b1", delay: 2.2 },
    { top: 5, left: 55, cls: "b2", delay: 0.3 }, { top: 50, left: 60, cls: "b3", delay: 1.4 }
  ];
  positions.forEach(p => {
    const b = document.createElement("div");
    b.className = `balloon ${p.cls}`;
    if (p.left !== undefined) b.style.left = p.left + "%";
    if (p.right !== undefined) b.style.right = p.right + "%";
    if (p.top !== undefined) b.style.top = p.top + "%";
    b.style.animationDelay = p.delay + "s";
    container.appendChild(b);
  });
};

const setupSoundToggle = () => {
  const soundToggle = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");
  if (soundToggle && soundIcon) {
    soundToggle.addEventListener("click", () => {
      sounds.init();
      const isMuted = sounds.toggleMute();
      soundIcon.innerText = isMuted ? "🔇" : "🔊";
    });
  }
};

const setupPrankCall = (data) => {
  const prankScreen = document.getElementById("prank-screen");
  const btnAccept = document.getElementById("btn-accept");
  const btnDecline = document.getElementById("btn-decline");
  const declineWrapper = document.getElementById("decline-wrapper");
  const callerNameEl = document.getElementById("prank-caller-name");
  const callStatusEl = document.getElementById("prank-call-status");
  const callerAvatar = document.getElementById("prank-avatar");
  const declineWarning = document.getElementById("prank-decline-warning");

  if (!prankScreen) { animationTimeline(); return; }

  if (data.prankCallerName && callerNameEl) callerNameEl.innerText = data.prankCallerName;
  if (data.prankCallStatus && callStatusEl) callStatusEl.innerText = data.prankCallStatus;
  if (data.imagePath && callerAvatar) callerAvatar.setAttribute("src", data.imagePath);

  if (data.enablePrankCall === false) {
    prankScreen.style.display = "none";
    animationTimeline();
    return;
  }

  const startRingtoneOnce = () => {
    sounds.startRingtone();
    window.removeEventListener("pointerdown", startRingtoneOnce);
    window.removeEventListener("keydown", startRingtoneOnce);
  };
  window.addEventListener("pointerdown", startRingtoneOnce);
  window.addEventListener("keydown", startRingtoneOnce);

  const declineQuotes = [
    "⚠️ Error 404: Birthday calls cannot be declined! 😂",
    "❌ Access Denied: Declining adds +5 years to your age! 😜",
    "🏃💨 Whoops! The decline button is dodging you!",
    "🎉 Resistance is futile! You have to accept! 🥳",
    "🎂 Cake delivery in progress... Accept now!"
  ];

  let declineCount = 0;

  if (btnDecline) {
    const handleDeclineClick = (e) => {
      e.stopPropagation();
      declineCount++;
      sounds.playDeclineSound();
      btnDecline.classList.remove("shake-anim");
      void btnDecline.offsetWidth;
      btnDecline.classList.add("shake-anim");
      const quoteIndex = (declineCount - 1) % declineQuotes.length;
      declineWarning.innerText = declineQuotes[quoteIndex];
      declineWarning.classList.add("show");
      if (declineCount >= 2 && declineWrapper) {
        const randomX = (Math.random() - 0.5) * 110;
        const randomY = (Math.random() - 0.5) * 60;
        declineWrapper.style.transform = `translate(${randomX}px, ${randomY}px)`;
      }
    };
    btnDecline.addEventListener("click", handleDeclineClick);
  }

  if (btnAccept) {
    btnAccept.addEventListener("click", (e) => {
      e.stopPropagation();
      sounds.stopRingtone();
      sounds.playConnectChime();
      if (callStatusEl) callStatusEl.innerText = "Connected! 📞 Loading celebration...";
      if (declineWrapper) {
        declineWrapper.style.opacity = "0";
        declineWrapper.style.pointerEvents = "none";
      }
      setTimeout(() => {
        sounds.startBirthdayBGM();
        prankScreen.classList.add("fade-out");
        animationTimeline();
      }, 700);
    });
  }
};

const fetchData = () => {
  setupSoundToggle();
  generateBalloons();
  fetch("customize.json")
    .then(data => data.json())
    .then(data => {
      Object.keys(data).map(customData => {
        if (data[customData] !== "") {
          const elem = document.querySelector(`[data-node-name*="${customData}"]`);
          if (elem) {
            if (customData === "imagePath") elem.setAttribute("src", data[customData]);
            else elem.innerText = data[customData];
          }
        }
      });
      setupPrankCall(data);
    })
    .catch(err => {
      console.warn("Could not load customize.json:", err);
      animationTimeline();
    });
};

let masterTimeline = null;

const animationTimeline = () => {
  if (masterTimeline) {
    masterTimeline.restart();
    sounds.startBirthdayBGM();
    const btn = document.getElementById("next-surprise-btn");
    if (btn) btn.classList.remove("visible");
    return;
  }

  const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
  const hbd = document.getElementsByClassName("wish-hbd")[0];

  if (textBoxChars) {
    textBoxChars.innerHTML = textBoxChars.innerText
      .split("").map(char => (char === " " ? `<span style="display:inline-block; width:0.35em;">&nbsp;</span>` : `<span>${char}</span>`)).join("");
  }
  if (hbd) {
    hbd.innerHTML = hbd.innerText
      .split("").map(char => (char === " " ? `<span style="display:inline-block; width:0.35em;">&nbsp;</span>` : `<span>${char}</span>`)).join("");
  }

  const ideaTextTrans = { opacity: 0, y: -20, rotationX: 5, skewX: "15deg" };
  const ideaTextTransLeave = { opacity: 0, y: 20, rotationY: 5, skewX: "-15deg" };

  const tl = new TimelineMax();
  masterTimeline = tl;

  tl.to(".container", 0.1, { visibility: "visible" })
    .from(".one", 0.7, { opacity: 0, y: 10 })
    .from(".two", 0.4, { opacity: 0, y: 10 })
    .to(".one", 0.7, { opacity: 0, y: 10 }, "+=2.5")
    .to(".two", 0.7, { opacity: 0, y: 10 }, "-=1")
    .from(".three", 0.7, { opacity: 0, y: 10 })
    .to(".three", 0.7, { opacity: 0, y: 10 }, "+=2")
    .from(".four", 0.7, { scale: 0.2, opacity: 0 })
    .from(".fake-btn", 0.3, { scale: 0.2, opacity: 0 })
    .staggerTo(".hbd-chatbox span", 0.5, { visibility: "visible" }, 0.05)
    .to(".fake-btn", 0.1, { backgroundColor: "#ec4899" })
    .to(".four", 0.5, { scale: 0.2, opacity: 0, y: -150 }, "+=0.7")
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, { scale: 1.2, x: 10, backgroundColor: "#ec4899", color: "#fff" })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-5", 0.7, { rotationX: 15, rotationZ: -10, skewY: "-5deg", y: 50, z: 10, opacity: 0 }, "+=0.5")
    .to(".idea-5 .smiley", 0.7, { rotation: 90, x: 8 }, "+=0.4")
    .to(".idea-5", 0.7, { scale: 0.2, opacity: 0 }, "+=2")
    .staggerFrom(".idea-6 span", 0.8, { scale: 3, opacity: 0, rotation: 15, ease: Expo.easeOut }, 0.2)
    .staggerTo(".idea-6 span", 0.8, { scale: 3, opacity: 0, rotation: -15, ease: Expo.easeOut }, 0.2, "+=1")
    .staggerFromTo(".balloon", 2.5, { opacity: 0.9, y: 1400 }, { opacity: 1, y: -1000 }, 0.15)
    .from(".lydia-dp", 0.5, { scale: 3.5, opacity: 0, x: 25, y: -25, rotationZ: -45 }, "-=2")
    .from(".hat", 0.6, { y: -130, rotation: -35, opacity: 0, ease: Back.easeOut.config(1.7) })
    .staggerFrom(".wish-hbd span", 0.7, { opacity: 0, y: -50, rotation: 150, skewX: "30deg", ease: Elastic.easeOut.config(1, 0.5) }, 0.1)
    .staggerFromTo(".wish-hbd span", 0.7, { scale: 1.4, rotationY: 150 }, { scale: 1, rotationY: 0, color: "#ff69b4", ease: Expo.easeOut }, 0.1, "party")
    .from(".wish h5", 0.5, { opacity: 0, y: 10, skewX: "-15deg" }, "party")
    .staggerTo(".eight svg", 1.5, { visibility: "visible", opacity: 0, scale: 80, repeat: 3, repeatDelay: 1.4 }, 0.3)
    .to(".six", 0.5, { opacity: 0, y: 30, zIndex: "-1" })
    .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
    .to(".last-smile", 0.5, { rotation: 90 }, "+=1")
    .to(".next-surprise-btn", 0.8, {
      opacity: 1, y: 0, pointerEvents: "auto",
      onComplete: () => {
        document.getElementById("next-surprise-btn").classList.add("visible");
      }
    }, "-=0.5");

  const replayBtn = document.getElementById("replay");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      tl.restart();
      sounds.startBirthdayBGM();
      const btn = document.getElementById("next-surprise-btn");
      if (btn) btn.classList.remove("visible");
    });
  }
};

fetchData();
