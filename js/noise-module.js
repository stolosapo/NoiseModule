( function( window, $, undefined ) {

	/* Noise Module Object */

	$.NoiseModule				= function ( options, element, radio ) {

		this.$el = $( element );
		this.$radio = $( radio );

		this._init ( options );

	};

	$.NoiseModule.defaults		= {

		/* Node Type :
			noise 				{ white, pink, brown }
			oscillator 			{ sine, square, sawtooth, triangle }
			biquadfilter 		{ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
			delay
			dynamicscompressor
			gain
			stereopannernode
			waveshapernode
			periodicwave
			analyser
		*/
		modules 				: [

			{ name: "WhiteNoise", nodeType: "noise", type: "white", options: { started: false } },
			{ name: "Gain", nodeType: "gain", type: "", options: { gainGain: 0.65 } }

		],

		connections				: [

			{ srcNode: "WhiteNoise", destNode: "Gain", connected: false },
			{ srcNode: "Gain", destNode: "output", connected: true }

		],

		started					: true,

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

	};

	$.NoiseModule.prototype		= {

		_init						: function ( options ) {

			// the options
			this.options 		= $.extend( true, {}, $.NoiseModule.defaults, options );

			// initialize counters
			this.moduleCounter	= 0;
			this.moduleMap		= [];

			// create audio context
			this._createAudioContext();

			// create modules
			this._createModules();

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
			this.$containerEl = $( '<section id="noise-module-container" class="noise-module-container"></section>' );

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

			$divEl.appendTo( this.$containerEl );
			$divEl.show();

		},

		_appendContentToModule		: function ( $moduleEl, module, audioNode ) {

			var nodeType 	= module.nodeType;

			if ( nodeType === "noise" ) {
				return this._createNoiseDiv( $moduleEl, module, audioNode );
			};

			if ( nodeType === "oscillator" ) {
				return this._createOscillatorDiv( $moduleEl, module, audioNode );
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
				return this._createAnalyserDiv( $moduleEl, audioNode );
			};

		},

		_createAudioNode			: function ( module ) {

			var nodeType = module.nodeType;

			if ( nodeType === "noise" ) {
				return this._createNoise( module );
			};

			if ( nodeType === "oscillator" ) {
				return this._createOscillator( module );
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

		_createConnection			: function ( connection ) {

			if (connection.connected === false) {
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
			<div>\
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

			$input[0].value = audioNode[ property ].value;

			$span.text( audioNode[ property ].value );

			if (changeEvent != null && changeEvent != undefined) {

				$input[0].addEventListener( 'change', changeEvent );

				return $div;
			}

			$input[0].addEventListener( 'change', function() {

				audioNode[ property ].value = this.value;
				$span.text( this.value );

			} );

			return $div;

		},

		_createPlayStopButton		: function ( $moduleEl, module, audioNode ) {

			var _self 		= this;

			var template;

			if (module.options.started) {
				template	= '<img src="img/stop_24.png" alt="stop"></img>';
			}
			else {
				template	= '<img src="img/play_24.png" alt="play"></img>';
			}

			var $img 		= $( template );

			$img[0].addEventListener( 'click', function( ) {

				var alt 	= $(this).attr( 'alt' );

				if (alt === 'play') {

					_self._connectAllDestinations( module );

					$(this).attr( 'alt', 'stop' );
					$(this).attr( 'src', 'img/stop_24.png' );

				}
				else {

					_self._disconnectAllDestinations( module );

					$(this).attr( 'alt', 'play' );
					$(this).attr( 'src', 'img/play_24.png' );

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

		_createGain					: function ( module ) {

			var gain = this.audioContext.createGain ();

			gain.gain.value = module.options.gainGain;

			return gain;

		},

		_createGainDiv				: function ( $moduleEl, audioNode ) {

			var $gainDiv	= this._createSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$gainDiv.appendTo( $moduleEl );

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

		_createDelay				: function ( module ) {

			var node = this.audioContext.createDelay ();

			node.delayTime.value = module.options.delayTime;

			return node;

		},

		_createDelayDiv				: function ( $moduleEl, audioNode ) {

			var $timeDiv	= this._createSliderControl( audioNode, 'delayTime', 0, 10, 0.01, "Sec" );

			$timeDiv.appendTo( $moduleEl );

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

		_createStreoPanner			: function ( module ) {

			var node = this.audioContext.createStereoPanner ( );

			node.pan.value = module.options.stereoPannerPan;

			return node;

		},

		_createStreoPannerDiv		: function ( $moduleEl, audioNode ) {

			var $panDiv		= this._createSliderControl( audioNode, 'pan', -1, 1, 0.01, "" );

			$panDiv.appendTo( $moduleEl );

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

		_createAnalyser				: function ( module ) {

			var analyser 		= this.audioContext.createAnalyser ( );

			analyser.fftSize 	= module.options.analyserFftSize;

			var bufferLength 	= analyser.frequencyBinCount;
			var dataArray		= new Uint8Array ( bufferLength );
			
			analyser.getByteTimeDomainData ( dataArray );

			return analyser;

		},

		_createAnalyserDiv			: function ( $moduleEl, audioNode ) {

			var $canvas 	= $( '<canvas class="nm-analyser-canvas"></canvas>' );

			var canvasCtx 	= $canvas[0].getContext("2d");

			$canvas.appendTo( $moduleEl );

			function draw() {

				var bufferLength 		= audioNode.frequencyBinCount;
				var dataArray 			= new Uint8Array( bufferLength );

				drawVisual 				= requestAnimationFrame( draw );

				audioNode.getByteTimeDomainData( dataArray );

				canvasCtx.fillStyle 	= 'rgb(200, 200, 200)';
				canvasCtx.fillRect( 0, 0, $canvas[0].width, $canvas[0].height );

				canvasCtx.lineWidth 	= 2;
				canvasCtx.strokeStyle 	= 'rgb(0, 0, 0)';

				canvasCtx.beginPath();

				var sliceWidth = $canvas[0].width * 1.0 / bufferLength;
				var x = 0;

				for (var i = 0; i < bufferLength; i++) {

					var v = dataArray[i] / 128.0;
					var y = v * $canvas[0].height / 2;

					if (i === 0) {
					  canvasCtx.moveTo(x, y);
					} else {
					  canvasCtx.lineTo(x, y);
					}

					x += sliceWidth;

				}

				canvasCtx.lineTo($canvas[0].width, $canvas[0].height / 2);
				canvasCtx.stroke();
			};

			draw();

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

			srcNode.connect ( destNode );

		},

		_disconnectNodes			: function ( srcNode, destNode ) {

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


} )( window, jQuery );