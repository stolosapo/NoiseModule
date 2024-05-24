ConvolverModuleNodeFactory = function () {
}

ConvolverModuleNodeFactory.prototype = {
    typeName: "convolver",

    create: function (noiseModule) {
        return new ConvolverModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new ConvolverModuleNodeUI(noiseModule, moduleItem);
    }
}

ConvolverModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

ConvolverModuleNode.defaults  = {
};

ConvolverModuleNode.prototype    = {
    defaultOptions: function() {
        return ConvolverModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let node = this.noiseModule.audioContext.createConvolver();
        return node;
    },
};

ConvolverModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

ConvolverModuleNodeUI.prototype = {
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
        let audioNode = this.moduleItem.audioNode;
        let $section = document.createElement("section");

        let $span = document.createElement("span");
        $span.classList.add("nm-label");
        $span.textContent = "normalize" + audioNode.normalize;

        $span.addEventListener("click", function(e) {
            audioNode.normalize = !audioNode.normalize;
            $span.textContent = "normalize" + audioNode.normalize;
        })

        appendElementToTarget($span, $section);
        return $section;
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
};