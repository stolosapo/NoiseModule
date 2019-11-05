( function( window, navigator, $, undefined ) {

	/* Noise Module Object */

	$.NoiseModule		= function ( options, element ) {

		this.$el	= $( element );

		var fileMode	= options.fileMode;

		if (fileMode === null || fileMode === undefined || fileMode === false) {

			this._init ( options );

		}
		else {

			this._initFromFile( );

		}

	};

	$.NoiseModule.defaults	= {

		/* Node Type :
			noise			{ white, pink, brown }
			oscillator		{ sine, square, sawtooth, triangle }
			liveinput
			radionode
			soundcloudnode
			biquadfilter		{ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
			equalizer
			delay
			kingtubbynode
			convolver		{  }
			dynamicscompressor
			gain
			stereopannernode
			waveshapernode
			periodicwave
			analyser		{ sinewave, frequencybars }
			recorder
		*/
		modules			: [

			{ name: "WhiteNoise", nodeType: "noise", type: "white", options: { started: false } },
			{ name: "Gain", nodeType: "gain", type: "", options: { gainGain: 0.7 } }

		],

		connections		: [

			{ srcNode: "WhiteNoise", destNode: "Gain", connected: true },
			{ srcNode: "Gain", destNode: "output", connected: true }

		],

		started			: true,
		fileMode		: false,

		oscillatorFrequency	: 440,
		oscillatorDetune	: 0,

		radioAudioElement	: undefined,
		radioAudioIdSelector	: undefined,
		radioAudioClassSelector	: undefined,

		soundCloudClientId	: '8n0A1crHP5gI2tR3j3uSHGDWOMMM9xyo',
		soundCloudTrackUrl	: '',
		soundCloudAudio		: undefined,

		biquadFilterFrequency	: 440,
		biquadFilterDetune	: 0,
		biquadFilterQ 		: 1,
		biquadFilterGain	: 0,

		eqPreAmpInGain		: 1,
		eqPreAmpOutGain		: 1,
		eqBandControl		: 'gain',
		eqBandMin		: -12,
		eqBandMax		: 12,
		eqBandStep 		: 1,
		eqBands			: [

			{ description: '60 Hz', type: 'lowshelf', frequency: 60, detune: 0, Q: 1, gain: 0 },
			{ description: '170 Hz', type: 'lowshelf', frequency: 170, detune: 0, Q: 1, gain: 0 },
			{ description: '310 Hz', type: 'lowshelf', frequency: 310, detune: 0, Q: 1, gain: 0 },
			{ description: '600 Hz', type: 'peaking', frequency: 600, detune: 0, Q: 1, gain: 0 },
			{ description: '1 KHz', type: 'peaking', frequency: 1000, detune: 0, Q: 1, gain: 0 },
			{ description: '3 KHz', type: 'peaking', frequency: 3000, detune: 0, Q: 1, gain: 0 },
			{ description: '6 KHz', type: 'peaking', frequency: 6000, detune: 0, Q: 1, gain: 0 },
			{ description: '12 KHz', type: 'highshelf', frequency: 12000, detune: 0, Q: 1, gain: 0 },
			{ description: '14 KHz', type: 'highshelf', frequency: 14000, detune: 0, Q: 1, gain: 0 },
			{ description: '16 KHz', type: 'highshelf', frequency: 16000, detune: 0, Q: 1, gain: 0 }

		],

		delayTime		: 0.2,

		kingTubbyPreAmpInGain	: 1,
		kingTubbyPreAmpOutGain	: 1,
		kingTubbyDelayTime	: 0.5,
		kingTubbyGain		: 0.8,
		kingTubbyCutOffFreq	: 1000,

		compressorThreshold 	: -25,
		compressorKnee		: 30,
		compressorRatio 	: 12,
		compressorReduction	: -20,
		compressorAttack	: 0.003,
		compressorRelease	: 0.25,

		gainGain		: 0.7,

		stereoPannerPan		: 0,

		waveShapperCurveAmount	: 400,

		/* none, 2x, 4x */
		waveShapperOversample	: '4x',

		periodicWaveRealArray	: new Float32Array( [ 0, 1 ] ),
		periodicWaveImagArray	: new Float32Array( [ 0, 0 ] ),
		periodicWaveDisableNorm	: false,

		analyserFftSize		: 2048,
		analyserMainBgColor	: 200,
		analyserBarBgColor 	: 50,
		analyserSineBgColor	: 0,

		recorderChunks		: [ ],
		recorderStopCallback	: undefined,
		recorderMediaRecorder	: undefined,
		recorderMediaRecordings	: [ ]

	};

	$.NoiseModule.prototype		= {

		_init				: function ( options ) {

			// the options
			this.options 		= $.extend( true, {}, $.NoiseModule.defaults, options );

			// initialize counters
			this.moduleCounter	= 0;
			this.moduleMap		= [];
			this.registeredNode	= [];

			// register all node implementations
			this._registerModuleNodes( );

			// remove all containers
			if ( this.$containerEl ) {
				this.$containerEl.remove( );
			}

			// create audio context
			this._createAudioContext();

			// create modules
			this._createModules();

		},

		_initFromFile			: function ( ) {

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

		_registerModuleNode		: function ( nodeType, moduleImpl ) {

			var item = {
				nodeType	: nodeType,
				moduleImpl	: moduleImpl
			};

			this.registeredNode.push( item );

		},

		_registerModuleNodes		: function ( ) {

			this._registerModuleNode( 'noise', new $.NoiseModuleNode( this ) );
			this._registerModuleNode( 'moogfilter', new $.MoogFilterModuleNode( this ) );

			this._registerModuleNode( 'oscillator', new $.OscilatorModuleNode( this ) );
			this._registerModuleNode( 'liveinput', new $.LiveInputModuleNode( this ) );

			this._registerModuleNode( 'radionode', new $.RadioModuleNode( this ) );
			this._registerModuleNode( 'soundcloudnode', new $.SoundCloudModuleNode( this ) );
			this._registerModuleNode( 'biquadfilter', new $.BiquadFilterModuleNode( this ) );

			this._registerModuleNode( 'equalizer', new $.EqualizerModuleMode( this ) );
			this._registerModuleNode( 'delay', new $.DelayModuleNode( this ) );
			this._registerModuleNode( 'kingtubbynode', new $.KingTubbyModuleNode( this ) );
			this._registerModuleNode( 'convolver', new $.ConvolverModuleNode( this ) );

			this._registerModuleNode( 'dynamicscompressor', new $.DynamicsCompressorModuleNode( this ) );
			this._registerModuleNode( 'gain', new $.GainModuleNode( this ) );
			this._registerModuleNode( 'stereopannernode', new $.StereoPannerModuleNode( this ) );

			this._registerModuleNode( 'waveshapernode', new $.WaveShaperModuleNode( this ) );
			this._registerModuleNode( 'periodicwave', new $.PeriodWaveModuleNode( this ) );
			this._registerModuleNode( 'analyser', new $.AnalyserModuleNode( this ) );

			this._registerModuleNode( 'recorder', new $.RecorderModuleNode( this ) );

		},

		_findRegisteredModuleImpl	: function ( nodeType ) {

			var itemImp;

			$.each( this.registeredNode, function( index, item ) {

				if (item.nodeType === nodeType) {

					itemImp = item.moduleImpl;
				};
			} );

			return itemImp;

		},

		_createAudioContext		: function ( ) {

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

		_createModules			: function ( ) {

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

		_createModule			: function ( module ) {

			// Find ModuleNode Implamentation
			var moduleImpl	= this._findRegisteredModuleImpl( module.nodeType );

			if (moduleImpl === undefined) {
				return;
			};

			module.options 		= $.extend( true, {}, this.options, module.options );

			var audioNode 		= moduleImpl.createModuleAudioNode( module );

			var inNode;
			var outNode;
			var allNodes;

			if (audioNode === null || audioNode === undefined) {

				inNode 		= undefined;
				outNode 	= undefined;
				allNodes	= undefined;
			}
			else {

				inNode		= audioNode.inNode || audioNode;
				outNode 	= audioNode.outNode || audioNode;
				allNodes	= audioNode.allNodes;
			}

			// create div for module
			this._createModuleDiv( module, audioNode, moduleImpl );

			// register audio node
			var moduleItem = {
				name 		: module.name,
				inNode 		: inNode,
				outNode 	: outNode,
				allNodes 	: allNodes
			};

			this.moduleMap.push( moduleItem );

			// increase module counter
			this.moduleCounter++;

		},

		_createModuleDiv		: function ( module, audioNode, moduleImpl ) {

			var name		= module.name;
			var moduleNumber	= this._getNextModuleNumber ( );
			var moduleId		= "module" + moduleNumber;

			var template 		= '\
			<div id="' + moduleId + '" class="noise-module ' + module.nodeType + '">\
				<div class="nm-content">\
					<h6 class="nm-content-title">' + name + '</h6>\
				</div>\
			</div>';

			var $divEl 		= $( template );
			$divEl.attr( 'name', module.name );

			// append content
			var $content 		= $( $divEl ).find( '.nm-content' );
			moduleImpl.createModuleDiv( $content, module, audioNode );

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

			if ( audioNode.numberOfInputs > 0 ||
				( audioNode.inNode && audioNode.inNode.numberOfInputs > 0 ) ) {

				var template 	= '<img class="nm-bypass" />';
				var $img 	= $( template );

				$img.appendTo( $divEl );

				this._createBypassEvent( $divEl, $content, module, audioNode );
			}

		},

		_appendResetButton 		: function ( $divEl, $content, module, audioNode ) {

			if (module.nodeType != 'noise' &&
				module.nodeType != 'liveinput' &&
				module.nodeType != 'analyser') {

				var template 	= '<img class="nm-reset" />';
				var $img 	= $( template );

				$img.appendTo( $divEl );

				this._createResetEvent( $divEl, $content, module, audioNode );
			}

		},

		_createResetEvent		: function ( $divEl, $content, module, audioNode ) {

			var _self 	= this;
			var $reset 	= $( $divEl ).find( '.nm-reset' );

			$reset[0].addEventListener( 'click', function( ) {

				_self._resetModuleSettings( $content, module, audioNode );
			} );

		},

		_createBypassEvent		: function ( $divEl, $content, module, audioNode ) {

			var _self 	= this;
			var $bypass	= $( $divEl ).find( '.nm-bypass' );

			$bypass[0].addEventListener( 'click', function( ) {

				_self._bypassModule( $content, module, audioNode );
			} );

		},

		_appendModuleFooter 		: function ( $divEl, $content, module, audioNode ) {

			if (audioNode === null || audioNode === undefined) {
				return;
			}

			var inNode 	= audioNode.inNode || audioNode;
			var outNode 	= audioNode.outNode || audioNode;

			var template 	= '<footer class="nm-footer"></footer>';
			var $footer	= $( template );

			if (inNode.numberOfInputs > 0) {

				var conns 	= this._findModuleConnections( module, 'in' );

				var fromTem	= '\
				<div class="nm-direction direction-from">\
					<ul class="nm-list list-from">\
					</ul>\
				</div>';

				var $from 	= $( fromTem );
				var $imgFrom	= this._createFooterImage( true, 'icon-from');

				$from.prepend( $imgFrom );

				var $list 	= ( $from ).find( '.nm-list' );

				$.each( conns, function( index, conn ) {

					$list.append( $('<li>').text( conn ) );

				} );


				$from.appendTo( $footer );
			}

			if (outNode.numberOfOutputs > 0) {

				var conns 	= this._findModuleConnections( module, 'out' );

				var toTem	= '\
				<div class="nm-direction direction-to">\
					<ul class="nm-list list-to">\
					</ul>\
				</div>';

				var $to 	= $( toTem );
				var $imgTo	= this._createFooterImage( false, 'icon-to');

				$to.prepend( $imgTo );

				var $list 	= ( $to ).find( '.nm-list' );

				$.each( conns, function( index, conn ) {

					$list.append( $('<li>').text( conn ) );

				} );

				$to.appendTo( $footer );
			}

			$footer.appendTo( $divEl );

		},

		_createFooterImage		: function ( inOut, cssClass ) {

			var _self	= this;

			var template	= '<img class="nm-icon" />';

			$img		= $( template );
			$img.addClass( cssClass );

			$img[0].addEventListener( 'click', function( e ) {

				_self._footerImageClicked( this, e, inOut );

			} );

			return $img;

		},

		_footerImageClicked		: function ( sender, e, inOut ) {


			var $moduleEl = $( sender.parentNode.parentNode.parentNode );

			// Check to see if exist open connections for the oposite direction

			var openExists = this._openConnectionsExists( !inOut );

			if (openExists) {

				this._endConnection( !inOut, $moduleEl );
			}
			else {

				this._beginConnection( inOut, $moduleEl );
			};

		},

		_resetModuleSettings 		: function ( $content, module, audioNode ) {

			var nodeType = module.nodeType;

			var item = this._findRegisteredModuleImpl( nodeType );

			if (item != undefined) {

				return item.resetModuleSettings( $content, module, audioNode );
			};

		},

		_bypassModule 			: function ( $content, module, audioNode ) {

			var bypassedClass 	= 'bypassed';
			var bypassed 		= $content.hasClass( bypassedClass );

			if (bypassed) {

				$content.removeClass( bypassedClass );
			}
			else {

				$content.addClass( bypassedClass );
			}

		},

		_createConnection		: function ( connection ) {

			var srcModule = this._findModule( connection.srcNode );

			if ( connection.connected === false || srcModule.options.started === false ) {
				return;
			}

			var srcAudio	= this._findAudioNode( connection.srcNode );
			var srcNode 	= srcAudio.outNode;
			var destNode;

			if ( connection.destNode === "output" ) {

				this._connectNodeToDestination( srcNode );
			}
			else {

				var destAudio	= this._findAudioNode( connection.destNode );
				destNode = destAudio.inNode;

				this._connectNodes( srcNode, destNode );
			};

		},

		_findModule			: function ( moduleName ) {

			var module;

			$.each( this.options.modules, function( index, mod ) {

				if ( mod.name === moduleName ) {

					module = mod;
					return;
				};
			} );

			return module;

		},

		_findModuleDivByName		: function ( module ) {

			var $allDivs 	= this.$containerEl.find( '.noise-module.' + module.nodeType );
			var $divEl		= undefined;

			$.each( $allDivs, function ( index, div ) {

				var name = $( div ).attr( 'name' );

				if ( name === module.name ) {

					$divEl = div;
					return;
				};

			} );

			return $divEl;

		},

		_findModuleConnections 		: function ( module, direction ) {

			var _self 		= this;

			var name 		= module.name;

			var askedNodeDir 	= direction == 'in' ? 'destNode' : 'srcNode';
			var givenNodeDir 	= direction == 'in' ? 'srcNode' : 'destNode';

			var conns 		= [];

			$.each( this.options.connections, function( index, conn ) {

				if ( name === conn[ askedNodeDir ] ) {

					conns.push( conn[ givenNodeDir ] );
				};
			} );

			return conns;

		},

		_findAudioNode			: function ( moduleName ) {

			var node;

			$.each( this.moduleMap, function( index, map ) {

				if ( map.name === moduleName ) {

					node = { inNode: map.inNode, outNode: map.outNode };

					return;
				};
			} );

			return node;

		},

		_updateAudioNode		: function ( moduleName, audioInNode, audioOutNode ) {

			$.each( this.moduleMap, function( index, map ) {

				if ( map.name === moduleName ) {

					map.inNode 	= audioInNode;
					map.outNode = audioOutNode || audioInNode;

					return;
				};
			} );

		},

		_getNextModuleNumber		: function ( ) {

			return this.moduleCounter + 1;

		},

		_createSimpleSliderControl	: function ( audioNode, property, min, max, step, units, changeEvent ) {

			return this._createSliderControl(
				audioNode,
				property,
				property,
				min,
				max,
				step,
				units,
				changeEvent );

		},

		_createSliderControl		: function ( audioNode, property, description, min, max, step, units, changeEvent ) {

			var template 	= '\
			<div class="' + property + '" name="' + description + '">\
				<div class="nm-slider-info" min="' + min + '" max="' + max + '">\
					<span class="nm-label">' + description + '</span>\
					<span class="nm-value" units="' + units + '"></span>\
				</div>\
				<input min="' + min + '" max="' + max + '" step="' + step + '" type="range"></input>\
			</div>';

			var $div	= $( template );

			var $span	= $( $div ).find( '.nm-value' );
			var $input 	= $( $div ).find( 'input' );

			var value 	= audioNode[ property ].value;

			$input[0].value = value;

			$span.text( value + ' ' + units );

			if (changeEvent != null && changeEvent != undefined) {

				$input[0].addEventListener( 'input', changeEvent );

				return $div;
			}

			$input[0].addEventListener( 'input', function( ) {

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

		_resetSliderSettingByClasses	: function ( $moduleEl, audioNode, property, classes, value ) {

			var propertyClass	= classes.join( '.' );

			var $div  		= $( $moduleEl ).find( '.' + propertyClass );
			var $span		= $( $div ).find( '.nm-value' );
			var $input 		= $( $div ).find( 'input' );
			var units 		= $span.attr( 'units' );

			$input[0].value	= value;
			$span.text( value + ' ' + units );
			audioNode[ property ].value = value;

		},

		_createPlayStopButton		: function ( $moduleEl, module, audioNode ) {

			var _self 	= this;

			var playClass 	= 'play';
			var stopClass 	= 'stop';

			var template 	= '<img class="nm-play-button"></img>';
			var $img 	= $( template );

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

		_createPlayPauseButton		: function ( $moduleEl, module, audioNode, playPauseClickEvent ) {

			var _self 	= this;

			var playClass 	= 'play';
			var pauseClass 	= 'pause';

			var template 	= '<img class="nm-play-button"></img>';
			var $img 	= $( template );

			if ( module.options.started ) {

				$img.addClass( pauseClass );
			}
			else {

				$img.addClass( playClass );
			}

			$img[0].addEventListener( 'click', function( ) {

				if ( $(this).hasClass( playClass ) ) {

					playPauseClickEvent( _self, $moduleEl, module, audioNode, true );

					$(this).removeClass( playClass );
					$(this).addClass( pauseClass );
				}
				else {

					playPauseClickEvent( _self, $moduleEl, module, audioNode, false );

					$(this).removeClass( pauseClass );
					$(this).addClass( playClass );
				}

			} );

			$img.appendTo( $moduleEl );

		},

		_createCustomButton		: function ( $moduleEl, module, audioNode, cssClasses, clickEvent ) {

			var _self 	= this;

			var template 	= '<img class="nm-play-button"></img>';
			var $img 	= $( template );

			if (cssClasses != undefined) {

				$.each( cssClasses, function( index, cssClass ) {

					$img.addClass( cssClass );
				} );
			};

			$img[0].addEventListener( 'click', function( ) {

				clickEvent( _self, $moduleEl, module, audioNode );
			} );

			$img.appendTo( $moduleEl );

		},

		_createGain			: function ( module, value ) {

			var gain = this.audioContext.createGain ();

			gain.gain.value = value || module.options.gainGain;

			return gain;

		},

		_createBiquadFilter		: function ( module, type, frequency, detune, Q, gain ) {

			var node = this.audioContext.createBiquadFilter();

			node.type = type || module.type;
			node.frequency.value = frequency || module.options.biquadFilterFrequency;
			node.detune.value = detune || module.options.biquadFilterDetune;
			node.Q.value = Q || module.options.biquadFilterQ;
			node.gain.value = gain === undefined ? module.options.biquadFilterGain : gain;

			return node;

		},

		_connectNodeToDestination	: function ( node ) {

			this._connectNodes ( node, this.audioContext.destination );

		},

		_connectNodes			: function ( srcNode, destNode ) {

			if (srcNode === null || srcNode === undefined ||
				destNode === null || destNode === undefined) {
				return;
			}

			srcNode.connect ( destNode );

		},

		_disconnectNodes		: function ( srcNode, destNode ) {

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

					var srcNode 	= _self._findAudioNode( conn.srcNode ).outNode;
					var destNode 	= _self._findAudioNode( conn.destNode ).inNode;

					_self._connectNodes( srcNode, destNode );
				};
			} );

		},

		_disconnectAllDestinations	: function ( module ) {

			var _self = this;

			$.each( this.options.connections, function( index, conn ) {

				if ( conn.srcNode === module.name ) {

					var srcNode 	= _self._findAudioNode( conn.srcNode ).outNode;
					var destNode 	= _self._findAudioNode( conn.destNode ).inNode;

					_self._disconnectNodes( srcNode, destNode );
				};
			} );

		},

		_getBeginConnectionClass	: function ( inOut ) {

			if (inOut) {
				return 'begin-in-connection';
			};

			return 'begin-out-connection';

		},

		_openConnectionsExists		: function ( inOut ) {

			return this._getOpenConnections( inOut ).length > 0;

		},

		_getOpenConnections		: function ( inOut ) {

			var beginClass = this._getBeginConnectionClass( inOut );

			var $openConnModules = this.$el.find( '.' + beginClass );

			return $openConnModules;

		},

		_beginConnection		: function ( inOut, $moduleEl ) {

			var beginClass = this._getBeginConnectionClass( inOut );

			if (!$moduleEl.hasClass( beginClass )) {

				$moduleEl.addClass( beginClass );

			};

		},

		_endConnection			: function ( inOut, $sourceModuleEl ) {

			var _self = this;

			var beginClass = this._getBeginConnectionClass( inOut );
			var $openConnModules = this._getOpenConnections( inOut );
			var sourceName = $sourceModuleEl.attr( 'name' );
			var sourceAudioNode = this._findAudioNode( sourceName );
			var sourceNode = inOut ? sourceAudioNode.outNode : sourceAudioNode.inNode;

			var $destEl;
			var destName;
			var destAudioNode;
			var destNode;

			var inNode;
			var outNode;

			$.each( $openConnModules, function( index, el ) {

				$destEl = $( el );

				destName = $destEl.attr( 'name' );
				destAudioNode = _self._findAudioNode( destName );
				destNode = inOut ? destAudioNode.inNode : destAudioNode.outNode;

				console.log( 'Connect', sourceName, 'with', destName );

				$destEl.removeClass( beginClass );

				if (inOut) {
					inNode = destNode;
					outNode = sourceNode;
				}
				else {
					inNode = sourceNode;
					outNode = destNode;
				};


				// do the connection
				_self._connectNodes( outNode, inNode );


				// store connection


				// change footer of the module

			} );

		},

		_requestGET			: function ( url, callback ) {

			var request = new XMLHttpRequest( );

			request.onreadystatechange = function( ) {

				if (request.readyState === 4 &&
					request.status === 200) {
					callback( request.responseText );
				}
			};

			request.open( "GET", url, true );
			request.send( null );

		},

	};





	/**
	 * RadioModuleNode: Class for 'radionode' node
	 */

	$.RadioModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.RadioModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			var audio = this._getRadioAudioElement( module ).get( 0 );

			if (!audio) {
				return;
			};

			var source = this.nm.audioContext.createMediaElementSource( audio );

			return source;

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

			var template 	= '<span class="nm-label"></span>';
			var $span 	= $( template );

			var audio = module.options.radioAudioElement;

			if (!audio) {

				$span.text( 'Could not connect...' );
				$span.appendTo( $moduleEl );

				return $span;
			};


			audio.on( 'playing', function( e ) { $span.text( 'Playing' ); } );
			audio.on( 'pause', function( e ) { $span.text( 'Paused' ); } );
			audio.on( 'play', function( e ) { $span.text( 'Play' ); } );
			audio.on( 'ended', function( e ) { $span.text( 'Ended' ); } );
			audio.on( 'seeked', function( e ) { $span.text( 'Seeked' ); } );
			audio.on( 'seeking', function( e ) { $span.text( 'Seeking' ); } );
			audio.on( 'waiting', function( e ) { $span.text( 'Waiting' ); } );
			audio.on( 'emptied', function( e ) { $span.text( 'Cleared' ); } );


			$span.appendTo( $moduleEl );

			return $span;

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			var audio = module.options.radioAudioElement.get( 0 );

			if (!audio) {
				return;
			};

			audio.pause( );
			audio.removeAttribute( "src" );
			audio.load( );

		},


		/* Private Methods */

		_getRadioAudioElement 	: function ( module ) {

			if ( module.options.radioAudioElement != undefined ) {
				return module.options.radioAudioElement;
			};

			if ( module.options.radioAudioIdSelector != undefined ) {

				module.options.radioAudioElement = $( '#' + module.options.radioAudioIdSelector );
				return module.options.radioAudioElement;
			};

			if ( module.options.radioAudioClassSelector != undefined ) {

				module.options.radioAudioElement = $( '.' + module.options.radioAudioClassSelector );
				return module.options.radioAudioElement;
			};

		},

	};



	/**
	 * SoundCloudModuleNode: Class for 'soundcloudnode' node
	 */

	$.SoundCloudModuleNode			= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.SoundCloudModuleNode.prototype	= {

		createModuleAudioNode		: function ( module ) {

			var _self 		= this;

			var source;

			var baseUrl		= 'https://api.soundcloud.com/resolve.json?url=';
			var clientParameter 	= 'client_id=' + module.options.soundCloudClientId;
			var url			= baseUrl + module.options.soundCloudTrackUrl + '&' + clientParameter;

			var audio 		= new Audio( );
			audio.crossOrigin	= "anonymous";

			module.options.soundCloudAudio = audio;

			this.nm._requestGET( url, function ( response ) {

				var trackInfo 	= JSON.parse( response );
				var streamUrl 	= trackInfo.stream_url + "?" + clientParameter;

				audio.src 	= streamUrl;

				source 		= _self.nm.audioContext.createMediaElementSource( audio );

				/* Update source node map with this new instance */
				_self.nm._updateAudioNode( module.name, source );

				var $divEl 	= _self.nm._findModuleDivByName( module );
				var $content 	= $( $divEl ).find( '.nm-content' );

				_self.nm._appendModuleFooter( $( $divEl ), $content, module, source );
				_self.nm._connectAllDestinations( module );

				/* If module option is started then do the connection */
				if (module.options.started) {
					audio.play( );
				}
			} );

		},

		createModuleDiv			: function ( $moduleEl, module, audioNode ) {

			var template 	= '<span class="nm-label"></span>';
			var $span 	= $( template );

			var audio 	= module.options.soundCloudAudio;

			if (!audio) {

				$span.text( 'Could not connect...' );
				$span.appendTo( $moduleEl );

				return $span;
			};

			var $audioEl 	= $( audio );

			$audioEl.on( 'playing', function( e ) { $span.text( 'Playing' ); } );
			$audioEl.on( 'pause', function( e ) { $span.text( 'Paused' ); } );
			$audioEl.on( 'play', function( e ) { $span.text( 'Play' ); } );
			$audioEl.on( 'ended', function( e ) { $span.text( 'Ended' ); } );
			$audioEl.on( 'seeking', function( e ) { $span.text( 'Seeking' ); } );
			$audioEl.on( 'waiting', function( e ) { $span.text( 'Waiting' ); } );


			$span.appendTo( $moduleEl );

			this.nm._createPlayPauseButton( $moduleEl, module, audioNode, this._soundCloudPlayPauseEvent );

		},

		resetModuleSettings		: function ( $moduleEl, module, audioNode ) {

			var audio	= module.options.soundCloudAudio;
			var $img	= $moduleEl.find( '.nm-play-button' );

			audio.pause( );

			$img.removeClass( 'pause' );
			$img.addClass( 'play' );

			audio.load( );

		},


		/* Private Methods */

		_soundCloudPlayPauseEvent	: function ( self, $moduleEl, module, audioNode, playPause ) {

			var audio 		= module.options.soundCloudAudio;

			if (audio.paused) {
				audio.play( );
			}
			else {
				audio.pause( );
			};

		},

	};



	/**
	 * BiquadFilterModuleNode: Class for 'biquadfilter' node
	 */

	$.BiquadFilterModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.BiquadFilterModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			return this.nm._createBiquadFilter( module );

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

			var $freqDiv	= this.nm._createSimpleSliderControl( audioNode, 'frequency', 0, 8000, 1, "Hz" );
			var $detuDiv	= this.nm._createSimpleSliderControl( audioNode, 'detune', -1200, 1200, 1, "cents" );
			var $qDiv	= this.nm._createSimpleSliderControl( audioNode, 'Q', 1, 100, 0.1, "" );
			var $gainDiv	= this.nm._createSimpleSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$freqDiv.appendTo( $moduleEl );
			$detuDiv.appendTo( $moduleEl );
			$qDiv.appendTo( $moduleEl );
			$gainDiv.appendTo( $moduleEl );

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'frequency', module.options.biquadFilterFrequency );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'detune', module.options.biquadFilterDetune );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'Q', module.options.biquadFilterQ );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.biquadFilterGain );

		},

	};



	/**
	 * EqualizerModuleMode: Class for 'equalizer' node
	 */

	$.EqualizerModuleMode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.EqualizerModuleMode.prototype	= {

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



	/**
	 * DelayModuleNode: Class for 'delay' node
	 */

	$.DelayModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.DelayModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			var node = this.nm.audioContext.createDelay ();

			node.delayTime.value = module.options.delayTime;

			return node;

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

			var $timeDiv	= this.nm._createSimpleSliderControl( audioNode, 'delayTime', 0, 10, 0.01, "Sec" );

			$timeDiv.appendTo( $moduleEl );

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'delayTime', module.options.delayTime );

		},

	};



	/**
	 * KingTubbyModuleNode: Class for 'kingtubbynode' node
	 */

	$.KingTubbyModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.KingTubbyModuleNode.prototype	= {

		createModuleAudioNode		: function ( module ) {

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

		createModuleDiv			: function ( $moduleEl, module, audioNode ) {

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

		resetModuleSettings		: function ( $moduleEl, module, audioNode ) {

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



	/**
	 * ConvolverModuleNode: Class for 'convolver' node
	 */
	$.ConvolverModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.ConvolverModuleNode.prototype	= {

		createModuleAudioNode		: function ( module ) {

			var node = this.nm.audioContext.createConvolver( );

			console.log(node);

			return node;

		},

		createModuleDiv			: function ( $moduleEl, module, audioNode ) {

			var spanTemplate 	= '<span class="nm-label info link"></span>'
			var $normSpan 		= $( spanTemplate );

			$normSpan.text( 'normalize: ' + audioNode.normalize );

			$normSpan[0].addEventListener( 'click', function( e ) {

				audioNode.normalize = !audioNode.normalize;

				$normSpan.text( 'normalize: ' + audioNode.normalize );

			} );

			$normSpan.appendTo( $moduleEl );

		},

		resetModuleSettings		: function ( $moduleEl, module, audioNode ) {

		}

	};



	/**
	 * MoogFilterModuleNode: Class for 'moogfilter' node
	 */
	$.MoogFilterModuleNode			= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.MoogFilterModuleNode.prototype	= {

		createModuleAudioNode		: function ( module ) {

			var bufferSize = 4096;

			var node = this.nm.audioContext.createScriptProcessor( bufferSize, 1, 1 );

			var in1, in2, in3, in4, out1, out2, out3, out4;
			in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;

			node.cutoff = 0.065; // between 0.0 and 1.0
			node.resonance = 3.99; // between 0.0 and 4.0

			node.onaudioprocess = function( e ) {

				var input = e.inputBuffer.getChannelData( 0 );
				var output = e.outputBuffer.getChannelData( 0 );

				var f = node.cutoff * 1.16;
				var fb = node.resonance * (1.0 - 0.15 * f * f);

				for (var i = 0; i < bufferSize; i++) {

					input[i] -= out4 * fb;
					input[i] *= 0.35013 * (f*f)*(f*f);

					out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
					in1 = input[i];
					out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
					in2 = out1;
					out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
					in3 = out2;
					out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
					in4 = out3;

					output[i] = out4;
				}

			}
			return node;
		},

		createModuleDiv			: function ( $moduleEl, module, audioNode ) {

			this.nm._createPlayStopButton( $moduleEl, module, audioNode );

		},

		resetModuleSettings		: function ( $moduleEl, module, audioNode ) {

		}

	};




	/**
	 * DynamicsCompressorModuleNode: Class for 'dynamicscompressor' node
	 */

	$.DynamicsCompressorModuleNode			= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.DynamicsCompressorModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			var node = this.nm.audioContext.createDynamicsCompressor ();

			node.threshold.value = module.options.compressorThreshold;
			node.knee.value = module.options.compressorKnee;
			node.ratio.value = module.options.compressorRatio;
			node.reduction.value = module.options.compressorReduction;
			node.attack.value = module.options.compressorAttack;
			node.release.value = module.options.compressorRelease;

			return node;

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

			var $thresholdDiv	= this.nm._createSimpleSliderControl( audioNode, 'threshold', -36, 0, 0.01, "DB" );
			var $kneeDiv		= this.nm._createSimpleSliderControl( audioNode, 'knee', 0, 40, 0.01, "DB" );
			var $ratioDiv		= this.nm._createSimpleSliderControl( audioNode, 'ratio', 1, 50, 0.1, "Sec" );
			var $reductionDiv	= this.nm._createSimpleSliderControl( audioNode, 'reduction', -20, 0, 0.01, "DB" );
			var $attackDiv		= this.nm._createSimpleSliderControl( audioNode, 'attack', 0, 1, 0.001, "Sec" );
			var $releaseDiv		= this.nm._createSimpleSliderControl( audioNode, 'release', 0, 2, 0.01, "Sec" );

			$thresholdDiv.appendTo( $moduleEl );
			$kneeDiv.appendTo( $moduleEl );
			$ratioDiv.appendTo( $moduleEl );
			$reductionDiv.appendTo( $moduleEl );
			$attackDiv.appendTo( $moduleEl );
			$releaseDiv.appendTo( $moduleEl );

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'threshold', module.options.compressorThreshold );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'knee', module.options.compressorKnee );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'ratio', module.options.compressorRatio );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'reduction', module.options.compressorReduction );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'attack', module.options.compressorAttack );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'release', module.options.compressorRelease );

		},

	};



	/**
	 * GainModuleNode: Class for 'gain' node
	 */

	$.GainModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.GainModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			return this.nm._createGain( module );

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

			var $gainDiv	= this.nm._createSimpleSliderControl( audioNode, 'gain', 0, 1, 0.01, "" );

			$gainDiv.appendTo( $moduleEl );

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.gainGain );

		},

	};



	/**
	 * StereoPannerModuleNode: Class for 'stereopannernode' node
	 */

	$.StereoPannerModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.StereoPannerModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			var node = this.nm.audioContext.createStereoPanner ( );

			node.pan.value = module.options.stereoPannerPan;

			return node;

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

			var $panDiv = this.nm._createSimpleSliderControl( audioNode, 'pan', -1, 1, 0.01, "" );

			$panDiv.appendTo( $moduleEl );

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'pan', module.options.stereoPannerPan );

		}

	};



	/**
	 * WaveShaperModuleNode: Class for 'waveshapernode' node
	 */

	$.WaveShaperModuleNode			= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.WaveShaperModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			var node = this.nm.audioContext.createWaveShaper ( );

			node.curve = this._createDistortionCurve ( module.options.waveShapperCurveAmount );
			node.oversample = module.options.waveShapperOversample;

			return node;

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

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

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

			this.nm._resetSliderSetting( $moduleEl, audioNode, 'curve', module.options.waveShapperCurveAmount );
			this.nm._resetSliderSetting( $moduleEl, audioNode, 'oversample', module.options.waveShapperOversample );

		},

		_createDistortionCurve	: function ( amount ) {

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



	/**
	 * PeriodWaveModuleNode: Class for 'periodicwave' node
	 */

	$.PeriodWaveModuleNode			= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.PeriodWaveModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

		},

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

		},

		_connectPeriodicWave		: function ( module, oscillator ) {

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



	/**
	 * AnalyserModuleNode: Class for 'analyser' node
	 */

	$.AnalyserModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.AnalyserModuleNode.prototype	= {

		createModuleAudioNode	: function ( module ) {

			var analyser		= this.nm.audioContext.createAnalyser ( );

			analyser.fftSize	= module.options.analyserFftSize;

			var bufferLength	= analyser.frequencyBinCount;
			var dataArray		= new Uint8Array ( bufferLength );

			analyser.getByteTimeDomainData ( dataArray );

			return analyser;

		},

		createModuleDiv		: function ( $moduleEl, module, audioNode ) {

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

		resetModuleSettings	: function ( $moduleEl, module, audioNode ) {

		},

		_createSinewaveAnalyser 	: function ( $moduleEl, module, $canvas, canvasCtx, audioNode ) {

			var WIDTH 		= $canvas[ 0 ].width;
			var HEIGHT 		= $canvas[ 0 ].height;

			var mainBg 		= module.options.analyserMainBgColor;
			var sineBg 		= module.options.analyserSineBgColor;

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

		_createFequencyBarsAnalyser	: function ( $moduleEl, module, $canvas, canvasCtx, audioNode ) {

			var WIDTH 		= $canvas[ 0 ].width;
			var HEIGHT 		= $canvas[ 0 ].height;

			var mainBg 		= module.options.analyserMainBgColor;
			var barBg 		= module.options.analyserBarBgColor;

			audioNode.fftSize 	= 256;

			var bufferLength 	= audioNode.frequencyBinCount;
			var dataArray 		= new Uint8Array( bufferLength );

			canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

			function draw( ) {

				drawVisual	= requestAnimationFrame( draw );

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

	};



	/**
	 * RecorderModuleNode: Class for 'recorder' node
	 */

	$.RecorderModuleNode		= function ( noiseModule ) {

		this.nm = noiseModule;

	};

	$.RecorderModuleNode.prototype	= {

		createModuleAudioNode		: function ( module ) {

			var recorder 		= this.nm.audioContext.createMediaStreamDestination( );

			var mediaRecorder	= new MediaRecorder( recorder.stream );
			mediaRecorder.ignoreMutedMedia = true;

			module.options.recorderMediaRecorder = mediaRecorder;


			// push each chunk (blobs) in an array
			mediaRecorder.ondataavailable	= function( e ) {

				module.options.recorderChunks.push( e.data );
			};


			// Make blob out of our blobs, and open it.
			mediaRecorder.onstop		= function( e ) {

				var blob = new Blob(module.options.recorderChunks, { 'type' : 'audio/ogg; codecs=opus' });

				var audioURL = window.URL.createObjectURL(blob);

				module.options.recorderMediaRecordings.push( audioURL );

				if (module.options.recorderStopCallback != undefined) {

					module.options.recorderStopCallback( module );
				};
			};

			return recorder;

		},

		createModuleDiv			: function ( $moduleEl, module, audioNode ) {

			var stopImgClass	= [ 'stop' ];

			var spanTemp 		= '<span class="nm-label info"></span>';
			var $span 		= $( spanTemp );

			var listTemp		= '<ul class="nm-label nm-list"></ul>';
			var $list		= $( listTemp );

			$span.text( 'Status:' );

			this.nm._createPlayPauseButton( $moduleEl, module, audioNode, this._recorderPlayPauseClickEvent );
			this.nm._createCustomButton( $moduleEl, module, audioNode, stopImgClass, this._recorderStopClickEvent );

			module.options.recorderStopCallback = function( module ) {

				$list.empty( );

				$.each( module.options.recorderMediaRecordings, function( index, rec ) {

					var $a = $( '<a>' );
					$a.attr( 'href', rec );
					$a.attr( 'target', '_blank' );
					$a.text( 'track ' + (index + 1) );

					$list.append( $('<li>').append( $a ) );
				} );
			};

			$span.appendTo( $moduleEl );
			$list.appendTo( $moduleEl );

		},

		resetModuleSettings		: function ( $moduleEl, module, audioNode ) {

		},

		_recorderPlayPauseClickEvent	: function ( self, $moduleEl, module, audioNode, playPause ) {

			var mediaRecorder	= module.options.recorderMediaRecorder;
			var $span 		= $( $moduleEl ).find( '.nm-label.info' );


			if (mediaRecorder.state === 'inactive') {

				module.options.recorderChunks = [ ];

				mediaRecorder.start( );
			}
			else if (mediaRecorder.state === 'paused') {

				mediaRecorder.resume( );
			}
			else if (mediaRecorder.state === 'recording') {

				mediaRecorder.pause( );
			};

			$span.text( "Status: " + mediaRecorder.state + "..." );

		},

		_recorderStopClickEvent		: function ( self, $moduleEl, module, audioNode ) {

			var pauseClass		= 'pause';
			var playClass		= 'play';

			var mediaRecorder	= module.options.recorderMediaRecorder;
			var $span 		= $moduleEl.find( '.nm-label.info' );
			var $img		= $moduleEl.find( '.nm-play-button.pause' );

			if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {

				mediaRecorder.stop( );

				if ( $img.length > 0 ) {

					$img.removeClass( pauseClass );
					$img.addClass( playClass );
				}

				$span.text( "Status: stopped" );
			};

		},

	};




	/* Noise Module Factory */

	$.fn.noiseModule	= function ( options ) {

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

					instance = new $.NoiseModule( options, this );

					$.data( this, 'noiseModule', instance );
				}

			});

			return instance;

		}

	};


} )( window, navigator, jQuery );
