DynamicsCompressorModuleNodeFactory = function () {
}

DynamicsCompressorModuleNodeFactory.prototype = {
    typeName: "dynamicscompressor",

    create: function (noiseModule) {
        return new DynamicsCompressorModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new DynamicsCompressorModuleNodeUI(noiseModule, moduleItem);
    }
}

DynamicsCompressorModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

DynamicsCompressorModuleNode.defaults = {
    threshold: -25,
    knee: 30,
    ratio: 12,
    reduction: -20,
    attack: 0.003,
    release: 0.25
};

DynamicsCompressorModuleNode.prototype = {
    defaultOptions: function() {
        return DynamicsCompressorModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let node = this.noiseModule.audioContext.createDynamicsCompressor();

        node.threshold.value = module.options.threshold;
        node.knee.value = module.options.knee;
        node.ratio.value = module.options.ratio;
        node.reduction.value = module.options.reduction;
        node.attack.value = module.options.attack;
        node.release.value = module.options.release;

        return node;
    },
};

DynamicsCompressorModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

DynamicsCompressorModuleNodeUI.prototype = {
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

        let $thresholdSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["threshold"].value,
                -36,
                0,
                0.01,
                this._sliderChanged("threshold"),
            ),
            "threshold",
            "threshold",
            "DB",
        );

        let $kneeSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["knee"].value,
                0,
                40,
                0.01,
                this._sliderChanged("knee"),
            ),
            "knee",
            "knee",
            "DB",
        );

        let $ratioSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["ratio"].value,
                1,
                20,
                0.1,
                this._sliderChanged("ratio"),
            ),
            "ratio",
            "ratio",
            "Sec",
        );

        let $reductionSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["reduction"].value,
                -20,
                0,
                0.01,
                this._sliderChanged("reduction"),
            ),
            "reduction",
            "reduction",
            "DB",
        );

        let $attackSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["attack"].value,
                0,
                1,
                0.001,
                this._sliderChanged("attack"),
            ),
            "attack",
            "attack",
            "Sec",
        );

        let $releaseSlider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["release"].value,
                0,
                1,
                0.001,
                this._sliderChanged("release"),
            ),
            "release",
            "release",
            "Sec",
        );

        appendElementToTarget($thresholdSlider, $section);
        appendElementToTarget($kneeSlider, $section);
        appendElementToTarget($ratioSlider, $section);
        appendElementToTarget($reductionSlider, $section);
        appendElementToTarget($attackSlider, $section);
        appendElementToTarget($releaseSlider, $section);
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
}