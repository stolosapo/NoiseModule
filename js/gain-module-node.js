( function( window, navigator, $, undefined ) {

    /**
	 * GainModuleNode: Class for 'gain' node
	 */
	$.GainModuleNode           = function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.GainModuleNode.prototype = {

		createModuleAudioNode : function ( module ) {

			return this.nm._createGain( module );

		},

		createModuleDiv       : function ( $moduleEl, module, audioNode ) {

			var $gainDiv	= this.nm._createSimpleSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$gainDiv.appendTo( $moduleEl );

		},

		resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.gainGain );

		},

	};

} )( window, navigator, jQuery );
