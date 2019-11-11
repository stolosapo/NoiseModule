( function( window, navigator, $, undefined ) {

    /* OscilatorModuleNode: Class for 'oscilator' node */

    $.OscilatorModuleNodeFactory             = function () {
    };

    $.OscilatorModuleNodeFactory.prototype   = {

        typeName    : "oscillator",

        create      : function ( noiseModule ) {

            return new $.OscilatorModuleNode( noiseModule );
        }
    }

    $.OscilatorModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.OscilatorModuleNode.defaults     = {

        oscillatorFrequency : 440,
        oscillatorDetune    : 0
    };

    $.OscilatorModuleNode.prototype    = {

        defaultOptions        : function ( ) {
            return $.OscilatorModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            var wave = this.nm.audioContext.createOscillator();

            wave.type = module.type;
            wave.frequency.value = module.options.oscillatorFrequency;
            wave.detune.value = module.options.oscillatorDetune;

            wave.start( 0 );

            return wave;
        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            var $freqDiv    = this.nm._createSimpleSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
            var $detuDiv    = this.nm._createSimpleSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );

            $freqDiv.appendTo( $moduleEl );
            $detuDiv.appendTo( $moduleEl );

            // Create Play / Stop button
            this.nm._createPlayStopButton( $moduleEl, module, audioNode );
        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            this.nm._resetSliderSetting( $moduleEl, audioNode, 'frequency', module.options.oscillatorFrequency );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'detune', module.options.oscillatorDetune );
        },
    };

} )( window, navigator, jQuery );
