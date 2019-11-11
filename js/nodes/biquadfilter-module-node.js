( function( window, navigator, $, undefined ) {

    /* BiquadFilterModuleNode: Class for 'biquadfilter' node */

    $.BiquadFilterModuleNodeFactory             = function () {
    };

    $.BiquadFilterModuleNodeFactory.prototype   = {

        typeName    : "biquadfilter",

        create      : function ( noiseModule ) {

            return new $.BiquadFilterModuleNode( noiseModule );
        }
    };

    $.BiquadFilterModuleNode           = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.BiquadFilterModuleNode.defaults  = {

        biquadFilterFrequency   : 440,
        biquadFilterDetune      : 0,
        biquadFilterQ           : 1,
        biquadFilterGain        : 0
    };

    $.BiquadFilterModuleNode.prototype = {

        defaultOptions        : function ( ) {
            return $.BiquadFilterModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            return this.createBiquadFilter( module );
        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let $freqDiv    = this.nm._createSimpleSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
            let $detuDiv    = this.nm._createSimpleSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );
            let $qDiv   = this.nm._createSimpleSliderControl( audioNode, 'Q', 1, 100, 0.1, "" );
            let $gainDiv    = this.nm._createSimpleSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

            this.nm.ui.appendElementToTarget( $freqDiv, $container );
            this.nm.ui.appendElementToTarget( $detuDiv, $container );
            this.nm.ui.appendElementToTarget( $qDiv, $container );
            this.nm.ui.appendElementToTarget( $gainDiv, $container );

            return $container;
        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            this.nm._resetSliderSetting( $moduleEl, audioNode, 'frequency', module.options.biquadFilterFrequency );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'detune', module.options.biquadFilterDetune );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'Q', module.options.biquadFilterQ );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.biquadFilterGain );

        },

        createBiquadFilter    : function ( module, type, frequency, detune, Q, gain ) {

            var node = this.nm.audioContext.createBiquadFilter();

            node.type = type || module.type;
            node.frequency.value = frequency || module.options.biquadFilterFrequency;
            node.detune.value = detune || module.options.biquadFilterDetune;
            node.Q.value = Q || module.options.biquadFilterQ;
            node.gain.value = gain === undefined ? module.options.biquadFilterGain : gain;

            return node;
        }
    };

} )( window, navigator, jQuery );
