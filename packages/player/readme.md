
```js
//config.ts 
{
  ...,
  players: [
    {
      "main-music-player": {
        sourceType: "file", // "file" | "sprite"
        sourceId: "main-music",
        destination: "master",
        gain: 1, // default gain
        pan: 0, // default pan
        polyphony: 1, // max number of concurrently playing sounds from this player
        crossfadeTime: 0.2, // to be applied if concurrently playing sounds exceed polyphony.
      }
    },
    {
      "reel-stop-player": {
        sourceType: "file",
        sourceId: "reel-stop",
        destination: "master",
        gain: 0.5,
        pan: 0,
        polyphony: 4,
        crossfadeTime: 0.2,
      }
    }
  ]
}

play({
    loop: false, // toggle-button
    // cycle-points
    loopEnd: 0,
    loopStart: 0,

    //audioparams
    detune: 0,
    gain: 1,
    pan: 0,

    fadeIn: 0,
    fadeOut: 0,

    offset: 0, // from where in the audioFile we start playing on play
    duration: undefined, // for how many seconds to play
    when: 0, // how long we should wait before starting to play the sound
})

setFile({file})


pause()
resume()
stop()













play({
    playerId: "ambience-player",
    envelopes: {
        // pitch up one octave in one second
        detune: [
            [Time.Now, Detune.Root, Curve.Lin],
            [Time.Sec, Detune.Octave, Curve.Lin]
        ],
        // fadein
        gain: [
            [Time.Now, Gain.Silent, Curve.Sig],
            [Time.Sec, Gain.N18, Curve.Sig]
        ],
        // pan right to left
        pan: [
            [Time.Now, Pan.Left, Curve.Lin],
            [Time.Sec, Pan.Right, Curve.Lin]
        ]
    },
    detune, gain, pan, // AudioParamater initials
    when, // seconds: how many (from now) before the sound should start playing
    offset, // seconds: at what point in the buffer should playback start from
    duration, // seconds: for how long should we play
    loop, // should the shound loop
    loopStart, // seconds: similar to offset, but only when the loop-around happens
    loopEnd, // seconds: the end point of the loop cycle
})

enum Curve {
    Lin,
    Log,
    Exp,
    Sig
}

enum Detune {
    Root = 0,
    Semi = 100,
    Note = 200,
    Third- = 300,
    Third+ = 400
    Fourth = 500,
    Fourth+ = 600,
    Fifth = 700,
    Fifth+ = 800,
    Sixth = 900,
    Seven = 1000
    Seven+ = 1100
    Octave = 1200,
    Nine = 1300,
}

enum Pan {
    Left = 1,
    Right = -1
}


enum Time {
    Now = 0,
    Sec = 1,
    2s = 2,
    3s = 3,
    4s = 4,
    ms = 0.001
}

// in decibel
// n for negative (full scale)
// p for positive
enum Gain {
    p24 = 15.848931924611142,
    p23 = 14.125375446227547,
    p22 = 12.589254117941675,
    p21 = 11.220184543019634,
    p20 = 10,
    p19 = 8.912509381337456,
    p18 = 7.943282347242816,
    p17 = 7.07945784384138,
    p16 = 6.309573444801933,
    p15 = 5.623413251903491,
    p14 = 5.011872336272724,
    p13 = 4.466835921509632,
    p12 = 3.981071705534973,
    p11 = 3.548133892335755,
    p10 = 3.1622776601683795,
    p9 = 2.8183829312644537,
    p8 = 2.51188643150958,
    p7 = 2.23872113856834,
    p6 = 1.9952623149688797,
    p5 = 1.7782794100389228,
    p4 = 1.5848931924611136,
    p3 = 1.4125375446227544,
    p2 = 1.2589254117941673,
    p1 = 1.1220184543019633,
    p0 = 1,
    p0 = 1,
    n0 = 1,
    n1 = 0.8912509381337456,
    n2 = 0.7943282347242815,
    n3 = 0.7079457843841379,
    n4 = 0.6309573444801932,
    n5 = 0.5623413251903491,
    n6 = 0.5011872336272722,
    n7 = 0.4466835921509631,
    n8 = 0.3981071705534972,
    n9 = 0.35481338923357547,
    n10 = 0.31622776601683794,
    n11 = 0.28183829312644537,
    n12 = 0.25118864315095796,
    n13 = 0.22387211385683395,
    n14 = 0.19952623149688792,
    n15 = 0.17782794100389226,
    n16 = 0.15848931924611132,
    n17 = 0.1412537544622754,
    n18 = 0.12589254117941673,
    n19 = 0.11220184543019633,
    n20 = 0.1,
    n21 = 0.08912509381337455,
    n22 = 0.07943282347242814,
    n23 = 0.07079457843841377,
    n24 = 0.0630957344480193,
    n25 = 0.056234132519034905,
    n26 = 0.05011872336272723,
    n27 = 0.04466835921509631,
    n28 = 0.03981071705534971,
    n29 = 0.03548133892335753,
    n30 = 0.03162277660168379,
    n31 = 0.028183829312644536,
    n32 = 0.025118864315095794,
    n33 = 0.022387211385683392,
    n34 = 0.01995262314968879,
    n35 = 0.01778279410038923,
    n36 = 0.015848931924611134,
    n37 = 0.01412537544622754,
    n38 = 0.012589254117941668,
    n39 = 0.01122018454301963,
    n40 = 0.01,
    n41 = 0.00891250938133745,
    n42 = 0.007943282347242814,
    n43 = 0.00707945784384138,
    n44 = 0.00630957344480193,
    n45 = 0.005623413251903491,
    n46 = 0.00501187233627272,
    n47 = 0.0044668359215096305,
    n48 = 0.003981071705534969,
    n49 = 0.0035481338923357532,
    n50 = 0.0031622776601683794,
    n51 = 0.002818382931264452,
    n52 = 0.0025118864315095794,
    n53 = 0.0022387211385683377,
    n54 = 0.001995262314968879,
    n55 = 0.0017782794100389228,
    n56 = 0.0015848931924611126,
    n57 = 0.0014125375446227542,
    n58 = 0.0012589254117941662,
    n59 = 0.001122018454301963,
    Silent = 0,
}

```
