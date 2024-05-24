LiveInputModuleNodeFactory = function() {
};

LiveInputModuleNodeFactory.prototype = {
    typeName: "liveinput",

    create: function(noiseModule) {
        return new LiveInputModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new LiveInputModuleNodeUI(noiseModule, moduleItem);
    }
}

LiveInputModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

LiveInputModuleNode.defaults = {
    started: false
};

LiveInputModuleNode.prototype = {

    defaultOptions: function() {
        return LiveInputModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia;

        if (navigator.mediaDevices) {
            let _self = this;
            let source;

            navigator.mediaDevices.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": [ ]
                },
            }).then(function(stream) {

                source = _self.noiseModule.audioContext.createMediaStreamSource(stream);

                /* Update source node map with this new instance */
                _self.noiseModule.updateAudioNode(module.name, source);

                if (module.options.started) {
                    _self.noiseModule.connectAllDestinations(module);
                }
            });

            return source;
        }
    },
};

LiveInputModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

LiveInputModuleNodeUI.prototype = {
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
        let $button = createPlayStopButton(this.noiseModule, this.moduleItem.module);
        appendElementToTarget($button, $section);
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
};