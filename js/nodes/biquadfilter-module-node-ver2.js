BiquadFilterModuleNodeFactory = function () {
}

BiquadFilterModuleNodeFactory.prototype = {
    typeName: "biquadfilter",

    create: function (noiseModule) {
        return new BiquadFilterModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new BiquadFilterModuleNodeUI(noiseModule, moduleItem);
    }
}

BiquadFilterModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

BiquadFilterModuleNode.defaults  = {
    // { lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
    type: "lowpass",
    frequency: 440,
    detune: 0,
    Q: 1,
    gain: 0
};

BiquadFilterModuleNode.prototype = {
    defaultOptions: function() {
        return BiquadFilterModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        return this.createBiquadFilter(
            module.options.type,
            module.options.frequency,
            module.options.detune,
            module.options.Q,
            module.options.gain,
        );
    },

    createBiquadFilter: function(type, frequency, detune, Q, gain) {
        let node = this.noiseModule.audioContext.createBiquadFilter();

        node.type = type;
        node.frequency.value = frequency;
        node.detune.value = detune;
        node.Q.value = Q;
        node.gain.value = gain;

        return node;
    }
};

BiquadFilterModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

BiquadFilterModuleNodeUI.prototype = {
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
        let $section = document.createElement("section");

        let $frequencySlider = createSliderControl(
            this.moduleItem.audioNode["frequency"].value,
            0,
            8000,
            1,
            this._sliderChanged("frequency"),
        );

        let $detuneSlider = createSliderControl(
            this.moduleItem.audioNode["detune"].value,
            -1200,
            1200,
            1,
            this._sliderChanged("detune"),
        );

        let $QSlider = createSliderControl(
            this.moduleItem.audioNode["Q"].value,
            1,
            100,
            0.1,
            this._sliderChanged("Q"),
        );

        let $gainSlider = createSliderControl(
            this.moduleItem.audioNode["gain"].value,
            0,
            1,
            0.01,
            this._sliderChanged("gain"),
        );

        appendElementToTarget($frequencySlider, $section);
        appendElementToTarget($detuneSlider, $section);
        appendElementToTarget($QSlider, $section);
        appendElementToTarget($gainSlider, $section);
        return $section;
    },

    _sliderChanged: function(property) {
        let _self = this;
        return function(e) {
            _self.moduleItem.audioNode[property].value = this.value;
        }
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
};
