let noiseModuleInit = function(containerElId) {
    let config = {};

    config.containerElId = containerElId;
    
    config.modules = [
        { name: "WhiteNoise", nodeType: "noise" },
        { name: "NoiseRadio", nodeType: "noiseradio", options: { audioIdSelector: "thefirstkube" } },
        { name: "LiveInput", nodeType: "liveinput" },
        { name: "SineWave", nodeType: "oscillator" },
        { name: "KingTubby", nodeType: "kingtubby" },
        { name: "BiquadFilter", nodeType: "biquadfilter" },
        { name: "Delay", nodeType: "delay" },
        { name: "DynamicsCompressor", nodeType: "dynamicscompressor" },
        { name: "WaveShaper", nodeType: "waveshaper" },
        { name: "Convolver", nodeType: "convolver" },
        { name: "Eq", nodeType: "equalizer" },
        { name: "Panner", nodeType: "stereopanner" },
        { name: "Gain", nodeType: "gain" },
        { name: "Recorder", nodeType: "recorder" },
        { name: "Analyser", nodeType: "analyser" },
    ];

    config.connections = [
        { srcNode: "WhiteNoise", destNode: "BiquadFilter", connected: true },
        { srcNode: "NoiseRadio", destNode: "BiquadFilter", connected: true },
        { srcNode: "SineWave", destNode: "BiquadFilter", connected: true },
        { srcNode: "LiveInput", destNode: "BiquadFilter", connected: true },

        { srcNode: "BiquadFilter", destNode: "Delay", connected: true },
        
        { srcNode: "Delay", destNode: "DynamicsCompressor", connected: true },
        
        { srcNode: "DynamicsCompressor", destNode: "WaveShaper", connected: true },
        
        { srcNode: "WaveShaper", destNode: "Eq", connected: true },
        { srcNode: "Convolver", destNode: "Eq", connected: true },
        { srcNode: "KingTubby", destNode: "Eq", connected: true },
       
        { srcNode: "Eq", destNode: "Panner", connected: true },
        
        { srcNode: "Panner", destNode: "Gain", connected: true },
        
        { srcNode: "Gain", destNode: "Recorder", connected: true },
        
        { srcNode: "Gain", destNode: "Analyser", connected: true },
        
        { srcNode: "Gain", destNode: "output", connected: true },
    ];

    let noiseModule = new NoiseModule(config);

    document.getElementById("start").addEventListener('click', function(el, e) {
        noiseModule.start();
        noiseModule.buildUI();
        console.log(noiseModule);
    });
}