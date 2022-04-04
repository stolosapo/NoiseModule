WaveShaperModuleNodeFactory = function () {
};

WaveShaperModuleNodeFactory.prototype = {
    typeName: "waveshapernode",

    create: function(noiseModule) {
        return new WaveShaperModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new WaveShaperModuleNodeUI(noiseModule, moduleItem);
    }
};

WaveShaperModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

WaveShaperModuleNode.defaults = {
    curveAmount: 400,

    /* none, 2x, 4x */
    oversample: '4x'
};

WaveShaperModuleNode.prototype = {
    defaultOptions: function() {
        return WaveShaperModuleNode.defaults;
    },

    createModuleAudioNode: function(module ) {
        let node = this.noiseModule.audioContext.createWaveShaper();

        node.curve = this.createDistortionCurve(module.options.curveAmount);
        node.oversample = module.options.oversample;

        return node;
    },

    createDistortionCurve: function(amount) {
        let k = typeof amount === 'number' ? amount : 50;
        let n_samples = 44100;

        let curve = new Float32Array(n_samples);
        let deg = Math.PI / 180;
        let i = 0
        let x;

        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }

        return curve;
    },
};

WaveShaperModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

WaveShaperModuleNodeUI.prototype = {
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

        let $curveSlider = createSliderControl(
            this.moduleItem.audioNode.curve,
            0,
            1000,
            1,
            this._curveChanged(),
        );

        let $oversampleSlider = createSliderControl(
            this.moduleItem.audioNode.oversample,
            0,
            4,
            2,
            this._oversampleChanged(),
        );

        appendElementToTarget($curveSlider, $section);
        appendElementToTarget($oversampleSlider, $section);
        return $section;
    },

    _curveChanged: function() {
        let _self = this;
        let moduleImpl = _self.moduleItem.moduleImpl;
        return function(e) {
            _self.moduleItem.curve = moduleImpl.createDistortionCurve(this.value);
        }
    },

    _oversampleChanged: function() {
        let _self = this;
        return function(e) {
            let value = this.value == 0 ? 'none' : this.value + 'x';
            _self.moduleItem.oversample = value;
        }
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
}