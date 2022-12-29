AnalyserModuleNodeFactory = function () {
}

AnalyserModuleNodeFactory.prototype = {
    typeName: "analyser",

    create: function (noiseModule) {
        return new AnalyserModuleNode(noiseModule);
    },

    createUI: function(noiseModule, moduleItem) {
        return new AnalyserModuleNodeUI(noiseModule, moduleItem);
    }
}

AnalyserModuleNode = function(noiseModule) {
    this.noiseModule = noiseModule;
};

AnalyserModuleNode.defaults = {
    // { sinewave, frequencybars }
    type: "sinewave",
    fftSize: 2048,
    mainBgColor: 200,
    barBgColor: 50,
    sineBgColor: 0
};

AnalyserModuleNode.prototype = {
    defaultOptions: function() {
        return AnalyserModuleNode.defaults;
    },

    createModuleAudioNode: function(module ) {
        let analyser = this.noiseModule.audioContext.createAnalyser();

        analyser.fftSize = module.options.fftSize;

        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array (bufferLength);

        analyser.getByteTimeDomainData(dataArray);

        return analyser;
    },
};

AnalyserModuleNodeUI = function(noiseModule, moduleItem) {
    this.noiseModule = noiseModule;
    this.moduleItem = moduleItem;
}

AnalyserModuleNodeUI.prototype = {
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
        let module = this.moduleItem.module;
        let audioNode = this.moduleItem.audioNode;

        let $section = document.createElement("section");

        let $canvas = document.createElement("canvas");
        let canvasCtx = $canvas.getContext("2d");

        if (module.type === 'sinewave') {
            this._createSinewaveAnalyser(module, $canvas, canvasCtx, audioNode);
        }
        else if (module.type === 'frequencybars') {
            this._createFequencyBarsAnalyser(module, $canvas, canvasCtx, audioNode);
        }
        else {
            this._createSinewaveAnalyser(module, $canvas, canvasCtx, audioNode);
        }

        appendElementToTarget($canvas, $section);
        return $section;
    },

    _createSinewaveAnalyser: function(module, $canvas, canvasCtx, audioNode) {

        let WIDTH       = $canvas.width;
        let HEIGHT      = $canvas.height;

        let mainBg      = module.options.mainBgColor;
        let sineBg      = module.options.sineBgColor;

        audioNode.fftSize   = 2048;
        let bufferLength    = audioNode.fftSize;

        let dataArray       = new Uint8Array( bufferLength );

        canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

        function draw( ) {

            drawVisual      = requestAnimationFrame( draw );

            audioNode.getByteTimeDomainData( dataArray );

            canvasCtx.fillStyle     = 'rgb(' + mainBg + ', ' + mainBg + ', ' + mainBg + ')';
            canvasCtx.fillRect( 0, 0, WIDTH, HEIGHT );

            canvasCtx.lineWidth     = 2;
            canvasCtx.strokeStyle   = 'rgb(' + sineBg + ', ' + sineBg + ', ' + sineBg + ')';

            canvasCtx.beginPath();

            let sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for ( let i = 0; i < bufferLength; i++ ) {

                let v = dataArray[ i ] / 128.0;
                let y = v * HEIGHT / 2;

                if ( i === 0 ) {
                    canvasCtx.moveTo( x, y );
                } else {
                    canvasCtx.lineTo( x, y );
                }

                x += sliceWidth;

            }

            canvasCtx.lineTo( WIDTH, HEIGHT / 2);
            canvasCtx.stroke( );
        };

        draw( );

    },

    _createFequencyBarsAnalyser: function(module, $canvas, canvasCtx, audioNode) {

        let WIDTH       = $canvas.width;
        let HEIGHT      = $canvas.height;

        let mainBg      = module.options.mainBgColor;
        let barBg       = module.options.barBgColor;

        audioNode.fftSize   = 256;

        let bufferLength    = audioNode.frequencyBinCount;
        let dataArray       = new Uint8Array( bufferLength );

        canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

        function draw( ) {

            drawVisual  = requestAnimationFrame( draw );

            audioNode.getByteFrequencyData( dataArray );

            canvasCtx.fillStyle = 'rgb(' + mainBg + ', ' + mainBg + ', ' + mainBg + ')';
            canvasCtx.fillRect( 0, 0, WIDTH, HEIGHT );

            let barWidth = ( WIDTH / bufferLength ) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {

                barHeight = dataArray[ i ];

                canvasCtx.fillStyle = 'rgb(' + ( barHeight + 100 ) + ', ' + barBg + ', ' + barBg + ')';
                canvasCtx.fillRect( x, HEIGHT - barHeight / 2, barWidth, barHeight / 2 );

                x += barWidth + 1;
            }

        }

        draw( );
    },

    $_footer: function() {
        let $footer = document.createElement("footer");
        return $footer;
    }
};