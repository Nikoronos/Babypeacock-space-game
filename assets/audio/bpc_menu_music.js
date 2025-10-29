<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BPC Space – Rise of the Feather (Menu Theme)</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Arial;background:#0a0f1a;color:#e6f0ff;
         display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;height:100vh}
    button{padding:12px 18px;border-radius:10px;border:0;background:#1c2b4a;color:#fff;cursor:pointer}
    small{opacity:.7}
  </style>
  <!-- Tone.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.min.js"></script>
</head>
<body>
  <h1>🦚 BPC Space – Menu Theme</h1>
  <div>
    <button id="btnStart">▶️ Play Menu</button>
    <button id="btnStop">⏹ Stop</button>
    <button id="btnSfx">✨ Toggle Meteor SFX</button>
  </div>
  <small>Tarayıcı güvenliği nedeniyle ilk tıkta ses başlar. Oyun içinde: <code>BPCMusic.stopMenu()</code></small>

<script>
(function(){
  // ---------------------------------------------
  // BPC Space – Rise of the Feather (Menu Theme)
  // Tone.js synth tabanlı sentez – telifsiz, tamamen özgün
  // ---------------------------------------------
  const bpm = 108;
  Tone.Transport.bpm.value = bpm;
  Tone.Transport.timeSignature = [4,4];

  // Master FX (hafif uzay ambiyansı)
  const masterVerb = new Tone.Reverb({ decay: 8, wet: 0.35 }).toDestination();
  const masterDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.2, wet: 0.25 }).connect(masterVerb);
  const masterLimiter = new Tone.Limiter(-3).connect(masterDelay);

  // 1) DERİN DRONE (uzay boşluğu)
  const drone = new Tone.FMSynth({
    modulationIndex: 2,
    harmonicity: 0.25,
    oscillator: { type: "sine" },
    envelope: { attack: 4, sustain: 0.9, release: 3 }
  }).connect(new Tone.Filter(200, "lowpass").connect(masterLimiter));

  // 2) PAD (yavaş atak, geniş uzay)
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 2.5, decay: 1.0, sustain: 0.6, release: 1.5 }
  }).connect(new Tone.Chorus(1.8, 2.5, 0.4).connect(masterLimiter));

  // 3) ARP LEAD (yankılı arpej)
  const lead = new Tone.Synth({
    oscillator: { type: "triangle8" },
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.5, release: 0.4 }
  }).connect(new Tone.PingPongDelay({ delayTime: "8n", feedback: 0.35, wet: 0.3 }).connect(masterLimiter));

  // 4) SİNEMATİK VURUŞLAR (taiko/snare benzeri)
  const taiko = new Tone.MembraneSynth({
    pitchDecay: 0.03, octaves: 6, oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.6, sustain: 0 }
  }).connect(masterLimiter);

  const snare = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
  }).connect(new Tone.Filter(3500, "highpass").connect(masterLimiter));

  // 5) METEOR / SİNYAL BOZULMASI SFX (opsiyonel)
  const meteorNoise = new Tone.Noise("brown").start();
  const meteorFilter = new Tone.Filter({ frequency: 1200, type: "bandpass", Q: 6 });
  const meteorVol = new Tone.Volume(-18);
  meteorNoise.connect(meteorFilter).connect(new Tone.AutoFilter({ frequency: 0.05, depth: 0.9 }).start())
              .connect(new Tone.PitchShift({ pitch: -5 }))
              .connect(meteorVol)
              .connect(masterVerb);
  let sfxEnabled = false;
  meteorVol.mute = true;

  // --- Müzikal içerik (A minor, 108 BPM) ---
  // Akor döngüsü: Am – F – C – G (2'şer ölçü) → 8 ölçü
  const chords = [
    ["A3","C4","E4"], // Am
    ["F3","A3","C4"], // F
    ["C3","E3","G3"], // C
    ["G3","B3","D4"]  // G
  ];

  // Drone temel notası (A2) uzun sürer
  function scheduleDrone(startBar){
    const t = Tone.Time(`${startBar}:0:0`).toSeconds();
    drone.triggerAttackRelease("A2", "8m", t, 0.7);
  }

  // Pad akorları (her akor 2 ölçü)
  function schedulePads(startBar){
    for(let i=0;i<4;i++){
      const when = Tone.Time(`${startBar + i*2}:0:0`).toSeconds();
      pad.triggerAttackRelease(chords[i], "2m", when, 0.6);
    }
  }

  // Arpej (A min skalası üstünde motif)
  const arpNotes = ["A4","C5","D5","E5","G5","E5","D5","C5"];
  function scheduleArp(startBar){
    const seq = new Tone.Sequence((time, note)=>{
      lead.triggerAttackRelease(note, "8n", time, 0.7);
    }, arpNotes, "8n");
    seq.start(`${startBar}:0:0`);
    // 8 ölçü (2 döngü) sonra durdur
    Tone.Transport.scheduleOnce(()=>seq.stop(), `${startBar+8}:0:0`);
  }

  // Taiko + snare pattern (epik yürüyüş)
  function scheduleDrums(startBar){
    // 8 ölçülük pattern
    for(let m=0;m<8;m++){
      const bar = startBar + m;
      // taiko: 1 ve 3. vuruş
      Tone.Transport.schedule(time => taiko.triggerAttackRelease("A1","8n", time, 0.9), `${bar}:0:0`);
      Tone.Transport.schedule(time => taiko.triggerAttackRelease("A1","8n", time, 0.9), `${bar}:2:0`);
      // snare: 2 ve 4. vuruş (hafif)
      Tone.Transport.schedule(time => snare.triggerAttackRelease("8n", time, 0.4), `${bar}:1:0`);
      Tone.Transport.schedule(time => snare.triggerAttackRelease("8n", time, 0.45), `${bar}:3:0`);
      // Her 4 ölçüde bir crash benzeri çift vuruş
      if(m % 4 === 0){
        Tone.Transport.schedule(time => taiko.triggerAttackRelease("A1","8n", time, 1), `${bar}:0:0`);
      }
    }
  }

  // Meteor SFX (rastgele aralıklarla)
  function scheduleMeteorSfx(startBar){
    for(let m=0;m<8;m++){
      const bar = startBar + m;
      const sub = Math.random() < 0.5 ? "0:3" : "2:2";
      Tone.Transport.schedule(time=>{
        if(sfxEnabled){
          meteorVol.mute = false;
          // Kısa “kuyruklu yıldız” efekti
          meteorFilter.frequency.rampTo(500 + Math.random()*2500, 0.6);
          setTimeout(()=>{ meteorVol.mute = true; }, 600);
        }
      }, `${bar}:${sub}`);
    }
  }

  // Tek döngü (8 ölçü) planı
  function scheduleBlock(loopStartBar){
    scheduleDrone(loopStartBar);
    schedulePads(loopStartBar);
    scheduleArp(loopStartBar);
    scheduleDrums(loopStartBar);
    scheduleMeteorSfx(loopStartBar);
  }

  // --- Dışa açık kontrol API'si ---
  let started = false;
  async function playMenu(){
    if(!started){
      await Tone.start(); // kullanıcı etkileşimi sonrası audio unlock
      started = true;
    }
    Tone.Transport.cancel(); // yeniden planlama için temizle
    scheduleBlock(0);        // 0–8. ölçüler
    scheduleBlock(8);        // 8–16. ölçüler (toplam ~60 sn)
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = "0m";
    Tone.Transport.loopEnd = "16m"; // iki blokluk süre
    Tone.Transport.start("+0.05");
  }

  function stopMenu(){
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }

  function enableSfx(){ sfxEnabled = true; }
  function disableSfx(){ sfxEnabled = false; meteorVol.mute = true; }

  // Butonlar
  document.getElementById("btnStart").onclick = () => playMenu();
  document.getElementById("btnStop").onclick  = () => stopMenu();
  document.getElementById("btnSfx").onclick   = (e)=>{
    sfxEnabled = !sfxEnabled;
    if(!sfxEnabled) meteorVol.mute = true;
    e.target.textContent = sfxEnabled ? "💫 Meteor SFX: ON" : "✨ Toggle Meteor SFX";
  };

  // Oyun entegrasyonu için global nesne
  window.BPCMusic = { playMenu, stopMenu, enableSfx, disableSfx };

})();
</script>
</body>
</html>
