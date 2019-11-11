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

            let wave = this.nm.audioContext.createOscillator();

            wave.type = module.type;
            wave.frequency.value = module.options.oscillatorFrequency;
            wave.detune.value = module.options.oscillatorDetune;

            wave.start( 0 );

            return wave;
        },

        createModuleDiv       : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let $freqDiv    = this.nm.ui.createSimpleSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
            let $detuDiv    = this.nm.ui.createSimpleSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );
            let $button     = this.nm.ui.createPlayStopButton( module, audioNode );

            this.nm.ui.appendElementToTarget( $freqDiv, $container );
            this.nm.ui.appendElementToTarget( $detuDiv, $container );
            this.nm.ui.appendElementToTarget( $button, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'frequency', module.options.oscillatorFrequency );
            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'detune', module.options.oscillatorDetune );
        },
    };

} )( window, navigator, jQuery );
