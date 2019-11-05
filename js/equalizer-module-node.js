( function( window, navigator, $, undefined ) {

    /**
	 * EqualizerModuleNode: Class for 'equalizer' node
	 */
	$.EqualizerModuleNode              = function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.EqualizerModuleNode.prototype    = {

		createModuleAudioNode	: function ( module ) {

			var _self 	= this;

			var preAmp 	= _self.nm._createGain( module, module.options.eqPreAmpInGain );
			var outputGain	= _self.nm._createGain( module, module.options.eqPreAmpOutGain );

			var nodes 	= [ ];
			var prevNode 	= preAmp;

			nodes.push( preAmp );

			// Create all bands
			$.each( module.options.eqBands, function( index, band ) {

				var bandNode 	= _self.nm._createBiquadFilter(
					module,
					band.type,
					band.frequency,
					band.detune,
					band.Q,
					band.gain );

				_self.nm._connectNodes( prevNode, bandNode );

				prevNode 		= bandNode;

				nodes.push( prevNode );

			} );

			_self.nm._connectNodes( prevNode, outputGain );

			nodes.push( outputGain );

			return { inNode: preAmp, outNode: outputGain, allNodes: nodes };

		},

		createModuleDiv			: function ( $moduleEl, module, audioNode ) {

			var _self 		= this;
			var inGain 		= audioNode.inNode;
			var outGain 	= audioNode.outNode;

			var min 		= module.options.eqBandMin;
			var max 		= module.options.eqBandMax;
			var step 		= module.options.eqBandStep;

			var $inGainDiv	= this.nm._createSliderControl( inGain, 'gain', 'preAmp In', 0, 2, 0.1, '' );
			$inGainDiv.addClass( 'pre-amp' );
			$inGainDiv.addClass( 'in' );

			var $outGainDiv	= this.nm._createSliderControl( outGain, 'gain', 'preAmp Out', 0, 2, 0.1, '' );
			$outGainDiv.addClass( 'pre-amp' );
			$outGainDiv.addClass( 'out' );

			var lastIndex 	= audioNode.allNodes.length - 1;

			$inGainDiv.appendTo( $moduleEl );

			$.each( audioNode.allNodes, function( index, node ) {

				if ( index == 0 || index == lastIndex ) {
					return;
				}

				var bandIndex 	= index - 1;
				var description	= module.options.eqBands[ bandIndex ].description;

				var $filterDiv	= _self.nm._createSliderControl(
					node,
					module.options.eqBandControl,
					description,
					min,
					max,
					step,
					'' );

				$filterDiv.addClass( 'eq-band' );
				$filterDiv.addClass( 'band' + bandIndex );

				$filterDiv.appendTo( $moduleEl );

			} );


			$outGainDiv.appendTo( $moduleEl );

		},

		resetModuleSettings		: function ( $moduleEl, module, audioNode ) {

			var _self 		= this;

			var inClasses 	= [ 'gain', 'pre-amp', 'in' ];
			var outClasses 	= [ 'gain', 'pre-amp', 'out' ];

			this.nm._resetSliderSettingByClasses( $moduleEl, audioNode.inNode, 'gain', inClasses, module.options.eqPreAmpInGain );
			this.nm._resetSliderSettingByClasses( $moduleEl, audioNode.outNode, 'gain', outClasses, module.options.eqPreAmpOutGain );

			var lastIndex 	= audioNode.allNodes.length - 1;

			$.each( audioNode.allNodes, function( index, node ) {

				if ( index == 0 || index == lastIndex ) {
					return;
				}

				var bandControlType	= module.options.eqBandControl;
				var bandIndex 		= index - 1;

				var classes 	= [ bandControlType, 'eq-band', 'band' + bandIndex ];
				var value 		= module.options.eqBands[ bandIndex ][ bandControlType ];

				_self.nm._resetSliderSettingByClasses(
					$moduleEl,
					node,
					bandControlType,
					classes,
					value );

			} );

		},

	};

} )( window, navigator, jQuery );
