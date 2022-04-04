EqualizerModuleNodeFactory = function(gainModuleFactory, biquadfilterModuleFactory) {
    this.gainModuleFactory = gainModuleFactory;
    this.biquadfilterModuleFactory = biquadfilterModuleFactory;
};

EqualizerModuleNodeFactory.prototype = {
    typeName: "equalizer",

    create: function(noiseModule) {
        let gainModuleNode = this.gainModuleFactory.create(noiseModule);
        let biquadfilterModuleNode = this.biquadfilterModuleFactory.create(noiseModule);

        return new EqualizerModuleNode(noiseModule, gainModuleNode, biquadfilterModuleNode);
    },

    createUI: function(noiseModule, moduleItem) {
        return new EqualizerModuleNodeUI(noiseModule, moduleItem);
    }
};

EqualizerModuleNode = function(noiseModule, gainModuleNode, biquadfilterModuleNode) {
    this.noiseModule = noiseModule;
    this.gainNode = gainModuleNode;
    this.biquadfilterNode = biquadfilterModuleNode;
};

EqualizerModuleNode.defaults = {
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
};

EqualizerModuleNode.prototype = {
    defaultOptions: function() {
        return EqualizerModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let _self = this;

        let preAmp = _self.gainNode.createGain(module.options.eqPreAmpInGain);
        let outputGain = _self.gainNode.createGain(module.options.eqPreAmpOutGain);

        let nodes = [];
        let prevNode = preAmp;

        nodes.push(preAmp);

        // Create all bands
        module.options.eqBands
            .forEach((band, index) => {
                let bandNode = _self.biquadfilterNode.createBiquadFilter(
                    band.type,
                    band.frequency,
                    band.detune,
                    band.Q,
                    band.gain 
                );

                bandNode._id = index;

                _self.noiseModule.connectNodes(prevNode, bandNode);

                prevNode = bandNode;

                nodes.push(prevNode);
        } );

        _self.noiseModule.connectNodes(prevNode, outputGain);

        nodes.push(outputGain);

        return { 
            inNode: preAmp, 
            outNode: outputGain, 
            allNodes: nodes,
        };
    },
};

EqualizerModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

EqualizerModuleNodeUI.prototype = {
    create: function() {
        const moduleId = "module" + this.moduleItem.id;

        let $section = document.createElement("section");
        $section.id = moduleId;
        $section.name = this.moduleItem.module.name;
        $section.classList.add("noise-module-node");
        $section.classList.add(this.moduleItem.module.nodeType);

        appendElementToTarget(this.$_header(), $section);
        appendElementToTarget(this.$_content(), $section);
        appendElementToTarget(this.$_footer(), $section);

        return $section;
    },

    $_header: function() {
        let $name = document.createElement("h6");
        $name.innerText = this.moduleItem.module.name;

        let $header = document.createElement("header");
        appendElementToTarget($name, $header);
        return $header;
    },

    $_content: function() {
        let _self = this;
        let audioNode = this.moduleItem.audioNode;
        let inGain = audioNode.inNode;
        let outGain = audioNode.outNode;

        let $section = document.createElement("section");

        let $inGainSlider = createSliderControl(
            inGain["gain"].value,
            0,
            2,
            0.1,
            this._sliderChanged(inGain, "gain"),
        );
        $inGainSlider.classList.add('pre-amp');
        $inGainSlider.classList.add('in');

        let $outGainSlider = createSliderControl(
            outGain["gain"].value,
            0,
            2,
            0.1,
            this._sliderChanged(outGain, "gain"),
        );
        $outGainSlider.classList.add('pre-amp');
        $outGainSlider.classList.add('out');

        let lastIndex = audioNode.allNodes.length - 1;

        appendElementToTarget($inGainSlider, $section);

        audioNode.allNodes
            .forEach((node, index) => {
                let $filter  = _self._createFilterUI(
                    _self, 
                    index, 
                    lastIndex, 
                    _self.moduleItem.module, 
                    node,
                );

                appendElementToTarget($filter, $section);
            }
        );

        appendElementToTarget($outGainSlider, $section);

        return $section;
    },

    _createFilterUI: function(_self, index, lastIndex, module, node) {
        let min = module.options.eqBandMin;
        let max = module.options.eqBandMax;
        let step = module.options.eqBandStep;

        if (index == 0 || index == lastIndex) {
            return;
        }

        let bandIndex = index - 1;
        let description = module.options.eqBands[bandIndex].description;

        let $filterSlider = createSliderControl(
            node[module.options.eqBandControl].value,
            min,
            max,
            step,
            this._sliderChanged(node, module.options.eqBandControl),
        );

        $filterSlider.classList.add('eq-band');
        $filterSlider.classList.add('band' + bandIndex);

        return $filterSlider;
    },

    _sliderChanged: function(node, property) {
        return function(e) {
            node[property].value = this.value;
        }
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
}