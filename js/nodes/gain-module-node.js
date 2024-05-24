GainModuleNodeFactory = function () {
}

GainModuleNodeFactory.prototype = {
    typeName: "gain",

    create: function (noiseModule) {
        return new GainModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new GainModuleNodeUI(noiseModule, moduleItem);
    }
}

GainModuleNode = function(noiseModule) {
    this.nm = noiseModule;
};

GainModuleNode.defaults = {
    gain: 0.7
}

GainModuleNode.prototype = {
    defaultOptions: function() {
        return GainModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        return this.createGain(module.options.gain);
    },

    createGain: function(value) {
        let gain = this.nm.audioContext.createGain();

        gain.gain.value = value;

        return gain;
    }
}

GainModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

GainModuleNodeUI.prototype = {
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

        let $slider = createSliderWrapper(
            createSliderControl(
                this.moduleItem.audioNode["gain"].value,
                0,
                1,
                0.01,
                this._gainChanged(),
            ),
            "gain",
            "gain",
            "",
        );

        appendElementToTarget($slider, $section);
        return $section;
    },

    _gainChanged: function() {
        let _self = this;
        return function(e) {
            _self.moduleItem.audioNode["gain"].value = this.value;
        }
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
}