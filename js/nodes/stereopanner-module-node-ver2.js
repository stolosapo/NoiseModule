StereoPannerModuleNodeFactory = function () {
}

StereoPannerModuleNodeFactory.prototype = {
    typeName: "stereopannernode",

    create: function(noiseModule) {
        return new StereoPannerModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new StereoPannerModuleNodeUI(noiseModule, moduleItem);
    }
}

StereoPannerModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

StereoPannerModuleNode.defaults = {
    pan: 0
};

StereoPannerModuleNode.prototype = {
    defaultOptions: function() {
        return StereoPannerModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        var node = this.noiseModule.audioContext.createStereoPanner();

        node.pan.value = module.options.pan;

        return node;
    },
};

StereoPannerModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

StereoPannerModuleNodeUI.prototype = {
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

        let $panSlider = createSliderControl(
            this.moduleItem.audioNode["pan"].value,
            -1,
            1,
            0.01,
            this._sliderChanged("pan"),
        );

        appendElementToTarget($panSlider, $section);
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