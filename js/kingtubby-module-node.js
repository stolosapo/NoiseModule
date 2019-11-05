( function( window, navigator, $, undefined ) {

    /**
	 * KingTubbyModuleNode: Class for 'kingtubbynode' node
	 */
	$.KingTubbyModuleNode              = function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.KingTubbyModuleNode.prototype    = {

		createModuleAudioNode : function ( module ) {

			var nodes		= [ ];

			var preAmp 		= this.nm._createGain( module, module.options.kingTubbyPreAmpInGain );
			var outputGain		= this.nm._createGain( module, module.options.kingTubbyPreAmpOutGain );

			nodes.push( preAmp );

			var delay		= this.nm.audioContext.createDelay( );
			delay.delayTime.value	= module.options.kingTubbyDelayTime;
			nodes.push( delay );

			var feedback		= this.nm.audioContext.createGain( );
			feedback.gain.value	= module.options.kingTubbyGain;
			nodes.push( feedback );

			var filter		= this.nm.audioContext.createBiquadFilter( );
			filter.frequency.value	= module.options.kingTubbyCutOffFreq;
			nodes.push( filter );

			nodes.push( outputGain );


			this.nm._connectNodes( delay, feedback );
			this.nm._connectNodes( feedback, filter );
			this.nm._connectNodes( filter, delay );

			this.nm._connectNodes( preAmp, delay );
			this.nm._connectNodes( preAmp, outputGain );
			this.nm._connectNodes( delay, outputGain );

			return { inNode: preAmp, outNode: outputGain, allNodes: nodes };

		},

		createModuleDiv       : function ( $moduleEl, module, audioNode ) {

			var delay 		= audioNode.allNodes[ 1 ]
			var feedback 	= audioNode.allNodes[ 2 ];
			var filter	 	= audioNode.allNodes[ 3 ];

			var $inGainDiv	= this.nm._createSliderControl( audioNode.inNode, 'gain', 'preAmp In', 0, 2, 0.1, '' );
			$inGainDiv.addClass( 'pre-amp' );
			$inGainDiv.addClass( 'in' );

			var $outGainDiv	= this.nm._createSliderControl( audioNode.outNode, 'gain', 'preAmp Out', 0, 2, 0.1, '' );
			$outGainDiv.addClass( 'pre-amp' );
			$outGainDiv.addClass( 'out' );

			var $delayDiv		= this.nm._createSliderControl( delay, 'delayTime', 'delay', 0, 10, 0.01, "Sec" );
			$delayDiv.addClass( 'delay' );

			var $feedbackDiv	= this.nm._createSliderControl( feedback, 'gain', 'feedback', 0, 1, 0.01, "" );
			$feedbackDiv.addClass( 'feedback' );

			var $freqDiv		= this.nm._createSliderControl( filter, 'frequency', 'cutoff', 0, 8000, 1, "Hz" );
			$freqDiv.addClass( 'biquadfilter' );

			$inGainDiv.appendTo( $moduleEl );

			$delayDiv.appendTo( $moduleEl );
			$feedbackDiv.appendTo( $moduleEl );
			$freqDiv.appendTo( $moduleEl );

			$outGainDiv.appendTo( $moduleEl );

		},

		resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

			var delay 		= audioNode.allNodes[ 1 ]
			var feedback 	= audioNode.allNodes[ 2 ];
			var filter	 	= audioNode.allNodes[ 3 ];

			var inClasses 	= [ 'gain', 'pre-amp', 'in' ];
			var outClasses 	= [ 'gain', 'pre-amp', 'out' ];

			this.nm._resetSliderSettingByClasses( $moduleEl, audioNode.inNode, 'gain', inClasses, module.options.kingTubbyPreAmpInGain );
			this.nm._resetSliderSettingByClasses( $moduleEl, audioNode.outNode, 'gain', outClasses, module.options.kingTubbyPreAmpOutGain );

			this.nm._resetSliderSettingByClasses( $moduleEl, delay, 'delayTime', [ 'delayTime', 'delay' ], module.options.kingTubbyDelayTime );
			this.nm._resetSliderSettingByClasses( $moduleEl, feedback, 'gain', [ 'gain', 'feedback' ], module.options.kingTubbyGain );
			this.nm._resetSliderSettingByClasses( $moduleEl, filter, 'frequency', [ 'frequency', 'biquadfilter' ], module.options.kingTubbyCutOffFreq );

		},

	};

} )( window, navigator, jQuery );
