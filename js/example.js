let noiseModuleInit = function(containerElId) {
    let config = NoiseModule.defaults;

    config.containerElId = containerElId;
    
    config.modules = [
        { name: "WhiteNoise", nodeType: "noise", options: { type: "white", started: false } },
        { name: "NoiseRadio", nodeType: "noiseradionode", options: { audioIdSelector: undefined } },
        { name: "LiveInput", nodeType: "liveinput", options: { started: false } },
        { name: "KingTubby", nodeType: "kingtubbynode", options: {
            preAmpInGain: 1,
            preAmpOutGain: 1,
            delayTime: 0.5,
            gain: 0.8,
            cutOffFreq: 1000
        } },
        { name: "SineWave", nodeType: "oscillator", options: { type: "sine", started: false, frequency: 440, detune: 0 } },
        { name: "BiquadFilter", nodeType: "biquadfilter", options: { type: "lowpass", frequency: 440, detune: 0, Q: 1, gain: 0 } },
        { name: "Delay", nodeType: "delay", options: { delayTime: 0.2 } },
        { name: "DynamicsCompressor", nodeType: "dynamicscompressor", options: { threshold: -25, knee: 30, ratio: 12, reduction: -20, attack: 0.003, release: 0.25 } },
        { name: "WaveShaper", nodeType: "waveshapernode", options: { curveAmount: 400, oversample: '4x' } },
        { name: "Panner", nodeType: "stereopannernode", options: { pan: 0 } },
        // { name: "Convolver", nodeType: "convolver", options: {} },
        { name: "Eq", nodeType: "equalizer", options: {
            eqPreAmpInGain: 1,
            eqPreAmpOutGain: 1,
            eqBandControl: 'gain',
            eqBandMin: -12,
            eqBandMax: 12,
            eqBandStep: 1,
        
            eqBands: [
                { description: '60 Hz', type: 'lowshelf', frequency: 60, detune: 0, Q: 1, gain: 0 },
                { description: '170 Hz', type: 'lowshelf', frequency: 170, detune: 0, Q: 1, gain: 0 },
                { description: '310 Hz', type: 'lowshelf', frequency: 310, detune: 0, Q: 1, gain: 0 },
                { description: '600 Hz', type: 'peaking', frequency: 600, detune: 0, Q: 1, gain: 0 },
                { description: '1 KHz', type: 'peaking', frequency: 1000, detune: 0, Q: 1, gain: 0 },
                { description: '3 KHz', type: 'peaking', frequency: 3000, detune: 0, Q: 1, gain: 0 },
                { description: '6 KHz', type: 'peaking', frequency: 6000, detune: 0, Q: 1, gain: 0 },
                { description: '12 KHz', type: 'highshelf', frequency: 12000, detune: 0, Q: 1, gain: 0 },
                { description: '14 KHz', type: 'highshelf', frequency: 14000, detune: 0, Q: 1, gain: 0 },
                { description: '16 KHz', type: 'highshelf', frequency: 16000, detune: 0, Q: 1, gain: 0 }
            ]
        }},
        { name: "Gain", nodeType: "gain", options: { gain: 0.7 } },
        { name: "Recorder", nodeType: "recorder", options: { } },
        { name: "Analyser", nodeType: "analyser", options: {
            // { sinewave, frequencybars }
            type: "sinewave",
            fftSize: 2048,
            mainBgColor: 200,
            barBgColor: 50,
            sineBgColor: 0
        }},
    ];

    config.connections = [
        { srcNode: "WhiteNoise", destNode: "BiquadFilter", connected: true },
        { srcNode: "SineWave", destNode: "BiquadFilter", connected: true },
        { srcNode: "LiveInput", destNode: "BiquadFilter", connected: true },
        { srcNode: "BiquadFilter", destNode: "Delay", connected: true },
        { srcNode: "Delay", destNode: "DynamicsCompressor", connected: true },
        { srcNode: "DynamicsCompressor", destNode: "WaveShaper", connected: true },
        { srcNode: "WaveShaper", destNode: "Panner", connected: true },
        { srcNode: "Panner", destNode: "Eq", connected: true },
        // { srcNode: "Convolver", destNode: "Eq", connected: true },
        // { srcNode: "NoiseRadio", destNode: "KingTubby", connected: true },
        // { srcNode: "KingTubby", destNode: "Eq", connected: true },
        { srcNode: "Eq", destNode: "Gain", connected: true },
        { srcNode: "Gain", destNode: "Recorder", connected: true },
        { srcNode: "Gain", destNode: "Analyser", connected: true },
        { srcNode: "Gain", destNode: "output", connected: true },
    ];

    let noiseModule = new NoiseModule(config);
    console.log(noiseModule);
}