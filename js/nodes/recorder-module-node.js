RecorderModuleNodeFactory = function() {
};

RecorderModuleNodeFactory.prototype = {
    typeName: "recorder",

    create: function(noiseModule) {
        return new RecorderModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new RecorderModuleNodeUI(noiseModule, moduleItem);
    },
};

RecorderModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
    this.mediaRecorder = undefined;
    this.stopCallback = undefined;
    this.chunks = [];
    this.mediaRecordings = [];
};

RecorderModuleNode.defaults = {
};

RecorderModuleNode.prototype = {
    defaultOptions: function() {
        return RecorderModuleNode.defaults;
    },

    createModuleAudioNode: function(module) {
        let _self = this;

        let recorder = this.noiseModule.audioContext.createMediaStreamDestination();
        let mediaRecorder = new MediaRecorder(recorder.stream);
        mediaRecorder.ignoreMutedMedia = true;

        this.mediaRecorder = mediaRecorder;

        // push each chunk (blobs) in an array
        mediaRecorder.ondataavailable = function(e) {
            _self.chunks.push(e.data);
        };

        // Make blob out of our blobs, and open it.
        mediaRecorder.onstop = function(e) {
            let blob = new Blob(_self.chunks, { 'type' : 'audio/ogg; codecs=opus' });
            let audioURL = window.URL.createObjectURL(blob);

            _self.mediaRecordings.push(audioURL);

            if (_self.stopCallback) {
                _self.stopCallback(module);
            };
        };

        return recorder;
    },    
};

RecorderModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

RecorderModuleNodeUI.prototype = {
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
        let moduleImpl = this.moduleItem.moduleImpl;

        let $section = document.createElement("section");

        let $status = document.createElement("span");
        $status.classList.add("nm-label");
        $status.classList.add("info");
        $status.innerText = "Status:";

        let $list = document.createElement("ul");
        $list.classList.add("nm-label");
        $list.classList.add("nm-list");

        let $play = createPlayPauseButton(
            this.noiseModule, 
            this.moduleItem.module, 
            this._recorderPlayPauseClickEvent($status)
        );

        let $stop = this._createStopButton($status);

        moduleImpl.stopCallback = function(module) {
            $list.innerHTML = "";

            moduleImpl.mediaRecordings.forEach((rec, index) => {
                $a = document.createElement("a");
                $a.setAttribute("href", rec);
                $a.setAttribute("target", "_blank");
                $a.innerText = "track" + (index + 1);

                $li = document.createElement("li");
                appendElementToTarget($a, $li);
                appendElementToTarget($li, $list);
            });
        };

        appendElementToTarget($play, $section);
        appendElementToTarget($stop, $section);
        appendElementToTarget($status, $section);
        appendElementToTarget($list, $section);
        return $section;
    },

    _createStopButton: function($statusEl) {
        let _self = this;
        let moduleImpl = this.moduleItem.moduleImpl;

        let $button = document.createElement("img");
        $button.classList.add("nm-play-button");
        $button.classList.add("stop");

        $button.addEventListener('click', function(e) {
            _self.noiseModule.resumeAudioContext();
    
            let mediaRecorder = moduleImpl.mediaRecorder;
    
            if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {
                mediaRecorder.stop();
                $statusEl.innerText = "Status: " + mediaRecorder.state + "...";
            };
        });
    
        return $button;
    },

    _recorderPlayPauseClickEvent: function($statusEl) {
        let moduleImpl = this.moduleItem.moduleImpl;

        return function($button, e) {
            let mediaRecorder = moduleImpl.mediaRecorder;  
    
            if (mediaRecorder.state === 'inactive') {
                moduleImpl.chunks = [];
                mediaRecorder.start();
            }
            else if (mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
            }
            else if (mediaRecorder.state === 'recording') {
                mediaRecorder.pause();
            };
    
            $statusEl.innerText = "Status: " + mediaRecorder.state + "...";
        }
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
};