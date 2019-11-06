( function( window, navigator, $, undefined ) {

    /**
	 * WaveShaperModuleNode: Class for 'waveshapernode' node
	 */
	$.WaveShaperModuleNode             = function ( noiseModule ) {

		this.nm = noiseModule;

	};

    $.WaveShaperModuleNode.defaults   = {

        waveShapperCurveAmount  : 400,

        /* none, 2x, 4x */
		waveShapperOversample	: '4x'
    };

	$.WaveShaperModuleNode.prototype   = {

        defaultOptions            : function ( ) {
            return $.WaveShaperModuleNode.defaults;
        },

		createModuleAudioNode     : function ( module ) {

			var node = this.nm.audioContext.createWaveShaper ( );

			node.curve = this._createDistortionCurve ( module.options.waveShapperCurveAmount );
			node.oversample = module.options.waveShapperOversample;

			return node;

		},

		createModuleDiv           : function ( $moduleEl, module, audioNode ) {

			var _self 	= this;

			var $curveDiv	= this.nm._createSimpleSliderControl( audioNode, 'curve', 0, 1000, 1, "", function() {

				audioNode.curve = _self._createDistortionCurve ( this.value );
			} );

			var $oversampleDiv	= this.nm._createSimpleSliderControl( audioNode, 'oversample', 0, 4, 2, "", function() {

				var value = this.value == 0 ? 'none' : this.value + 'x';

				audioNode.oversample = value;
			} );

			$curveDiv.appendTo( $moduleEl );
			$oversampleDiv.appendTo( $moduleEl );

		},

		resetModuleSettings       : function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'curve', module.options.waveShapperCurveAmount );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'oversample', module.options.waveShapperOversample );

		},

		_createDistortionCurve    : function ( amount ) {

			var k = typeof amount === 'number' ? amount : 50;
			var n_samples = 44100;

			var curve = new Float32Array(n_samples);
			var deg = Math.PI / 180;
			var i = 0
			var x;

			for ( ; i < n_samples; ++i ) {

				x = i * 2 / n_samples - 1;

				curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
			}

			return curve;

		},

	};

} )( window, navigator, jQuery );
