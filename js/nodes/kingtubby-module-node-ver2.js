KingTubbyModuleNodeFactory = function(gainModuleFactory) {
    this.gainModuleFactory = gainModuleFactory;
};

KingTubbyModuleNodeFactory.prototype = {
    typeName: "kingtubby",

    create: function(noiseModule) {
        let gainModuleNode = this.gainModuleFactory.create(noiseModule);
        return new KingTubbyModuleNode(noiseModule, gainModuleNode);
    },

    createUI: function(noiseModule, moduleItem) {
        return new KingTubbyModuleNodeUI(noiseModule, moduleItem);
    }
}

KingTubbyModuleNode = function(noiseModule, gainModuleNode) {
    this.noiseModule = noiseModule;
    this.gainNode = gainModuleNode;
};

KingTubbyModuleNode.defaults = {
    preAmpInGain: 1,
    preAmpOutGain: 1,
    delayTime: 0.5,
    gain: 0.8,
    cutOffFreq: 1000
}

KingTubbyModuleNode.prototype = {
    defaultOptions: function() {
        return KingTubbyModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let preAmp = this.gainNode.createGain(module.options.preAmpInGain);
        let outputGain = this.gainNode.createGain(module.options.preAmpOutGain);

        let delay = this.noiseModule.audioContext.createDelay();
        delay.delayTime.value = module.options.delayTime;
        delay._id = 1;

        let feedback = this.gainNode.createGain(module.options.gain);
        feedback._id = 2;

        let filter = this.noiseModule.audioContext.createBiquadFilter();
        filter.frequency.value = module.options.cutOffFreq;
        filter._id = 3;

        let nodes = [];
        nodes.push(preAmp);
        nodes.push(delay);
        nodes.push(feedback);
        nodes.push(filter);
        nodes.push(outputGain);

        this.noiseModule.connectNodes(delay, feedback);
        this.noiseModule.connectNodes(feedback, filter);
        this.noiseModule.connectNodes(filter, delay);

        this.noiseModule.connectNodes(preAmp, delay);
        this.noiseModule.connectNodes(preAmp, outputGain);
        this.noiseModule.connectNodes(delay, outputGain);

        return { 
            inNode: preAmp, 
            outNode: outputGain, 
            allNodes: nodes,
        };
    },
};

KingTubbyModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

KingTubbyModuleNodeUI.prototype = {
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
        let audioNode = this.moduleItem.audioNode;

        let delay = audioNode.allNodes[1]
        let feedback = audioNode.allNodes[2];
        let filter = audioNode.allNodes[3];

        let inGain = audioNode.inNode;
        let outGain = audioNode.outNode;

        let $section = document.createElement("section");

        let $inGainSlider = createSliderWrapper(
            createSliderControl(
                inGain["gain"].value,
                0,
                2,
                0.1,
                this._sliderChanged(inGain, "gain"),
            ),
            "gain",
            "preAmp In",
            "",
        );
        $inGainSlider.classList.add("pre-amp");
        $inGainSlider.classList.add("in");

        let $outGainSlider = createSliderWrapper(
            createSliderControl(
                outGain["gain"].value,
                0,
                2,
                0.1,
                this._sliderChanged(outGain, "gain"),
            ),
            "gain",
            "preAmp Out",
            "",
        );
        $outGainSlider.classList.add("pre-amp");
        $outGainSlider.classList.add("out");

        let $delaySlider = createSliderWrapper(
            createSliderControl(
                delay["delayTime"].value,
                0,
                1,
                0.01,
                this._sliderChanged(delay, "delayTime"),
            ),
            "delayTime",
            "delay",
            "Sec",
        );
        $delaySlider.classList.add("delay");

        let $feedbackSlider = createSliderWrapper(
            createSliderControl(
                feedback["gain"].value,
                0,
                1,
                0.01,
                this._sliderChanged(feedback, "gain"),
            ),
            "gain",
            "feedback",
            "",
        );
        $feedbackSlider.classList.add("feedback");

        let $filterSlider = createSliderWrapper(
            createSliderControl(
                filter["frequency"].value,
                0,
                8000,
                1,
                this._sliderChanged(filter, "frequency"),
            ),
            "frequency",
            "cutoff",
            "Hz",
        );
        $filterSlider.classList.add("biquadfilter");

        appendElementToTarget($inGainSlider, $section);
        appendElementToTarget($delaySlider, $section);
        appendElementToTarget($feedbackSlider, $section);
        appendElementToTarget($filterSlider, $section);
        appendElementToTarget($outGainSlider, $section);
        return $section;
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