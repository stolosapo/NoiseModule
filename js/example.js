let noiseModuleInit = function(containerElId) {
    let config = {};

    config.containerElId = containerElId;
    
    config.modules = [
        { name: "WhiteNoise", nodeType: "noise" },
        { name: "NoiseRadio", nodeType: "noiseradio" },
        { name: "LiveInput", nodeType: "liveinput" },
        { name: "KingTubby", nodeType: "kingtubby" },
        { name: "SineWave", nodeType: "oscillator" },
        { name: "BiquadFilter", nodeType: "biquadfilter" },
        { name: "Delay", nodeType: "delay" },
        { name: "DynamicsCompressor", nodeType: "dynamicscompressor" },
        { name: "WaveShaper", nodeType: "waveshaper" },
        { name: "Panner", nodeType: "stereopanner" },
        // { name: "Convolver", nodeType: "convolver" },
        { name: "Eq", nodeType: "equalizer" },
        { name: "Gain", nodeType: "gain" },
        { name: "Recorder", nodeType: "recorder" },
        { name: "Analyser", nodeType: "analyser" },
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
    noiseModule.start();
    console.log(noiseModule);
}