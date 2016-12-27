( function( window, navigator, $, undefined ) {

	/* Noise Module Object */

	$.NoiseModule				= function ( options, element, radio ) {

		this.$el 		= $( element );
		this.$radio 	= $( radio );

		var fileMode 	= options.fileMode;

		if (fileMode === null || fileMode === undefined || fileMode === false) {

			this._init ( options );	
		
		}
		else {

			this._initFromFile( );

		}

	};

	$.NoiseModule.defaults		= {

		/* Node Type :
			noise 				{ white, pink, brown }
			oscillator 			{ sine, square, sawtooth, triangle }
			liveinput
			biquadfilter 		{ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
			delay
			dynamicscompressor
			gain
			stereopannernode
			waveshapernode
			periodicwave
			analyser 			{ sinewave, frequencybars }
		*/
		modules 				: [

			{ name: "WhiteNoise", nodeType: "noise", type: "white", options: { started: false } },
			{ name: "Gain", nodeType: "gain", type: "", options: { gainGain: 0.7 } }

		],

		connections				: [

			{ srcNode: "WhiteNoise", destNode: "Gain", connected: false },
			{ srcNode: "Gain", destNode: "output", connected: true }

		],

		started					: true,
		fileMode				: false,

		oscillatorFrequency		: 440,
		oscillatorDetune		: 0,

		biquadFilterFrequency	: 440,
		biquadFilterDetune		: 0,
		biquadFilterQ 			: 1,
		biquadFilterGain		: 0.7,

		delayTime				: 0.2,

		compressorThreshold 	: -25,
		compressorKnee			: 30,
		compressorRatio 		: 12,
		compressorReduction		: -20,
		compressorAttack		: 0.003,
		compressorRelease		: 0.25,

		gainGain				: 0.7,

		stereoPannerPan			: 0,

		waveShapperCurveAmount	: 400,

		/* none, 2x, 4x */
		waveShapperOversample	: '4x', 

		periodicWaveRealArray	: new Float32Array( [ 0, 1 ] ),
		periodicWaveImagArray	: new Float32Array( [ 0, 0 ] ),
		periodicWaveDisableNorm	: false,

		analyserFftSize			: 2048,
		analyserMainBgColor		: 200,
		analyserBarBgColor 		: 50,
		analyserSineBgColor		: 0

	};

	$.NoiseModule.prototype		= {

		_init						: function ( options ) {

			// the options
			this.options 		= $.extend( true, {}, $.NoiseModule.defaults, options );

			// initialize counters
			this.moduleCounter	= 0;
			this.moduleMap		= [];

			// remove all containers
			if ( this.$containerEl ) {
				this.$containerEl.remove( );
			}

			// create audio context
			this._createAudioContext();

			// create modules
			this._createModules();

		},

		_initFromFile				: function ( ) {

			var _self 			= this;
			var template 		= '<input type="file" id="nm-file-input" />';
			var $fileInput 		= $( template );

			$fileInput[0].addEventListener( 'change', function ( e ) {

				var file 	= e.target.files[0];
				
				if (!file) {
					return;
				}
				
				var reader 	= new FileReader();
				
				reader.onload = function( e ) {

					var content 		= e.target.result;
					var moduleOptions 	= JSON.parse( content );

					_self._init( moduleOptions );

				};

				reader.readAsText( file );

			}, false );

			$fileInput.appendTo( this.$el );

		},

		_createAudioContext			: function ( ) {

			var audioContext; 

			if (typeof AudioContext !== "undefined") {     
				audioContext = new AudioContext(); 
			} 
			else if (typeof webkitAudioContext !== "undefined") {     
				audioContext = new webkitAudioContext(); 
			} 
			else {     
				throw new Error('AudioContext not supported. :('); 
			}

			this.audioContext = audioContext;

		},

		_createModules				: function ( ) {

			// create container for all modules
			var template 		= '\
				<section id="noise-module-container" class="noise-module-container">\
				</section>';

			this.$containerEl 	= $( template );

			this.$el.prepend( this.$containerEl );

			var _self = this;

			
			// create all modules
			$.each( this.options.modules, function( index, module ) {

				_self._createModule( module );

			} );


			// create module connections
			$.each( this.options.connections, function( index, connection ) {

				_self._createConnection( connection );

			} );

		},

		_createModule				: function ( module ) {

			module.options 		= $.extend( true, {}, this.options, module.options );

			var audioNode 		= this._createAudioNode( module );

			// create div for module
			this._createModuleDiv( module, audioNode );

			// register audio node
			var moduleItem = { name: module.name, node: audioNode };
			this.moduleMap.push( moduleItem );

			// increase module counter
			this.moduleCounter++;

		},

		_createModuleDiv			: function ( module, audioNode ) {

			var name 			= module.name;
			var moduleNumber 	= this._getNextModuleNumber ( );
			var moduleId 		= "module" + moduleNumber;
			
			var template 		= '\
			<div id="' + moduleId + '" class="noise-module ' + module.nodeType + '">\
				<div class="nm-content">\
					<h6 class="nm-content-title">' + name + '</h6>\
				</div>\
			</div>';

			var $divEl 			= $( template );

			// append content
			var $content 		= $( $divEl ).find( '.nm-content' );
			this._appendContentToModule( $content, module, audioNode );

			// add bypass and reset modes
			this._appendBypassButton( $divEl, $content, module, audioNode );
			this._appendResetButton( $divEl, $content, module, audioNode );

			// add footer
			this._appendModuleFooter( $divEl, $content, module, audioNode );

			$divEl.appendTo( this.$containerEl );
			$divEl.show();

		},

		_appendBypassButton 		: function ( $divEl, $content, module, audioNode ) {

			if (audioNode === null || audioNode === undefined) {
				return;
			}

			if (audioNode.numberOfInputs > 0) {

				var template 	= '<img class="nm-bypass" />';
				var $img 		= $( template );

				$img.appendTo( $divEl );

				this._createBypassEvent( $divEl, $content, module, audioNode );

			}

		},

		_appendResetButton 			: function ( $divEl, $content, module, audioNode ) {

			if (module.nodeType != 'noise' && 
				module.nodeType != 'liveinput' &&
				module.nodeType != 'analyser') {

				var template 	= '<img class="nm-reset" />';
				var $img 		= $( template );

				$img.appendTo( $divEl );

				this._createResetEvent( $divEl, $content, module, audioNode );

			}

		},

		_createResetEvent			: function ( $divEl, $content, module, audioNode ) {

			var _self 		= this;
			var $reset 		= $( $divEl ).find( '.nm-reset' );

			$reset[0].addEventListener( 'click', function( ) {

				_self._resetModuleSettings( $content, module, audioNode );

			} );

		},

		_createBypassEvent			: function ( $divEl, $content, module, audioNode ) {

			var _self 		= this;
			var $bypass		= $( $divEl ).find( '.nm-bypass' );

			$bypass[0].addEventListener( 'click', function( ) {

				_self._bypassModule( $content, module, audioNode );

			} );

		},

		_appendContentToModule		: function ( $moduleEl, module, audioNode ) {

			var nodeType 	= module.nodeType;

			if ( nodeType === "noise" ) {
				return this._createNoiseDiv( $moduleEl, module, audioNode );
			};

			if ( nodeType === "oscillator" ) {
				return this._createOscillatorDiv( $moduleEl, module, audioNode );
			};

			if ( nodeType === "liveinput" ) {
				return this._createLiveInputDiv( $moduleEl, module, audioNode );
			};

			if ( nodeType === "biquadfilter" ) {
				return this._createBiquadFilterDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "delay" ) {
				return this._createDelayDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "dynamicscompressor" ) {
				return this._createDynamicsCompressorDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "gain" ) {
				return this._createGainDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "stereopannernode" ) {
				return this._createStreoPannerDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "waveshapernode" ) {
				return this._createWaveShaperDiv( $moduleEl, audioNode );
			};

			// if ( nodeType === "periodicwave" ) {

			// };

			if ( nodeType === "analyser" ) {
				return this._createAnalyserDiv( $moduleEl, module, audioNode );
			};

		},

		_appendModuleFooter 		: function ( $divEl, $content, module, audioNode ) {

			if (audioNode === null || audioNode === undefined) {
				return;
			}

			var template 	= '<footer class="nm-footer"></footer>';
			var $footer		= $( template );

			if (audioNode.numberOfInputs > 0) {

				var fromTem	= '<span class="nm-from"></span>';
				var $from 	= $( fromTem );

				$from.appendTo( $footer );
			}

			if (audioNode.numberOfOutputs > 0) {

				var toTem	= '<span class="nm-to"></span>';
				var $to 	= $( toTem );

				$to.appendTo( $footer );
			}

			$footer.appendTo( $divEl );

		},

		_createAudioNode			: function ( module ) {

			var nodeType = module.nodeType;

			if ( nodeType === "noise" ) {
				return this._createNoise( module );
			};

			if ( nodeType === "oscillator" ) {
				return this._createOscillator( module );
			};

			if ( nodeType === "liveinput" ) {
				return this._createLiveInput( module );
			};

			if ( nodeType === "biquadfilter" ) {
				return this._createBiquadFilter( module );
			};

			if ( nodeType === "delay" ) {
				return this._createDelay( module );
			};

			if ( nodeType === "dynamicscompressor" ) {
				return this._createDynamicsCompressor( module );
			};

			if ( nodeType === "gain" ) {
				return this._createGain( module );
			};

			if ( nodeType === "stereopannernode" ) {
				return this._createStreoPanner( module );
			};

			if ( nodeType === "waveshapernode" ) {
				return this._createWaveShaper( module );
			};

			// if ( nodeType === "periodicwave" ) {

			// };

			if ( nodeType === "analyser" ) {
				return this._createAnalyser( module );
			};

		},

		_resetModuleSettings 		: function ( $content, module, audioNode ) {

			var nodeType = module.nodeType;

			if ( nodeType === "oscillator" ) {
				return this._resetOscillatorModule( $content, module, audioNode );
			};

			if ( nodeType === "biquadfilter" ) {
				return this._resetBiquadFilterModule( $content, module, audioNode );
			};

			if ( nodeType === "delay" ) {
				return this._resetDelayModule( $content, module, audioNode );
			};

			if ( nodeType === "dynamicscompressor" ) {
				return this._resetDynamicsCompressor( $content, module, audioNode );
			};

			if ( nodeType === "gain" ) {
				return this._resetGainModule( $content, module, audioNode );
			};

			if ( nodeType === "stereopannernode" ) {
				return this._resetStreoPannerModule( $content, module, audioNode );
			};

			if ( nodeType === "waveshapernode" ) {
				return this._resetWaveShaperModule( $content, module, audioNode );
			};

		},

		_bypassModule 				: function ( $content, module, audioNode ) {

			var bypassedClass 	= 'bypassed';
			var bypassed 		= $content.hasClass( bypassedClass );

			if (bypassed) {

				$content.removeClass( bypassedClass );
			}
			else {

				$content.addClass( bypassedClass );	
			}

		},

		_createConnection			: function ( connection ) {

			var srcModule = this._findModule( connection.srcNode );

			if (connection.connected === false || srcModule.options.started === false) {
				return;
			}

			var srcNode = this._findAudioNode( connection.srcNode );
			var destNode;

			if ( connection.destNode === "output" ) {
				
				this._connectNodeToDestination( srcNode );

			}
			else {
				
				destNode = this._findAudioNode( connection.destNode );
				this._connectNodes( srcNode, destNode );

			};

		},

		_findModule					: function ( moduleName ) {

			var module;

			$.each( this.options.modules, function( index, mod ) {

				if ( mod.name === moduleName ) {
					
					module = mod;
					return;

				};

			} );

			return module;

		},

		_findAudioNode				: function ( moduleName ) {

			var node;

			$.each( this.moduleMap, function( index, map ) {

				if ( map.name === moduleName ) {
					
					node = map.node;
					return;

				};

			} );

			return node;

		},

		_updateAudioNode			: function ( moduleName, audioNode ) {

			$.each( this.moduleMap, function( index, map ) {

				if ( map.name === moduleName ) {
					
					map.node = audioNode;
					return;

				};

			} );

		},

		_getNextModuleNumber		: function ( ) {

			return this.moduleCounter + 1;

		},

		_createNoise 				: function ( module ) {

			var type 	= module.type;

			if ( type === "white" ) {
				return this._createWhiteNoise();
			};

			if ( type === "pink" ) {
				return this._createPinkNoise();
			};

			if ( type === "brown" ) {
				return this._createBrownNoise();
			};

		},

		_createNoiseDiv 			: function ( $moduleEl, module, audioNode ) {

			this._createPlayStopButton( $moduleEl, module, audioNode );

		},

		_createWhiteNoise			: function ( bufferSize ) {

			bufferSize = bufferSize || 4096;

			var node = this.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

			node.onaudioprocess = function ( e ) {

				var output = e.outputBuffer.getChannelData(0);

				for (var i = 0; i < bufferSize; i++) { 				
				
					output[i] = Math.random() * 2 - 1; 			
				};

			};

			return node;

		},

		_createPinkNoise			: function ( bufferSize ) {

			bufferSize = bufferSize || 4096;

			var b0, b1, b2, b3, b4, b5, b6;
			b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

			var node = this.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

			node.onaudioprocess = function( e ) {

				var output = e.outputBuffer.getChannelData ( 0 );

				for (var i = 0; i < bufferSize; i++) { 				

					var white = Math.random() * 2 - 1;			

					b0 = 0.99886 * b0 + white * 0.0555179;
					b1 = 0.99332 * b1 + white * 0.0750759;
					b2 = 0.96900 * b2 + white * 0.1538520;
					b3 = 0.86650 * b3 + white * 0.3104856;
					b4 = 0.55000 * b4 + white * 0.5329522;
					b5 = -0.7616 * b5 - white * 0.0168980;

					output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
					output[i] *= 0.11; // (roughly) compensate for gain

					b6 = white * 0.115926;

				};
			};		

			return node;

		},

		_createBrownNoise			: function ( bufferSize ) {

			bufferSize = bufferSize || 4096;

			var lastOut = 0.0;
			var node = this.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

			node.onaudioprocess = function( e ) {

				var output = e.outputBuffer.getChannelData(0);

				for (var i = 0; i < bufferSize; i++) {

					var white = Math.random() * 2 - 1;

					output[i] = (lastOut + (0.02 * white)) / 1.02;
					lastOut = output[i];
					output[i] *= 3.5; // (roughly) compensate for gain

				};

			};

			return node;

		},

		_createOscillator			: function ( module ) {

			var wave = this.audioContext.createOscillator();

			wave.type = module.type;
			wave.frequency.value = module.options.oscillatorFrequency;
			wave.detune.value = module.options.oscillatorDetune;

			wave.start( 0 );

			return wave;

		},

		_createSliderDiv			: function ( label, min, max, step, units ) {

			var template 	= '\
			<div class="' + label + '">\
				<div class="nm-slider-info" min="' + min + '" max="' + max + '">\
					<span class="nm-label">' + label + '</span>\
					<span class="nm-value" units="' + units + '"></span>\
				</div>\
				<input min="' + min + '" max="' + max + '" step="' + step + '" type="range"></input>\
			</div>';

			return $( template );

		},

		_createSliderControl		: function ( audioNode, property, min, max, step, units, changeEvent ) {

			var $div		= this._createSliderDiv( property, min, max, step, units );

			var $span		= $( $div ).find( '.nm-value' );
			var $input 		= $( $div ).find( 'input' );

			var value 		= audioNode[ property ].value;

			$input[0].value = value;

			$span.text( value + ' ' + units );

			if (changeEvent != null && changeEvent != undefined) {

				$input[0].addEventListener( 'change', changeEvent );

				return $div;
			}

			$input[0].addEventListener( 'change', function( ) {

				audioNode[ property ].value = this.value;
				$span.text( this.value + ' ' + units );

			} );

			return $div;

		},

		_resetSliderSetting 		: function ( $moduleEl, audioNode, property, value ) {

			var $div  		= $( $moduleEl ).find( '.' + property );
			var $span		= $( $div ).find( '.nm-value' );
			var $input 		= $( $div ).find( 'input' );
			var units 		= $span.attr( 'units' );

			$input[0].value	= value;
			$span.text( value + ' ' + units );
			audioNode[ property ].value = value;

		},

		_createPlayStopButton		: function ( $moduleEl, module, audioNode ) {

			var _self 		= this;

			var playClass 	= 'play';
			var stopClass 	= 'stop';

			var template 	= '<img class="nm-play-button"></img>';
			var $img 		= $( template );

			if ( module.options.started ) {

				$img.addClass( stopClass );
			}
			else {
				
				$img.addClass( playClass );
			}

			$img[0].addEventListener( 'click', function( ) {

				if ( $(this).hasClass( playClass ) ) {

					_self._connectAllDestinations( module );

					$(this).removeClass( playClass );
					$(this).addClass( stopClass );

				}
				else {

					_self._disconnectAllDestinations( module );

					$(this).removeClass( stopClass );
					$(this).addClass( playClass );

				}

			} );

			$img.appendTo( $moduleEl );

		},

		_createOscillatorDiv		: function ( $moduleEl, module, audioNode ) {

			var $freqDiv	= this._createSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
			var $detuDiv	= this._createSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );

			$freqDiv.appendTo( $moduleEl );
			$detuDiv.appendTo( $moduleEl );

			// Create Play / Stop button
			this._createPlayStopButton( $moduleEl, module, audioNode );

		},

		_resetOscillatorModule 		: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'frequency', module.options.oscillatorFrequency );
			this._resetSliderSetting( $moduleEl, audioNode, 'detune', module.options.oscillatorDetune );

		},

		_createRadioNode			: function ( ) {

			var _self = this;

			var audio = _self.$radio.get( 0 );

			if (!audio) {
				return;
			};

			var source;

			audio.onplay = function () {

				var stream = audio.captureStream ();

				source = _self.audioContext.createMediaStreamSource ( stream );

			};
		

			return source;

		},

		_createMediaStreamSource 	: function ( stream ) {

			var source 	= this.audioContext.createMediaStreamSource( stream );

			return source;

		},

		_createLiveInput 			: function ( module ) {

			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

			if (navigator.mediaDevices) {

				var _self 	= this;
				var source;

				navigator.mediaDevices.getUserMedia(
				{
					"audio": {
						"mandatory": {
							"googEchoCancellation": "false",
							"googAutoGainControl": "false",
							"googNoiseSuppression": "false",
							"googHighpassFilter": "false"
						},
						"optional": [ ]
					},
				}).then( function( stream ) {

					source = _self._createMediaStreamSource( stream );

					/* Update source node map with this new instance */
					_self._updateAudioNode( module.name, source );

					/* If module option is started then do the connection */
					if (module.options.started) {
						_self._connectAllDestinations( module );
					}

				} );

				return source;

			}

		},

		_createLiveInputDiv 		: function ( $moduleEl, module, audioNode ) {

			this._createPlayStopButton( $moduleEl, module, audioNode );

		},

		_createGain					: function ( module ) {

			var gain = this.audioContext.createGain ();

			gain.gain.value = module.options.gainGain;

			return gain;

		},

		_createGainDiv				: function ( $moduleEl, audioNode ) {

			var $gainDiv	= this._createSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$gainDiv.appendTo( $moduleEl );

		},

		_resetGainModule 			: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.gainGain );

		},

		_createBiquadFilter			: function ( module ) {

			var node = this.audioContext.createBiquadFilter();

			node.type = module.type;
			node.frequency.value = module.options.biquadFilterFrequency;
			node.detune.value = module.options.biquadFilterDetune;
			node.Q.value = module.options.biquadFilterQ;
			node.gain.value = module.options.biquadFilterGain;

			return node;

		},

		_createBiquadFilterDiv		: function ( $moduleEl, audioNode ) {

			var $freqDiv	= this._createSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
			var $detuDiv	= this._createSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );
			var $qDiv		= this._createSliderControl( audioNode, 'Q', 1, 100, 0.1, "" );
			var $gainDiv	= this._createSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$freqDiv.appendTo( $moduleEl );
			$detuDiv.appendTo( $moduleEl );
			$qDiv.appendTo( $moduleEl );
			$gainDiv.appendTo( $moduleEl );

		},

		_resetBiquadFilterModule 	: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'frequency', module.options.biquadFilterFrequency );
			this._resetSliderSetting( $moduleEl, audioNode, 'detune', module.options.biquadFilterDetune );
			this._resetSliderSetting( $moduleEl, audioNode, 'Q', module.options.biquadFilterQ );
			this._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.biquadFilterGain );

		},

		_createDelay				: function ( module ) {

			var node = this.audioContext.createDelay ();

			node.delayTime.value = module.options.delayTime;

			return node;

		},

		_createDelayDiv				: function ( $moduleEl, audioNode ) {

			var $timeDiv	= this._createSliderControl( audioNode, 'delayTime', 0, 10, 0.01, "Sec" );

			$timeDiv.appendTo( $moduleEl );

		},

		_resetDelayModule 			: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'delayTime', module.options.delayTime );

		},

		_createDynamicsCompressor	: function ( module ) {

			var node = this.audioContext.createDynamicsCompressor ();

			node.threshold.value = module.options.compressorThreshold;
			node.knee.value = module.options.compressorKnee;
			node.ratio.value = module.options.compressorRatio;
			node.reduction.value = module.options.compressorReduction;
			node.attack.value = module.options.compressorAttack;
			node.release.value = module.options.compressorRelease;

			return node;

		},

		_createDynamicsCompressorDiv: function ( $moduleEl, audioNode ) {

			var $thresholdDiv	= this._createSliderControl( audioNode, 'threshold', -36, 0, 0.01, "DB" );
			var $kneeDiv		= this._createSliderControl( audioNode, 'knee', 0, 40, 0.01, "DB" );
			var $ratioDiv		= this._createSliderControl( audioNode, 'ratio', 1, 50, 0.1, "Sec" );
			var $reductionDiv	= this._createSliderControl( audioNode, 'reduction', -20, 0, 0.01, "DB" );
			var $attackDiv		= this._createSliderControl( audioNode, 'attack', 0, 1, 0.001, "Sec" );
			var $releaseDiv		= this._createSliderControl( audioNode, 'release', 0, 2, 0.01, "Sec" );

			$thresholdDiv.appendTo( $moduleEl );
			$kneeDiv.appendTo( $moduleEl );
			$ratioDiv.appendTo( $moduleEl );
			$reductionDiv.appendTo( $moduleEl );
			$attackDiv.appendTo( $moduleEl );
			$releaseDiv.appendTo( $moduleEl );

		},

		_resetDynamicsCompressor 	: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'threshold', module.options.compressorThreshold );
			this._resetSliderSetting( $moduleEl, audioNode, 'knee', module.options.compressorKnee );
			this._resetSliderSetting( $moduleEl, audioNode, 'ratio', module.options.compressorRatio );
			this._resetSliderSetting( $moduleEl, audioNode, 'reduction', module.options.compressorReduction );
			this._resetSliderSetting( $moduleEl, audioNode, 'attack', module.options.compressorAttack );
			this._resetSliderSetting( $moduleEl, audioNode, 'release', module.options.compressorRelease );

		},

		_createStreoPanner			: function ( module ) {

			var node = this.audioContext.createStereoPanner ( );

			node.pan.value = module.options.stereoPannerPan;

			return node;

		},

		_createStreoPannerDiv		: function ( $moduleEl, audioNode ) {

			var $panDiv		= this._createSliderControl( audioNode, 'pan', -1, 1, 0.01, "" );

			$panDiv.appendTo( $moduleEl );

		},

		_resetStreoPannerModule 	: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'pan', module.options.stereoPannerPan );

		},

		_createDistortionCurve		: function ( amount ) {

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

		_createWaveShaper			: function ( module ) {

			var node = this.audioContext.createWaveShaper ( );

			node.curve = this._createDistortionCurve ( module.options.waveShapperCurveAmount );
			node.oversample = module.options.waveShapperOversample;

			return node;

		},

		_createWaveShaperDiv		: function ( $moduleEl, audioNode ) {

			var _self = this;

			var $curveDiv		= this._createSliderControl( audioNode, 'curve', 0, 1000, 1, "", function() {

				audioNode.curve = _self._createDistortionCurve ( this.value );

			} );

			var $oversampleDiv		= this._createSliderControl( audioNode, 'oversample', 0, 4, 2, "", function() {

				var value = this.value == 0 ? 'none' : this.value + 'x';

				audioNode.oversample = value;

			} );

			$curveDiv.appendTo( $moduleEl );
			$oversampleDiv.appendTo( $moduleEl );

		},

		_resetWaveShaperModule 		: function ( $moduleEl, module, audioNode ) {

			this._resetSliderSetting( $moduleEl, audioNode, 'curve', module.options.waveShapperCurveAmount );
			this._resetSliderSetting( $moduleEl, audioNode, 'oversample', module.options.waveShapperOversample );

		},

		_createAnalyser				: function ( module ) {

			var analyser 		= this.audioContext.createAnalyser ( );

			analyser.fftSize 	= module.options.analyserFftSize;

			var bufferLength 	= analyser.frequencyBinCount;
			var dataArray		= new Uint8Array ( bufferLength );
			
			analyser.getByteTimeDomainData ( dataArray );

			return analyser;

		},

		_createAnalyserDiv			: function ( $moduleEl, module, audioNode ) {

			var template 	= '<canvas class="nm-analyser-canvas"></canvas>';
			var $canvas 	= $( template );

			var canvasCtx 	= $canvas[0].getContext("2d");

			$canvas.appendTo( $moduleEl );

			if (module.type === 'sinewave') {

				this._createSinewaveAnalyser( $moduleEl, module, $canvas, canvasCtx, audioNode );
			}
			else if (module.type === 'frequencybars') {

				this._createFequencyBarsAnalyser( $moduleEl, module, $canvas, canvasCtx, audioNode );
			}
			else {

				this._createSinewaveAnalyser( $moduleEl, module, $canvas, canvasCtx, audioNode );
			}

		},

		_createSinewaveAnalyser 	: function ( $moduleEl, module, $canvas, canvasCtx, audioNode ) {

			var WIDTH 			= $canvas[ 0 ].width;
			var HEIGHT 			= $canvas[ 0 ].height;

			var mainBg 			= module.options.analyserMainBgColor;
			var sineBg 			= module.options.analyserSineBgColor;

			audioNode.fftSize 	= 2048;
			var bufferLength 	= audioNode.fftSize;

			var dataArray 		= new Uint8Array( bufferLength );

			canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

			function draw( ) {

				drawVisual 		= requestAnimationFrame( draw );

				audioNode.getByteTimeDomainData( dataArray );

				canvasCtx.fillStyle 	= 'rgb(' + mainBg + ', ' + mainBg + ', ' + mainBg + ')';
				canvasCtx.fillRect( 0, 0, WIDTH, HEIGHT );

				canvasCtx.lineWidth 	= 2;
				canvasCtx.strokeStyle 	= 'rgb(' + sineBg + ', ' + sineBg + ', ' + sineBg + ')';

				canvasCtx.beginPath();

				var sliceWidth = WIDTH * 1.0 / bufferLength;
				var x = 0;

				for ( var i = 0; i < bufferLength; i++ ) {

					var v = dataArray[ i ] / 128.0;
					var y = v * HEIGHT / 2;

					if ( i === 0 ) {
						canvasCtx.moveTo( x, y );
					} else {
						canvasCtx.lineTo( x, y );
					}

					x += sliceWidth;

				}

				canvasCtx.lineTo( WIDTH, HEIGHT / 2);
				canvasCtx.stroke( );
			};

			draw( );

		},

		_createFequencyBarsAnalyser : function ( $moduleEl, module, $canvas, canvasCtx, audioNode ) {

			var WIDTH 			= $canvas[ 0 ].width;
			var HEIGHT 			= $canvas[ 0 ].height;

			var mainBg 			= module.options.analyserMainBgColor;
			var barBg 			= module.options.analyserBarBgColor;

			audioNode.fftSize 	= 256;

			var bufferLength 	= audioNode.frequencyBinCount;
			var dataArray 		= new Uint8Array( bufferLength );

			canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

			function draw( ) {

				drawVisual 		= requestAnimationFrame( draw );

				audioNode.getByteFrequencyData( dataArray );

				canvasCtx.fillStyle = 'rgb(' + mainBg + ', ' + mainBg + ', ' + mainBg + ')';
				canvasCtx.fillRect( 0, 0, WIDTH, HEIGHT );

				var barWidth = ( WIDTH / bufferLength ) * 2.5;
				var barHeight;
				var x = 0;

				for(var i = 0; i < bufferLength; i++) {

					barHeight = dataArray[ i ];

					canvasCtx.fillStyle = 'rgb(' + ( barHeight + 100 ) + ', ' + barBg + ', ' + barBg + ')';
					canvasCtx.fillRect( x, HEIGHT - barHeight / 2, barWidth, barHeight / 2 );

					x += barWidth + 1;
				}

			}

			draw( );

		},

		_connectPeriodicWave		: function ( oscillator ) {

			var wave = this.audioContext.createPeriodicWave(
				this.options.periodicWaveRealArray, 
				this.options.periodicWaveImagArray, 
				{
					disableNormalization: this.options.periodicWaveDisableNorm
				});

			oscillator.setPeriodicWave ( wave );

			return wave;

		},

		_connectNodeToDestination	: function ( node ) {

			this._connectNodes ( node, this.audioContext.destination );

		},

		_connectNodes				: function ( srcNode, destNode ) {

			if (srcNode === null || srcNode === undefined || 
				destNode === null || destNode === undefined) {
				return;
			}

			srcNode.connect ( destNode );

		},

		_disconnectNodes			: function ( srcNode, destNode ) {

			if (srcNode === null || srcNode === undefined || 
				destNode === null || destNode === undefined) {
				return;
			}

			srcNode.disconnect ( destNode );

		},

		_connectAllDestinations 	: function ( module ) {

			var _self = this;

			$.each( this.options.connections, function( index, conn ) {

				if ( conn.srcNode === module.name ) {
					
					var srcNode 	= _self._findAudioNode( conn.srcNode );
					var destNode 	= _self._findAudioNode( conn.destNode );

					_self._connectNodes( srcNode, destNode );

				};

			} );

		},

		_disconnectAllDestinations	: function ( module ) {

			var _self = this;

			$.each( this.options.connections, function( index, conn ) {

				if ( conn.srcNode === module.name ) {
					
					var srcNode 	= _self._findAudioNode( conn.srcNode );
					var destNode 	= _self._findAudioNode( conn.destNode );

					_self._disconnectNodes( srcNode, destNode );

				};

			} );

		},

	};


	/* Noise Module Factory */

	$.fn.noiseModule 			= function ( options, radio ) {

		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'noiseModule' );
				
				if ( !instance ) {

					window.console.error( "cannot call methods on noiseModule prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				
				}
				
				if ( !$.isFunction( instance[ options ] ) || options.charAt(0) === "_" ) {

					window.console.error( "no such method '" + options + "' for noiseModule instance" );
					return;
				
				}
				
				instance[ options ].apply( instance, args );
			
			});

			return this;
		
		} 
		else {
		
			var instance;

			this.each(function() {
			
				instance = $.data( this, 'noiseModule' );
				
				if ( !instance ) {

					instance = new $.NoiseModule( options, this, radio );

					$.data( this, 'noiseModule', instance );
				}

			});

			return instance;
		
		}

	};


} )( window, navigator, jQuery );