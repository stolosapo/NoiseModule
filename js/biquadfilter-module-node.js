( function( window, navigator, $, undefined ) {

    /**
	 * BiquadFilterModuleNode: Class for 'biquadfilter' node
	 */
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

			return this.nm._createBiquadFilter( module );

		},

		createModuleDiv       : function ( $moduleEl, module, audioNode ) {

			var $freqDiv	= this.nm._createSimpleSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
			var $detuDiv	= this.nm._createSimpleSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );
			var $qDiv	= this.nm._createSimpleSliderControl( audioNode, 'Q', 1, 100, 0.1, "" );
			var $gainDiv	= this.nm._createSimpleSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$freqDiv.appendTo( $moduleEl );
			$detuDiv.appendTo( $moduleEl );
			$qDiv.appendTo( $moduleEl );
			$gainDiv.appendTo( $moduleEl );

		},

		resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'frequency', module.options.biquadFilterFrequency );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'detune', module.options.biquadFilterDetune );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'Q', module.options.biquadFilterQ );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.biquadFilterGain );

		},

	};

} )( window, navigator, jQuery );
