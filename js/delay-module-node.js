( function( window, navigator, $, undefined ) {

    /**
	 * DelayModuleNode: Class for 'delay' node
	 */
	$.DelayModuleNode              = function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.DelayModuleNode.prototype    = {

		createModuleAudioNode : function ( module ) {

			var node = this.nm.audioContext.createDelay ();

			node.delayTime.value = module.options.delayTime;

			return node;

		},

		createModuleDiv       : function ( $moduleEl, module, audioNode ) {

			var $timeDiv	= this.nm._createSimpleSliderControl( audioNode, 'delayTime', 0, 10, 0.01, "Sec" );

			$timeDiv.appendTo( $moduleEl );

		},

		resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'delayTime', module.options.delayTime );

		},

	};

} )( window, navigator, jQuery );
