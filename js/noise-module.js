( function( window, navigator, $, undefined ) {

    /* Noise Module Object */

    $.NoiseModule           = function ( options, element ) {

        this.$el    = $( element );

        if ( !options.fileMode ) {

            this._init ( options );
        }
        else {

            this._initFromFile( );
        }
    };

    $.NoiseModule.defaults  = {

        /* Node Type :
            noise           { white, pink, brown }
            oscillator      { sine, square, sawtooth, triangle }
            liveinput
            radionode
            soundcloudnode
            biquadfilter        { lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
            equalizer
            delay
            kingtubbynode
            convolver       {  }
            dynamicscompressor
            gain
            stereopannernode
            waveshapernode
            periodicwave
            analyser        { sinewave, frequencybars }
            recorder
        */
        modules         : [

            { name: "WhiteNoise", nodeType: "noise", type: "white", options: { started: false } },
            { name: "Gain", nodeType: "gain", type: "", options: { gainGain: 0.7 } }

        ],

        connections     : [

            { srcNode: "WhiteNoise", destNode: "Gain", connected: true },
            { srcNode: "Gain", destNode: "output", connected: true }

        ],

        started         : true,

        /* TODO: Move to UI */
        fileMode        : false,

        biquadFilterFrequency     : 440,
        biquadFilterDetune        : 0,
        biquadFilterQ             : 1,
        biquadFilterGain          : 0,

        gainGain        : 0.7
    };

    $.NoiseModule.prototype = {

        _init                           : function ( options ) {

            // the options
            this.options        = $.extend( true, {}, $.NoiseModule.defaults, options );

            // initialize counters
            this.moduleCounter          = 0;
            this.moduleInstaces              = [];
            this.registeredFactories    = [];

            // register all node implementations
            this._registerModuleFactories( );

            // remove all containers
            if ( this.$containerEl ) {
                this.$containerEl.remove( );
            }

            // create audio context
            this._createAudioContext();

            // create modules
            this._createModules();

        },

        /* TODO: Move to UI */
        _initFromFile                   : function ( ) {

            var _self           = this;
            var template        = '<input type="file" id="nm-file-input" />';
            var $fileInput      = $( template );

            $fileInput[0].addEventListener( 'change', function ( e ) {

                var file    = e.target.files[0];

                if (!file) {
                    return;
                }

                var reader  = new FileReader();

                reader.onload = function( e ) {

                    var content         = e.target.result;
                    var moduleOptions   = JSON.parse( content );

                    _self._init( moduleOptions );

                };

                reader.readAsText( file );

            }, false );

            $fileInput.appendTo( this.$el );

        },

        _registerModuleFactories        : function ( ) {

            if (!this.options._nodeRegistrationConfig) {
                console.error("Could not find Node Registration Configuration for the NoiseModule");
                return;
            }

            this.registeredFactories = this.options._nodeRegistrationConfig( );
        },

        _findModuleInstanseByName       : function ( moduleName ) {

            const instanceArr =
                this.moduleInstaces
                    .filter(i => i.name === moduleName);

            return instanceArr.length === 1 ? instanceArr[ 0 ] : void(0);
        },

        _createAudioContext             : function ( ) {

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

            /* TODO: Error in Chrome: https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio */
            // audioContext.resume().then(() => {
            //     console.log('Playback resumed successfully');
            // });

            this.audioContext = audioContext;

        },

        _createModules                  : function ( ) {

            // create container for all modules
            var template        = '\
            <section id="noise-module-container" class="noise-module-container">\
            </section>';

            this.$containerEl   = $( template );
            this.$el.prepend( this.$containerEl );

            let _self = this;

            // create all modules
            this.options.modules
                .forEach( m => _self._createModule( m ) );


            // create module connections
            this.options.connections
                .forEach( c => _self._createConnection( c ) );
        },

        _createModule                   : function ( module ) {

            // Find Factory for module
            let factory  = this.registeredFactories[ module.nodeType ];

            if ( !factory ) {
                console.error("Could not find factory for module:", module);
                return;
            }

            // Create new instance for the module
            let moduleImpl  = factory.create( this );

            let moduleDefaultOptions =
                $.extend( true, {}, this.options, moduleImpl.defaultOptions() );

            module.options =
                $.extend( true, {}, moduleDefaultOptions, module.options );

            var audioNode = moduleImpl.createModuleAudioNode( module );

            var inNode;
            var outNode;
            var allNodes;

            if (!audioNode) {

                inNode      = undefined;
                outNode     = undefined;
                allNodes    = undefined;
            }
            else {

                inNode      = audioNode.inNode || audioNode;
                outNode     = audioNode.outNode || audioNode;
                allNodes    = audioNode.allNodes;
            }

            // increase module counter
            this.moduleCounter++;

            // register audio node
            var moduleItem = {
                id          : this.moduleCounter,
                name        : module.name,
                inNode      : inNode,
                outNode     : outNode,
                allNodes    : allNodes,
                module      : module,
                audioNode   : audioNode,
                moduleImpl  : moduleImpl
            };

            this.moduleInstaces.push( moduleItem );
        },

        _createConnection               : function ( connection ) {

            var srcModule   = this._findModule( connection.srcNode );

            if ( connection.connected === false ||
                 srcModule.options.started === false ) {
                return;
            }

            var srcAudio    = this._findAudioNode( connection.srcNode );
            var srcNode     = srcAudio.outNode;
            var destNode;

            if ( connection.destNode === "output" ) {

                this._connectNodeToDestination( srcNode );
            }
            else {

                var destAudio   = this._findAudioNode( connection.destNode );
                destNode = destAudio.inNode;

                this.connectNodes( srcNode, destNode );
            };

        },

        _findModule                     : function ( moduleName ) {

            const moduleArr =
                this.options.modules
                    .filter( m => m.name === moduleName );

            return moduleArr.length === 1 ? moduleArr[ 0 ] : void(0);
        },

        /* TODO: Move to UI */
        _findModuleDivByName            : function ( module ) {

            var $allDivs    = this.$containerEl.find( '.noise-module.' + module.nodeType );
            var $divEl      = undefined;

            $.each( $allDivs, function ( index, div ) {

                var name = $( div ).attr( 'name' );

                if ( name === module.name ) {

                    $divEl = div;
                    return;
                };

            } );

            return $divEl;
        },

        _findModuleConnections          : function ( module, direction ) {

            const askedNodeDir    = direction == 'in' ? 'destNode' : 'srcNode';
            const givenNodeDir    = direction == 'in' ? 'srcNode' : 'destNode';

            const conns =
                this.options.connections
                    .filter( c => c[ askedNodeDir ] === module.name )
                    .map( c => c[ givenNodeDir ] );

            return conns;
        },

        _findAudioNode                  : function ( moduleName ) {

            const instance = this._findModuleInstanseByName( moduleName );

            if ( !instance ) {
                return void(0);
            }

            return { inNode: instance.inNode, outNode: instance.outNode };
        },

        _updateAudioNode                : function ( moduleName, audioInNode, audioOutNode ) {

            let instance = this._findModuleInstanseByName( moduleName );

            if ( !instance ) {
                return void(0);
            }

            instance.inNode  = audioInNode;
            instance.outNode = audioOutNode || audioInNode;
        },

        /* TODO: Move to UI */
        _createSimpleSliderControl      : function ( audioNode, property, min, max, step, units, changeEvent ) {

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

        /* TODO: Move to UI */
        _createSliderControl            : function ( audioNode, property, description, min, max, step, units, changeEvent ) {

            var template    = '\
            <div class="' + property + '" name="' + description + '">\
                <div class="nm-slider-info" min="' + min + '" max="' + max + '">\
                    <span class="nm-label">' + description + '</span>\
                    <span class="nm-value" units="' + units + '"></span>\
                </div>\
                <input min="' + min + '" max="' + max + '" step="' + step + '" type="range"></input>\
            </div>';

            var $div    = $( template );

            var $span   = $( $div ).find( '.nm-value' );
            var $input  = $( $div ).find( 'input' );

            var value   = audioNode[ property ].value;

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

        /* TODO: Move to UI. Error when reset button is in header div and not in content div. Change this implementation to be more generic of where to button belongs */
        _resetSliderSetting             : function ( $moduleEl, audioNode, property, value ) {

            var $div        = $( $moduleEl ).find( '.' + property );
            var $span       = $( $div ).find( '.nm-value' );
            var $input      = $( $div ).find( 'input' );
            var units       = $span.attr( 'units' );

            $input[0].value = value;
            $span.text( value + ' ' + units );
            audioNode[ property ].value = value;

        },

        /* TODO: Move to UI */
        _resetSliderSettingByClasses    : function ( $moduleEl, audioNode, property, classes, value ) {

            var propertyClass   = classes.join( '.' );

            var $div        = $( $moduleEl ).find( '.' + propertyClass );
            var $span       = $( $div ).find( '.nm-value' );
            var $input      = $( $div ).find( 'input' );
            var units       = $span.attr( 'units' );

            $input[0].value = value;
            $span.text( value + ' ' + units );
            audioNode[ property ].value = value;

        },

        /* TODO: Move to UI */
        _createPlayStopButton           : function ( $moduleEl, module, audioNode ) {

            var _self   = this;

            var playClass   = 'play';
            var stopClass   = 'stop';

            var template    = '<img class="nm-play-button"></img>';
            var $img    = $( template );

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

        /* TODO: Move to UI */
        _createPlayPauseButton          : function ( $moduleEl, module, audioNode, playPauseClickEvent ) {

            var _self   = this;

            var playClass   = 'play';
            var pauseClass  = 'pause';

            var template    = '<img class="nm-play-button"></img>';
            var $img    = $( template );

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

        /* TODO: Move to UI */
        _createCustomButton             : function ( $moduleEl, module, audioNode, cssClasses, clickEvent ) {

            var _self   = this;

            var template    = '<img class="nm-play-button"></img>';
            var $img    = $( template );

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

        _connectNodeToDestination       : function ( node ) {

            this.connectNodes ( node, this.audioContext.destination );
        },

        connectNodes                    : function ( srcNode, destNode ) {

            if ( !srcNode || !destNode ) {

                console.error( "Could not create connection. Source and Destination should exist.", srcNode, destNode );
                return;
            }

            srcNode.connect ( destNode );
        },

        _disconnectNodes                : function ( srcNode, destNode ) {

            if ( !srcNode || !destNode ) {

                console.error( "Could not disconnect connection. Source and Destination should exist.", srcNode, destNode );
                return;
            }

            srcNode.disconnect ( destNode );
        },

        _connectAllDestinations         : function ( module ) {

            let _self = this;

            this.options.connections
                .filter( c => c.srcNode === module.name )
                .forEach( c => {

                    let srcNode     = _self._findAudioNode( c.srcNode ).outNode;
                    let destNode    = _self._findAudioNode( c.destNode ).inNode;

                    _self.connectNodes( srcNode, destNode );
                });
        },

        _disconnectAllDestinations      : function ( module ) {

            let _self = this;

            this.options.connections
                .filter( c => c.srcNode === module.name )
                .forEach( c => {

                    let srcNode     = _self._findAudioNode( c.srcNode ).outNode;
                    let destNode    = _self._findAudioNode( c.destNode ).inNode;

                    _self._disconnectNodes( srcNode, destNode );
                });
        },

        _requestGET                     : function ( url, callback ) {

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
