DelayModuleNodeFactory = function () {
}

DelayModuleNodeFactory.prototype = {
    typeName: "delay",

    create: function (noiseModule) {
        return new DelayModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new DelayModuleNodeUI(noiseModule, moduleItem);
    }
}

DelayModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

DelayModuleNode.defaults = {
    delayTime: 0.2
};

DelayModuleNode.prototype = {
    defaultOptions: function() {
        return DelayModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let node = this.noiseModule.audioContext.createDelay ();

        node.delayTime.value = module.options.delayTime;

        return node;
    },
};

DelayModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

DelayModuleNodeUI.prototype = {
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

        let $slider = createSliderControl(
            this.moduleItem.audioNode["delayTime"].value,
            0,
            1,
            0.01,
            this._sliderChanged("delayTime"),
        );

        appendElementToTarget($slider, $section);
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