( function( window, navigator, $, undefined ) {

    $.NoiseModuleUI             = function ( noiseModule, options, element ) {

        this.$el    = $( element );
        this.nm     = noiseModule;

        /* Set also into NoiseModule the UI module */
        this.nm.ui  = this;

        if ( !options.fileMode ) {

            this._init ( options );
        }
        else {

            this._initFromFile( );
        }
    };

    $.NoiseModuleUI.defaults    = {

        fileMode    : false
    };

    $.NoiseModuleUI.prototype   = {

        _init                           : function ( options ) {

            // the options
            this.options        = $.extend( true, {}, $.NoiseModuleUI.defaults, options );

            // remove all containers
            if ( this.$containerEl ) {
                this.$containerEl.remove( );
            }

            // create modules
            this._createModulesUI();
        },

        _initFromFile                   : function ( ) {

            let _self           = this;
            let template        = '<input type="file" id="nm-file-input" />';
            let $fileInput      = $( template );

            $fileInput[0].addEventListener( 'change', function ( e ) {

                let file    = e.target.files[0];

                if (!file) {
                    return;
                }

                let reader  = new FileReader();

                reader.onload = function( e ) {

                    let content         = e.target.result;
                    let moduleOptions   = JSON.parse( content );

                    _self._init( moduleOptions );

                };

                reader.readAsText( file );

            }, false );

            $fileInput.appendTo( this.$el );
        },

        appendElementToTarget           : function ( $elem, $target ) {

            if ( !$elem || !$target ) {
                return;
            }

            $elem.appendTo( $target );
        },

        _createModulesUI                : function ( ) {

            // create container for all modules
            const template      = `
                <section id="noise-module-container" class="noise-module-container">
                </section>`;

            this.$containerEl   = $( template );
            this.appendElementToTarget( this.$containerEl, this.$el );

            let _self = this;

            // create UI for all modules
            this.nm.moduleInstaces
                .forEach( m => {

                    let $div = _self._createModuleUI( m );
                    _self.appendElementToTarget( $div, this.$containerEl );
                    $div.show( );

                    if ( !m.module.options.lockPosition ) {
                        _self._makeElementDraggable( $div );
                    }
                } );

            // line up modules
            this._lineUpModules( );

            // draw connections
            let $svg = this._createConnectionsUI( );
            this.appendElementToTarget( $svg, this.$containerEl );
        },

        createContentContainer          : function ( ) {

            const template  = `
                <div class="nm-content">
                </div>`;

            return $( template );
        },

        _createModuleUI                 : function ( moduleItem ) {

            let module            = moduleItem.module;
            let audioNode         = moduleItem.audioNode;
            let moduleImpl        = moduleItem.moduleImpl;
            let name              = module.name;
            let moduleNumber      = moduleItem.id;
            const moduleId        = "module" + moduleNumber;

            const template        = `
                <div id="${moduleId}" name="${name}" class="noise-module ${module.nodeType}">
                </div>`;

            let $div              = $( template );

            let $content  = moduleImpl.createModuleDiv( module, audioNode );
            let $header   = this._createModuleHeader( name, module, audioNode );
            let $footer   = this.createModuleFooter( module, audioNode );

            this.appendElementToTarget( $header, $div );
            this.appendElementToTarget( $content, $div );
            this.appendElementToTarget( $footer, $div );

            moduleImpl.$div = $content;

            return $div;
        },

        _createModuleHeader             : function ( name, module, audioNode ) {

            const template        = `
                <header class="nm-header">
                </header>`;

            const titleTemplate   = `
                <h6 class="nm-header-title">
                    ${name}
                </h6>`;

            let $header     = $( template );
            let $title      = $( titleTemplate );
            let $bypass = this._createBypassButton( $header, module, audioNode );
            let $reset  = this._createResetButton( module, audioNode );

            this.appendElementToTarget( $bypass, $header );
            this.appendElementToTarget( $title, $header );
            this.appendElementToTarget( $reset, $header );

            return $header;
        },

        /* TODO: Make it simpler */
        _createBypassButton             : function ( $element, module, audioNode ) {

            if ( !audioNode ) {
                return void(0);
            }

            if ( audioNode.numberOfInputs > 0 ||
                ( audioNode.inNode && audioNode.inNode.numberOfInputs > 0 ) ) {

                let _self       = this;
                let template    = '<img class="nm-bypass" />';
                let $img        = $( template );

                $img[0].addEventListener( 'click', function( ) {
                    _self._bypassModule( $element, module, audioNode );
                } );

                return $img;
            }

            return void(0);
        },

        _createResetButton              : function ( module, audioNode ) {

            if (module.nodeType != 'noise' &&
                module.nodeType != 'liveinput' &&
                module.nodeType != 'analyser') {

                let _self       = this;
                let template    = '<img class="nm-reset" />';
                let $img        = $( template );

                $img[0].addEventListener( 'click', function( ) {
                    _self._resetModuleSettings( module, audioNode );
                } );

                return $img;
            }

            return void(0);
        },

        createModuleFooter              : function ( module, audioNode ) {

            if ( !audioNode ) {
                return;
            }

            let inNode      = audioNode.inNode || audioNode;
            let outNode     = audioNode.outNode || audioNode;

            let template    = '<footer class="nm-footer"></footer>';
            let $footer     = $( template );

            if (inNode.numberOfInputs > 0) {

                let $in = this._createFooterDirectionInfo( module, 'in' );
                this.appendElementToTarget( $in, $footer );
            }

            if (outNode.numberOfOutputs > 0) {

                let $out = this._createFooterDirectionInfo( module, 'out' );
                this.appendElementToTarget( $out, $footer );
            }

            return $footer;
        },

        _createFooterDirectionInfo      : function ( module, direction ) {

            let conns   = this.nm._findModuleConnections( module, direction );

            const template      = `
                <div class="nm-direction direction-${direction}">
                </div>`;

            const listTemplate  = `
                <ul class="nm-list list-${direction}">
                </ul>`;

            let $info = $( template );
            let $list = $( listTemplate );
            let $img  = this._createFooterImage( true, `icon-${direction}`);

            this.appendElementToTarget( $img, $info );
            this.appendElementToTarget( $list, $info );

            conns.forEach( c => $list.append( $('<li>').text( c ) ));

            return $info;
        },

        _createFooterImage              : function ( inOut, cssClass ) {

            var _self       = this;

            var template    = '<img class="nm-icon" />';

            $img            = $( template );
            $img.addClass( cssClass );

            $img[0].addEventListener( 'click', function( e ) {

                // TODO: Fix this. Is not working well.
                // _self._footerImageClicked( this, e, inOut );
            } );

            return $img;
        },

        _footerImageClicked             : function ( sender, e, inOut ) {

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

        createPlayStopButton            : function ( module, audioNode ) {

            var _self       = this;

            var playClass   = 'play';
            var stopClass   = 'stop';

            var template    = '<img class="nm-play-button"></img>';
            var $button        = $( template );

            if ( module.options.started ) {
                $button.addClass( stopClass );
            }
            else {
                $button.addClass( playClass );
            }

            $button[0].addEventListener( 'click', function( ) {

                _self.nm.resumeAudioContext();

                if ( $(this).hasClass( playClass ) ) {

                    _self.nm._connectAllDestinations( module );

                    $(this).removeClass( playClass );
                    $(this).addClass( stopClass );
                }
                else {

                    _self.nm._disconnectAllDestinations( module );

                    $(this).removeClass( stopClass );
                    $(this).addClass( playClass );
                }

            } );

            return $button;
        },

        createPlayPauseButton           : function ( module, audioNode, playPauseClickEvent ) {

            var _self       = this;

            var playClass   = 'play';
            var pauseClass  = 'pause';

            var template    = '<img class="nm-play-button"></img>';
            var $button     = $( template );

            if ( module.options.started ) {

                $button.addClass( pauseClass );
            }
            else {

                $button.addClass( playClass );
            }

            $button[0].addEventListener( 'click', function( ) {

                _self.nm.resumeAudioContext();

                if ( $(this).hasClass( playClass ) ) {

                    playPauseClickEvent( _self, module, audioNode, true );

                    $(this).removeClass( playClass );
                    $(this).addClass( pauseClass );
                }
                else {

                    playPauseClickEvent( _self, module, audioNode, false );

                    $(this).removeClass( pauseClass );
                    $(this).addClass( playClass );
                }

            } );

            return $button;
        },

        createCustomButton              : function ( module, audioNode, cssClasses, clickEvent ) {

            var _self   = this;

            var template    = '<img class="nm-play-button"></img>';
            var $button     = $( template );

            if ( cssClasses ) {
                cssClass.forEach(c => $button.addClass( c ));
            };

            $button[0].addEventListener( 'click', function( ) {

                _self.nm.resumeAudioContext();

                clickEvent( _self, module, audioNode );
            } );

            return $button;
        },

        createSimpleSliderControl       : function ( audioNode, property, min, max, step, units, changeEvent ) {

            return this.createSliderControl(
                audioNode,
                property,
                property,
                min,
                max,
                step,
                units,
                changeEvent );
        },

        createSliderControl             : function ( audioNode, property, description, min, max, step, units, changeEvent ) {

            let template    = `
                <div class="${property}" name="${description}">
                    <div class="nm-slider-info" min="${min}" max="${max}">
                        <span class="nm-label">${description}</span>
                        <span class="nm-value" units="${units}"></span>
                    </div>
                    <input min="${min}" max="${max}" step="${step}" type="range"></input>
                </div>`;

            let $div    = $( template );
            let $span   = $( $div ).find( '.nm-value' );
            let $input  = $( $div ).find( 'input' );

            let value   = audioNode[ property ].value;

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

        resetSliderSetting              : function ( $moduleEl, audioNode, property, value ) {

            var $div        = $( $moduleEl ).find( '.' + property );
            var $span       = $( $div ).find( '.nm-value' );
            var $input      = $( $div ).find( 'input' );
            var units       = $span.attr( 'units' );

            $input[0].value = value;
            $span.text( value + ' ' + units );
            audioNode[ property ].value = value;
        },

        resetSliderSettingByClasses     : function ( $moduleEl, audioNode, property, classes, value ) {

            var propertyClass   = classes.join( '.' );

            var $div        = $( $moduleEl ).find( '.' + propertyClass );
            var $span       = $( $div ).find( '.nm-value' );
            var $input      = $( $div ).find( 'input' );
            var units       = $span.attr( 'units' );

            $input[0].value = value;
            $span.text( value + ' ' + units );
            audioNode[ property ].value = value;
        },

        _bypassModule                   : function ( $element, module, audioNode ) {

            var bypassedClass   = 'bypassed';
            var bypassed        = $element.hasClass( bypassedClass );

            if (bypassed) {
                $element.removeClass( bypassedClass );
            }
            else {
                $element.addClass( bypassedClass );
            }
        },

        _resetModuleSettings            : function ( module, audioNode ) {

            var instance = this.nm._findModuleInstanseByName( module.name );

            if ( !instance ) {
                console.error( "Could not reset settings. No implementation found for module:", module );
                return;
            }

            instance.moduleImpl.resetModuleSettings( module, audioNode );
        },

        _openConnectionsExists          : function ( inOut ) {

            return this._getOpenConnections( inOut ).length > 0;
        },

        _getBeginConnectionClass        : function ( inOut ) {

            if (inOut) {
                return 'begin-in-connection';
            };

            return 'begin-out-connection';
        },

        _getOpenConnections             : function ( inOut ) {

            var beginClass = this._getBeginConnectionClass( inOut );

            var $openConnModules = this.$el.find( '.' + beginClass );

            return $openConnModules;
        },

        _beginConnection                : function ( inOut, $moduleEl ) {

            var beginClass = this._getBeginConnectionClass( inOut );

            if (!$moduleEl.hasClass( beginClass )) {

                $moduleEl.addClass( beginClass );
            };
        },

        _endConnection                  : function ( inOut, $sourceModuleEl ) {

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
                _self.connectNodes( outNode, inNode );


                // store connection


                // change footer of the module

            } );
        },

        /* TODO: Make it simpler, catch option's position */
        _lineUpModules                  : function ( ) {

            let _self = this;
            let cnt = this.nm.moduleInstaces.length;

            if ( cnt <= 0 ) {
                return;
            }

            const spaceX = 25;
            const spaceY = 25;

            let firstModule = this.nm.moduleInstaces[0];
            let firstElement = firstModule.moduleImpl.$div[0].parentElement;

            let lastX = firstElement.offsetLeft;
            let lastY = firstElement.offsetTop;
            let lastW = firstElement.offsetWidth;
            let lastH = firstElement.offsetHeight;

            _self._setTranslate( lastX, lastY, firstElement );

            this.nm.moduleInstaces
                .forEach( (m, i) => {

                    if ( i == 0 ) {
                        return;
                    }

                    let pos;

                    if ( m.module.options.position ) {
                        pos = m.module.options.position;
                    }

                    let $d = m.moduleImpl.$div[0].parentElement;

                    lastX = lastX + spaceX + lastW;
                    lastY = lastY;
                    lastW = $d.offsetWidth;
                    lastH = $d.offsetHeight;

                    _self._setTranslate( lastX, lastY, $d );
                } );
        },

        _createConnectionsUI            : function ( ) {

            let _self = this;

            const template = `
                <svg class="noise-module-svg-canvas">
                </svg>`;

            let $svg = $( template );

            this.nm.options.connections
                .forEach( c => {

                    let $line = _self._createConnectionElement( c );
                    if ( $line ) {
                        _self.appendElementToTarget( $line, $svg );
                    }
                } );

            return $svg;
        },

        _createConnectionElement        : function ( connection ) {

            let src = connection.srcNode;
            let dst = connection.destNode;
            let conn = connection.connected;

            let srcMod = this.nm._findModuleInstanseByName( src );
            let dstMod = this.nm._findModuleInstanseByName( dst );

            let $srcEl = srcMod.moduleImpl.$div[0];
            let $dstEl = dstMod ? dstMod.moduleImpl.$div[0] : void(0);

            let $line = this._createConnectionLine( $srcEl, $dstEl );

            return $line;
        },

        _createConnectionLine           : function ( $srcEl, $dstEl ) {

            if ( !$srcEl || !$dstEl ) {
                return;
            }

            let w1 = $srcEl.offsetWidth;
            let h1 = $srcEl.offsetHeight;
            let x1 = $srcEl.offsetLeft + w1;
            let y1 = $srcEl.offsetTop - ( h1 / 2 );

            let h2 = $dstEl.offsetHeight;
            let x2 = $dstEl.offsetWidth;
            let y2 = $dstEl.offsetHeight - ( h2 / 2 );

            const template = `
                <line class="nm-connection-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" />`;

            return $( template );
        },

        _makeElementDraggable           : function ( $element ) {

            let _self = this;

            let $div    = $( $element );
            let $header = $div.find( '.nm-header' );
            let $div0   = $div[ 0 ];

            let currentX = 0;
            let currentY = 0;
            let initialX = 0;
            let initialY = 0;
            let xOffset = 0;
            let yOffset = 0;

            if ( $header ) {
                /* if present, the header is where you move the DIV from:*/
                $header[0].onmousedown = dragStart;
            } else {
                /* otherwise, move the DIV from anywhere inside the DIV:*/
                $div0.onmousedown = dragStart;
            }

            function dragStart( e ) {

                e = e || window.event;
                e.preventDefault();

                // get the mouse cursor position at startup:
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                document.onmouseup = dragEnd;

                // call a function whenever the cursor moves:
                document.onmousemove = drag;
            };

            function drag( e ) {

                e = e || window.event;
                e.preventDefault();

                // calculate the new cursor position:
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                // set the element's new position:
                _self._setTranslate(currentX, currentY, $div0);
            }

            function dragEnd( ) {
                /* stop moving when mouse button is released:*/
                document.onmouseup = null;
                document.onmousemove = null;
            };
        },

        _setTranslate                   : function ( xPos, yPos, $el ) {
            $el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
        },
    };

} )( window, navigator, jQuery );
