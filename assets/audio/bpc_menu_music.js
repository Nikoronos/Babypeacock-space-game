(function () {
  // ---------------------------------------------
  // BPC Space – Rise of the Feather (Menu Theme)
  // Tone.js synth tabanlı sentez – telifsiz, tamamen özgün
  // ---------------------------------------------

  const bpm = 108;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [4, 4];

  // --- Master FX (reverb + delay + limiter) ---
  const masterVerb = new Tone.Reverb({ decay: 8, wet: 0.35 }).toDestination();
  const masterDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.2, wet: 0.25 }).connect(masterVerb);
  const masterLimiter = new Tone.Limiter(-3).connect(masterDelay);

  // --- Drone (uzay boşluğu sesi) ---
  const drone = new Tone.FMSynth({
    modulationIndex: 2,
    harmonicity: 0.25,
    oscillator: { type: "sine" },
    envelope: { attack: 4, sustain: 0.9, release: 3 },
  }).connect(new Tone.Filter(200, "lowpass").connect(masterLimiter));

  // --- Pad (yavaş geniş akorlar) ---
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 2.5, decay: 1.0, sustain: 0.6, release: 1.5 },
  }).connect(new Tone.Chorus(1.8, 2.5, 0.4).connect(masterLimiter));

  // --- Arpej lead (uzay yankısı) ---
  const lead = new Tone.Synth({
    oscillator: { type: "triangle8" },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.5, release: 0.4 },
  }).connect(new Tone.PingPongDelay({ delayTime: "8n", feedback: 0.35, wet: 0.3 }).connect(masterLimiter));

  // --- Davul (taiko/snare) ---
  const taiko = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 6,
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.6, sustain: 0 },
  }).connect(masterLimiter);

  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
  }).connect(new Tone.Filter(3500, "highpass").connect(masterLimiter));

  // --- Meteor efekti (opsiyonel) ---
  const meteorNoise = new Tone.Noise("brown").start();
  const meteorFilter = new Tone.Filter({ frequency: 1200, type: "bandpass", Q: 6 });
  const meteorVol = new Tone.Volume(-18);
  meteorNoise
    .connect(meteorFilter)
    .connect(new Tone.AutoFilter({ frequency: 0.05, depth: 0.9 }).start())
    .connect(new Tone.PitchShift({ pitch: -5 }))
    .connect(meteorVol)
    .connect(masterVerb);

  let sfxEnabled = false;
  meteorVol.mute = true;

  // --- Akor dizisi ---
  const chords = [
    ["A3", "C4", "E4"], // Am
    ["F3", "A3", "C4"], // F
    ["C3", "E3", "G3"], // C
    ["G3", "B3", "D4"], // G
  ];

  // --- Planlayıcı fonksiyonlar ---
  function scheduleDrone(startBar) {
    const t = Tone.Time(`${startBar}:0:0`).toSeconds();
    drone.triggerAttackRelease("A2", "8m", t, 0.7);
  }

  function schedulePads(startBar) {
    for (let i = 0; i < 4; i++) {
      const when = Tone.Time(`${startBar + i * 2}:0:0`).toSeconds();
      pad.triggerAttackRelease(chords[i], "2m", when, 0.6);
    }
  }

  const arpNotes = ["A4", "C5", "D5", "E5", "G5", "E5", "D5", "C5"];
  function scheduleArp(startBar) {
    const seq = new Tone.Sequence((time, note) => {
      lead.triggerAttackRelease(note, "8n", time, 0.7);
    }, arpNotes, "8n");
    seq.start(`${startBar}:0:0`);
    Tone.Transport.scheduleOnce(() => seq.stop(), `${startBar + 8}:0:0`);
  }

  function scheduleDrums(startBar) {
    for (let m = 0; m < 8; m++) {
      const bar = startBar + m;
      Tone.Transport.schedule((time) => taiko.triggerAttackRelease("A1", "8n", time, 0.9), `${bar}:0:0`);
      Tone.Transport.schedule((time) => taiko.triggerAttackRelease("A1", "8n", time, 0.9), `${bar}:2:0`);
      Tone.Transport.schedule((time) => snare.triggerAttackRelease("8n", time, 0.4), `${bar}:1:0`);
      Tone.Transport.schedule((time) => snare.triggerAttackRelease("8n", time, 0.45), `${bar}:3:0`);
      if (m % 4 === 0) {
        Tone.Transport.schedule((time) => taiko.triggerAttackRelease("A1", "8n", time, 1), `${bar}:0:0`);
      }
    }
  }

  function scheduleMeteorSfx(startBar) {
    for (let m = 0; m < 8; m++) {
      const bar = startBar + m;
      const sub = Math.random() < 0.5 ? "0:3" : "2:2";
      Tone.Transport.schedule((time) => {
        if (sfxEnabled) {
          meteorVol.mute = false;
          meteorFilter.frequency.rampTo(500 + Math.random() * 2500, 0.6);
          setTimeout(() => {
            meteorVol.mute = true;
          }, 600);
        }
      }, `${bar}:${sub}`);
    }
  }

  // --- Ana döngü ---
  function scheduleBlock(loopStartBar) {
    scheduleDrone(loopStartBar);
    schedulePads(loopStartBar);
    scheduleArp(loopStartBar);
    scheduleDrums(loopStartBar);
    scheduleMeteorSfx(loopStartBar);
  }

  // --- Kontrol fonksiyonları ---
  let started = false;

  async function playMenu() {
    if (!started) {
      await Tone.start();
      started = true;
    }
    Tone.Transport.cancel();
    scheduleBlock(0);
    scheduleBlock(8);
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "0m";
    Tone.Transport.loopEnd = "16m";
    Tone.Transport.start("+0.05");
  }

  function stopMenu() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }

  function enableSfx() {
    sfxEnabled = true;
  }

  function disableSfx() {
    sfxEnabled = false;
    meteorVol.mute = true;
  }

  // --- Global export ---
  window.BPCMusic = { playMenu, stopMenu, enableSfx, disableSfx };
})();
