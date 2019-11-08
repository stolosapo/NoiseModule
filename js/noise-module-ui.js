( function( window, navigator, $, undefined ) {

    $.NoiseModuleUI             = function ( noiseModule, options, element ) {

        this.$el    = $( element );
        this.nm     = noiseModule;

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

        _createModulesUI                : function ( ) {

            // create container for all modules
            var template        = `
            <section id="noise-module-container" class="noise-module-container">
            </section>`;

            this.$containerEl   = $( template );
            this.$el.prepend( this.$containerEl );

            let _self = this;

            // create UI for all modules
            this.nm.moduleMap
                .forEach( m => _self._createModuleUI( m ) );
        },

        _createModuleUI                 : function ( moduleItem ) {

            let module          = moduleItem.module;
            let audioNode       = moduleItem.audioNode;
            let moduleImpl      = moduleItem.moduleImpl;
            let name            = module.name;
            let moduleNumber    = moduleItem.id;
            const moduleId      = "module" + moduleNumber;

            const template      = `
            <div id="${moduleId}" class="noise-module ${module.nodeType}">
                <div class="nm-content">
                    <h6 class="nm-content-title">${name}</h6>
                </div>
            </div>`;

            var $divEl          = $( template );
            $divEl.attr( 'name', name );

            // append content
            var $content        = $( $divEl ).find( '.nm-content' );
            moduleImpl.createModuleDiv( $content, module, audioNode );

            // add bypass and reset modes
            this._appendBypassButton( $divEl, $content, module, audioNode );
            this._appendResetButton( $divEl, $content, module, audioNode );

            // add footer
            this._appendModuleFooter( $divEl, $content, module, audioNode );

            $divEl.appendTo( this.$containerEl );
            $divEl.show();
        },

        _appendBypassButton             : function ( $divEl, $content, module, audioNode ) {

            if ( !audioNode ) {

                console.error( "Could not append Bypass button. No audioNode found for module:", module );
                return;
            }

            if ( audioNode.numberOfInputs > 0 ||
                ( audioNode.inNode && audioNode.inNode.numberOfInputs > 0 ) ) {

                let template    = '<img class="nm-bypass" />';
                let $img        = $( template );

                $img.appendTo( $divEl );

                this._createBypassEvent( $divEl, $content, module, audioNode );
            }
        },

        _appendResetButton              : function ( $divEl, $content, module, audioNode ) {

            if (module.nodeType != 'noise' &&
                module.nodeType != 'liveinput' &&
                module.nodeType != 'analyser') {

                var template    = '<img class="nm-reset" />';
                var $img        = $( template );

                $img.appendTo( $divEl );

                this._createResetEvent( $divEl, $content, module, audioNode );
            }
        },

        _appendModuleFooter             : function ( $divEl, $content, module, audioNode ) {

            if ( !audioNode ) {

                console.error( "Could not append Footer. No audioNode found for module:", module );
                return;
            }

            var inNode      = audioNode.inNode || audioNode;
            var outNode     = audioNode.outNode || audioNode;

            var template    = '<footer class="nm-footer"></footer>';
            var $footer     = $( template );

            if (inNode.numberOfInputs > 0) {

                var conns   = this.nm._findModuleConnections( module, 'in' );

                var fromTem = `
                <div class="nm-direction direction-from">
                    <ul class="nm-list list-from">
                    </ul>
                </div>`;

                var $from   = $( fromTem );
                var $imgFrom    = this._createFooterImage( true, 'icon-from');

                $from.prepend( $imgFrom );

                var $list   = ( $from ).find( '.nm-list' );

                $.each( conns, function( index, conn ) {

                    $list.append( $('<li>').text( conn ) );

                } );


                $from.appendTo( $footer );
            }

            if (outNode.numberOfOutputs > 0) {

                var conns   = this.nm._findModuleConnections( module, 'out' );

                var toTem   = `
                <div class="nm-direction direction-to">
                    <ul class="nm-list list-to">
                    </ul>
                </div>`;

                var $to     = $( toTem );
                var $imgTo  = this._createFooterImage( false, 'icon-to');

                $to.prepend( $imgTo );

                var $list   = ( $to ).find( '.nm-list' );

                $.each( conns, function( index, conn ) {

                    $list.append( $('<li>').text( conn ) );

                } );

                $to.appendTo( $footer );
            }

            $footer.appendTo( $divEl );
        },

        _createFooterImage              : function ( inOut, cssClass ) {

            var _self       = this;

            var template    = '<img class="nm-icon" />';

            $img            = $( template );
            $img.addClass( cssClass );

            $img[0].addEventListener( 'click', function( e ) {

                _self._footerImageClicked( this, e, inOut );
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

        _createBypassEvent              : function ( $divEl, $content, module, audioNode ) {

            let _self   = this;
            let $bypass = $( $divEl ).find( '.nm-bypass' );

            $bypass[0].addEventListener( 'click', function( ) {

                _self._bypassModule( $content, module, audioNode );
            } );
        },

        _createResetEvent               : function ( $divEl, $content, module, audioNode ) {

            var _self   = this;
            var $reset  = $( $divEl ).find( '.nm-reset' );

            $reset[0].addEventListener( 'click', function( ) {

                _self._resetModuleSettings( $content, module, audioNode );
            } );
        },

        _bypassModule                   : function ( $content, module, audioNode ) {

            var bypassedClass   = 'bypassed';
            var bypassed        = $content.hasClass( bypassedClass );

            if (bypassed) {

                $content.removeClass( bypassedClass );
            }
            else {

                $content.addClass( bypassedClass );
            }
        },

        _resetModuleSettings            : function ( $content, module, audioNode ) {

            var nodeType = module.nodeType;

            var item = this.nm._findRegisteredModuleImpl( nodeType );

            if ( !item ) {
                console.error( "Could not reset settings. No implementation found for module:", module );
                return;
            }

            item.resetModuleSettings( $content, module, audioNode );
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

    };

} )( window, navigator, jQuery );
