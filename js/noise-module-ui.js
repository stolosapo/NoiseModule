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

        _appendElementToTarget          : function ( $elem, $target ) {

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
            this._appendElementToTarget( this.$containerEl, this.$el );

            let _self = this;

            // create UI for all modules
            this.nm.moduleMap
                .forEach( m => {

                    let $div = _self._createModuleUI( m );
                    _self._appendElementToTarget( $div, this.$containerEl );
                    $div.show( );
                } );
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

            const contentTemplate = `
                <div class="nm-content">
                    <h6 class="nm-content-title">${name}</h6>
                </div>`;

            let $divEl          = $( template );
            let $content        = $( contentTemplate );

            // append content
            moduleImpl.createModuleDiv( $content, module, audioNode );

            let $bypass = this._createBypassButton( $content, module, audioNode );
            let $reset  = this._createResetButton( $content, module, audioNode );
            let $header = this._createModuleHeader( name, module, audioNode );
            let $footer = this._createModuleFooter( module, audioNode );

            // this._appendElementToTarget( $header, $divEl );
            this._appendElementToTarget( $content, $divEl );
            this._appendElementToTarget( $bypass, $divEl );
            this._appendElementToTarget( $reset, $divEl );
            this._appendElementToTarget( $footer, $divEl );

            return $divEl;
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
            let $reset  = this._createResetButton( $header, module, audioNode );

            this._appendElementToTarget( $bypass, $header );
            this._appendElementToTarget( $title, $header );
            this._appendElementToTarget( $reset, $header );

            return $header;
        },

        /* TODO: Make it simpler */
        _createBypassButton             : function ( $element, module, audioNode ) {

            if ( !audioNode ) {

                console.error( "Could not append Bypass button. No audioNode found for module:", module );
                return void(0);
            }

            if ( audioNode.numberOfInputs > 0 ||
                ( audioNode.inNode && audioNode.inNode.numberOfInputs > 0 ) ) {

                let template    = '<img class="nm-bypass" />';
                let $img        = $( template );

                this._createBypassEvent( $img, $element, module, audioNode );

                return $img;
            }

            return void(0);
        },

        _createResetButton              : function ( $element, module, audioNode ) {

            if (module.nodeType != 'noise' &&
                module.nodeType != 'liveinput' &&
                module.nodeType != 'analyser') {

                var template    = '<img class="nm-reset" />';
                var $img        = $( template );

                this._createResetEvent( $img, $element, module, audioNode );

                return $img;
            }

            return void(0);
        },

        _createModuleFooter             : function ( module, audioNode ) {

            if ( !audioNode ) {

                console.error( "Could not append Footer. No audioNode found for module:", module );
                return;
            }

            let inNode      = audioNode.inNode || audioNode;
            let outNode     = audioNode.outNode || audioNode;

            let template    = '<footer class="nm-footer"></footer>';
            let $footer     = $( template );

            if (inNode.numberOfInputs > 0) {

                let $in = this._createFooterDirectionInfo( module, 'in' );
                this._appendElementToTarget( $in, $footer );
            }

            if (outNode.numberOfOutputs > 0) {

                let $out = this._createFooterDirectionInfo( module, 'out' );
                this._appendElementToTarget( $out, $footer );
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

            this._appendElementToTarget( $img, $info );
            this._appendElementToTarget( $list, $info );

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

        _createBypassEvent              : function ( $img, $element, module, audioNode ) {

            let _self   = this;

            $img[0].addEventListener( 'click', function( ) {

                _self._bypassModule( $element, module, audioNode );
            } );
        },

        _createResetEvent               : function ( $img, $element, module, audioNode ) {

            var _self   = this;

            $img[0].addEventListener( 'click', function( ) {

                _self._resetModuleSettings( $element, module, audioNode );
            } );
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

        _resetModuleSettings            : function ( $element, module, audioNode ) {

            var nodeType = module.nodeType;

            var item = this.nm._findRegisteredModuleImpl( nodeType );

            if ( !item ) {
                console.error( "Could not reset settings. No implementation found for module:", module );
                return;
            }

            item.resetModuleSettings( $element, module, audioNode );
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
