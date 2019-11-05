( function( window, navigator, $, undefined ) {

    /**
	 * PeriodWaveModuleNode: Class for 'periodicwave' node
	 */
	$.PeriodWaveModuleNode             = function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.PeriodWaveModuleNode.prototype   = {

		createModuleAudioNode : function ( module ) {

		},

		createModuleDiv       : function ( $moduleEl, module, audioNode ) {

		},

		resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

		},

		_connectPeriodicWave  : function ( module, oscillator ) {

			var wave = this.nm.audioContext.createPeriodicWave(
				module.options.periodicWaveRealArray,
				module.options.periodicWaveImagArray,
				{
					disableNormalization: module.options.periodicWaveDisableNorm
				});

			oscillator.setPeriodicWave ( wave );

			return wave;

		},

	};

} )( window, navigator, jQuery );
