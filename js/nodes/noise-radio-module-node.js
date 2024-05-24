NoiseRadioModuleNodeFactory = function () {
}

NoiseRadioModuleNodeFactory.prototype = {
    typeName: "noiseradio",

    create: function (noiseModule) {
        return new NoiseRadioModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new NoiseRadioModuleNodeUI(noiseModule, moduleItem);
    }
}

NoiseRadioModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

NoiseRadioModuleNode.defaults = {
    audioIdSelector: undefined,
};

NoiseRadioModuleNode.prototype = {
    defaultOptions: function() {
        return NoiseRadioModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let audio = this._getNoiseRadioAudioElement(module);

        if (!audio) {
            console.error("Could not locate NoiseRadio audio element");
            return;
        };

        let source = this.noiseModule.audioContext.createMediaElementSource(audio);

        return source;
    },

    _getNoiseRadioAudioElement: function(module) {
        if (!module.options.audioIdSelector) {
            return void(0);
        }

        return document.getElementById(module.options.audioIdSelector);
    },
};

NoiseRadioModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

NoiseRadioModuleNodeUI.prototype = {
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
        return $section;
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
};
