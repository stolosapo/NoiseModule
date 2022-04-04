const ALL_NODES_FACTORIES = function() {

    let gainFactory = new GainModuleNodeFactory();
    let filterFactory = new BiquadFilterModuleNodeFactory();
    // let eqFactory = new $.EqualizerModuleNodeFactory( gainFactory, filterFactory );
    // let kingFactory = new $.KingTubbyModuleNodeFactory( gainFactory );
    let noiseFactory = new NoiseModuleNodeFactory();
    // let moogFactory = new $.MoogFilterModuleNodeFactory( );
    let oscFactory = new OscilatorModuleNodeFactory();
    // let liveFactory = new $.LiveInputModuleNodeFactory( );
    // let radioFactory = new $.RadioModuleNodeFactory( );
    // let soundCloudFactory = new $.SoundCloudModuleNodeFactory( );
    let delayFactory = new DelayModuleNodeFactory();
    // let convolverFactory = new $.ConvolverModuleNodeFactory( );
    let compressorFactory = new DynamicsCompressorModuleNodeFactory();
    let pannerFactory = new StereoPannerModuleNodeFactory();
    let shapperFactory = new WaveShaperModuleNodeFactory();
    // let waveFactory = new $.PeriodWaveModuleNodeFactory( );
    // let analyserFactory = new $.AnalyserModuleNodeFactory( );
    // let recorderFactory = new $.RecorderModuleNodeFactory( );

    let config = {};

    config[gainFactory.typeName] = gainFactory;
    config[filterFactory.typeName] = filterFactory;
    // config[ eqFactory.typeName ] = eqFactory;
    // config[ kingFactory.typeName ] = kingFactory;
    config[noiseFactory.typeName] = noiseFactory;
    // config[ moogFactory.typeName ] = moogFactory;
    config[oscFactory.typeName] = oscFactory;
    // config[ liveFactory.typeName ] = liveFactory;
    // config[ radioFactory.typeName ] = radioFactory;
    // config[ soundCloudFactory.typeName ] = soundCloudFactory;
    config[delayFactory.typeName] = delayFactory;
    // config[ convolverFactory.typeName ] = convolverFactory;
    config[compressorFactory.typeName] = compressorFactory;
    config[pannerFactory.typeName] = pannerFactory;
    config[shapperFactory.typeName] = shapperFactory;
    // config[ waveFactory.typeName ] = waveFactory;
    // config[ analyserFactory.typeName ] = analyserFactory;
    // config[ recorderFactory.typeName ] = recorderFactory;

    return config; 
}

let NoiseModule = function(options) {
    this._init(options);
}

NoiseModule.defaults = {
    
    containerElId: undefined,

    /* Node Type :
        noise           { white, pink, brown }
        oscillator      { sine, square, sawtooth, triangle }
        liveinput
        radionode
        soundcloudnode
        biquadfilter        { lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
        equalizer
        delay
        kingtubbynode
        convolver       {  }
        dynamicscompressor
        gain
        stereopannernode
        waveshapernode
        periodicwave
        analyser        { sinewave, frequencybars }
        recorder
    */
    modules: [
        { name: "WhiteNoise", nodeType: "noise", type: "white", options: { started: false } },
        { name: "Gain", nodeType: "gain", type: "", options: { gainGain: 0.7 } }
    ],

    connections: [
        { srcNode: "WhiteNoise", destNode: "Gain", connected: true },
        { srcNode: "Gain", destNode: "output", connected: true }
    ],

    nodesFactories: ALL_NODES_FACTORIES,
}

NoiseModule.prototype = {

    _init: function(options) {
        // TODO: this.options = $.extend( true, {}, $.NoiseModule.defaults, options );
        this.options = options;

        // initialize members
        this.audioContext = void(0);
        this.moduleCounter = 0;
        this.moduleInstaces = [];
        this.registeredFactories = this.options.nodesFactories();

        // create audio context
        this.audioContext = this._createAudioContext();

        // create modules
        this._createModules();

        // create modules UI
        this._createModulesUI();
    },

    _createAudioContext: function() {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioContext = new AudioContext();

        console.log('AudioContext state is', audioContext.state);

        audioContext.addEventListener('statechange', function(e) {
            console.log( 'AudioContext state changed to', audioContext.state);
        });

        return audioContext;
    },

    _audioContextState: function() {
        if (!this.audioContext) {
            return void(0);
        }

        return this.audioContext.state;
    },

    resumeAudioContext: function() {
        if (this._audioContextState() === 'running') {
            return;
        }

        /* TODO: Error in Chrome: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio */
        this.audioContext.resume().then(() => {
            console.log('Playback resumed successfully');
        });
    },

    _createModules: function() {
        let _self = this;

        // create all modules
        this.moduleInstaces =
            this.options.modules.map(m => _self._createModule(m));

        // create module connections
        this.options.connections
            .forEach(c => _self._createConnection(c));
    },

    _createModule: function(module) {
        // Find Factory for module
        let factory  = this.registeredFactories[module.nodeType];
        if (!factory) {
            console.error("Could not find factory for module:", module);
            return;
        }

        // Create new instance for the module
        let moduleImpl  = factory.create(this);

        /* TODO: module.options = $.extend(true, {}, moduleImpl.defaultOptions(), module.options); */
        // module.options =
        //     $.extend( true, {}, moduleDefaultOptions, module.options );

        let audioNode = moduleImpl.createModuleAudioNode(module);

        let inNode;
        let outNode;
        let allNodes;

        if (!audioNode) {
            inNode = undefined;
            outNode = undefined;
            allNodes = undefined;
        }
        else {
            inNode = audioNode.inNode || audioNode;
            outNode = audioNode.outNode || audioNode;
            allNodes = audioNode.allNodes;
        }

        // increase module counter
        this.moduleCounter++;

        // register audio node
        let moduleItem = {
            id: this.moduleCounter,
            name: module.name,
            inNode: inNode,
            outNode: outNode,
            allNodes: allNodes,
            module: module,
            audioNode: audioNode,
            moduleImpl: moduleImpl,
            factory: factory,
        };

        moduleItem.moduleImpl._self = moduleItem;

        return moduleItem;
    },

    _createModulesUI: function() {
        if (!this.options.containerElId) {
            console.error("Container Element ID is missing");
            return;
        }

        let $containerEl = document.getElementById(this.options.containerElId);
        if (!$containerEl) {
            console.error("Could not locate element", this.options.containerElId);
            return;
        }

        let _self = this;

        this.moduleInstaces
            .forEach(i => {
                let uiBuilder = i.factory.createUI(_self, i);
                let $moduleEl = uiBuilder.create();
                appendElementToTarget($moduleEl, $containerEl);
            });
    },

    _createConnection: function(connection) {
        let srcModule = this._findModule(connection.srcNode);
        if (!srcModule) {
            console.error("Could not locate Source Module for Connection", connection);
            return;
        }

        if (connection.connected === false || 
            srcModule.options.started === false) {
            return;
        }

        let srcAudio = this._findAudioNode(connection.srcNode);
        if (!srcAudio) {
            console.error("Could not locate Source Audio for Connection", connection);
            return;
        }

        if (connection.destNode === "output") {
            this.connectNodes(srcAudio.outNode, this.audioContext.destination);
            return;
        }

        let destAudio = this._findAudioNode(connection.destNode);
        if (!destAudio) {
            console.error("Could not locate Source Audio for Connection", connection);
            return;
        }

        this.connectNodes(srcAudio.outNode, destAudio.inNode);
    },

    _findModule: function(moduleName) {
        const moduleArr =
            this.options.modules
                .filter(m => m.name === moduleName);

        return moduleArr.length === 1 ? moduleArr[0] : void(0);
    },

    _findModuleInstanseByName: function(moduleName) {
        const instanceArr =
            this.moduleInstaces
                .filter(i => i.name === moduleName);

        return instanceArr.length === 1 ? instanceArr[0] : void(0);
    },

    _findAudioNode: function(moduleName) {
        const instance = this._findModuleInstanseByName(moduleName);
        if (!instance) {
            return void(0);
        }

        return { 
            inNode: instance.inNode, 
            outNode: instance.outNode 
        };
    },

    _getElementById: function(elementId) {
        if (!elementId) {
            return;
        }

        return document.getElementById(elementId);
    },

    connectNodes: function(srcNode, destNode) {
        if (!srcNode || !destNode) {
            console.error( "Could not create connection. Source and Destination should exist.", srcNode, destNode );
            return;
        }

        srcNode.connect(destNode);
    },

    _disconnectNodes: function(srcNode, destNode) {
        if (!srcNode || !destNode) {
            console.error("Could not disconnect connection. Source and Destination should exist.", srcNode, destNode);
            return;
        }

        srcNode.disconnect(destNode);
    },

    connectAllDestinations: function(module) {
        let _self = this;

        this.options.connections
            .filter(c => c.srcNode === module.name)
            .forEach(c => {
                let srcNode = _self._findAudioNode(c.srcNode);
                let destNode = _self._findAudioNode(c.destNode);

                _self.connectNodes(srcNode.outNode, destNode.inNode);
            });
    },

    disconnectAllDestinations: function(module) {
        let _self = this;

        this.options.connections
            .filter(c => c.srcNode === module.name)
            .forEach(c => {
                let srcNode = _self._findAudioNode(c.srcNode);
                let destNode = _self._findAudioNode(c.destNode);

                _self._disconnectNodes(srcNode.outNode, destNode.inNode);
            });
    },
}
