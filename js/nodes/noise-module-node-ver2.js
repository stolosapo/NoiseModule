NoiseModuleNodeFactory = function () {
};

NoiseModuleNodeFactory.prototype = {
    typeName: "noise",

    create: function(noiseModule) {
        return new NoiseModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new NoiseModuleNodeUI(noiseModule, moduleItem);
    }
}

NoiseModuleNode = function(noiseModule) {
    this.nm = noiseModule;
};

NoiseModuleNode.defaults = {
    started: false
};

NoiseModuleNode.prototype = {
    defaultOptions: function() {
        return NoiseModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let type = module.type;

        if (type === "white") {
            return this._createWhiteNoise();
        };

        if (type === "pink") {
            return this._createPinkNoise();
        };

        if (type === "brown") {
            return this._createBrownNoise();
        };
    },

    _createWhiteNoise: function(bufferSize) {
        bufferSize = bufferSize || 4096;

        let node = this.nm.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

        node.onaudioprocess = function (e) {
            let output = e.outputBuffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            };
        };

        return node;
    },

    _createPinkNoise: function(bufferSize) {
        bufferSize = bufferSize || 4096;

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

        let node = this.nm.audioContext.createScriptProcessor(bufferSize, 1, 1 );

        node.onaudioprocess = function(e) {
            let output = e.outputBuffer.getChannelData ( 0 );
            for (let i = 0; i < bufferSize; i++) {
                let white = Math.random() * 2 - 1;

                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;

                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain

                b6 = white * 0.115926;
            };
        };

        return node;
    },

    _createBrownNoise: function(bufferSize) {
        bufferSize = bufferSize || 4096;

        let lastOut = 0.0;
        let node = this.nm.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

        node.onaudioprocess = function( e ) {
            let output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                let white = Math.random() * 2 - 1;

                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // (roughly) compensate for gain
            };
        };

        return node;
    }
}

NoiseModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

NoiseModuleNodeUI.prototype = {
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
        let $button = createPlayStopButton(this.noiseModule, this.moduleItem.module);
        let $section = document.createElement("section");
        appendElementToTarget($button, $section);
        return $section;
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
}