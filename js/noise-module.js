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

		biquadFilterFrequency     : 440,
		biquadFilterDetune        : 0,
		biquadFilterQ             : 1,
		biquadFilterGain          : 0,

		gainGain		: 0.7
	};

	$.NoiseModule.prototype	= {

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

			if (!this.options._nodeRegistrationConfig) {
				return;
			}

            let _self = this;

            let nodeRegistrationConfig = this.options._nodeRegistrationConfig(_self);

            $.each( nodeRegistrationConfig, function( index, item ) {

				_self._registerModuleNode(item.nodeType, item.nodeImpl);
			} );
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

            let moduleDefaultOptions =
                $.extend( true, {}, this.options, moduleImpl.defaultOptions() );

			module.options =
                $.extend( true, {}, moduleDefaultOptions, module.options );

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

} )( window, navigator, jQuery );
