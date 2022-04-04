let noiseModuleInit = function(containerElId) {
    let config = NoiseModule.defaults;

    config.containerElId = containerElId;
    
    config.modules = [
        { name: "WhiteNoise", nodeType: "noise", type: "white", options: { started: false } },
        { name: "SineWave", nodeType: "oscillator", options: { type: "sine", started: false, frequency: 440, detune: 0 } },
        { name: "BiquadFilter", nodeType: "biquadfilter", options: { type: "lowpass", frequency: 440, detune: 0, Q: 1, gain: 0 } },
        { name: "Delay", nodeType: "delay", options: { delayTime: 0.2 } },
        { name: "DynamicsCompressor", nodeType: "dynamicscompressor", options: { threshold: -25, knee: 30, ratio: 12, reduction: -20, attack: 0.003, release: 0.25 } },
        { name: "WaveShaper", nodeType: "waveshapernode", options: { curveAmount: 400, oversample: '4x' } },
        { name: "Panner", nodeType: "stereopannernode", options: { pan: 0 } },
        { name: "Gain", nodeType: "gain", options: { gainGain: 0.7 } },
    ];

    config.connections = [
        { srcNode: "WhiteNoise", destNode: "BiquadFilter", connected: true },
        { srcNode: "SineWave", destNode: "BiquadFilter", connected: true },
        { srcNode: "BiquadFilter", destNode: "Delay", connected: true },
        { srcNode: "Delay", destNode: "DynamicsCompressor", connected: true },
        { srcNode: "DynamicsCompressor", destNode: "WaveShaper", connected: true },
        { srcNode: "WaveShaper", destNode: "Panner", connected: true },
        { srcNode: "Panner", destNode: "Gain", connected: true },
        { srcNode: "Gain", destNode: "output", connected: true },
    ];

    let noiseModule = new NoiseModule(config);
    console.log(noiseModule);
}