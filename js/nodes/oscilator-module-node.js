OscilatorModuleNodeFactory = function () {
}

OscilatorModuleNodeFactory.prototype = {
    typeName: "oscillator",

    create: function (noiseModule) {
        return new OscilatorModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new OscilatorModuleNodeUI(noiseModule, moduleItem);
    }
}

OscilatorModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

OscilatorModuleNode.defaults = {
    // { sine, square, sawtooth, triangle }
    type: "sine",
    started: false,
    frequency: 440,
    detune: 0
};

OscilatorModuleNode.prototype = {
    defaultOptions: function() {
        return OscilatorModuleNode.defaults;
    },

    createModuleAudioNode: function(module ) {
        let wave = this.noiseModule.audioContext.createOscillator();

        wave.type = module.options.type;
        wave.frequency.value = module.options.frequency;
        wave.detune.value = module.options.detune;

        wave.start(0);

        return wave;
    },
};

OscilatorModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

OscilatorModuleNodeUI.prototype = {
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
        const $byPassButton = createByPassButton(this.noiseModule, this.moduleItem);
    
        let $name = document.createElement("h6");
        $name.innerText = this.moduleItem.module.name;

        let $header = document.createElement("header");
        appendElementToTarget($byPassButton, $header);
        appendElementToTarget($name, $header);
        return $header;
    },

    $_content: function() {
        let $section = document.createElement("section");

        let $frequencySlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["frequency"].value,
                0,
                8000,
                1,
                this._sliderChanged("frequency"),
            ),
            "frequency",
            "frequency",
            "Hz",
        );

        let $detuneSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["detune"].value,
                -1200,
                1200,
                1,
                this._sliderChanged("detune"),
            ),
            "detune",
            "detune",
            "cents",
        );

        let $button = createPlayStopButton(this.noiseModule, this.moduleItem.module);

        appendElementToTarget($frequencySlider, $section);
        appendElementToTarget($detuneSlider, $section);
        appendElementToTarget($button, $section);
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