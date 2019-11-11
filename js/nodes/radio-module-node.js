( function( window, navigator, $, undefined ) {

    /* RadioModuleNode: Class for 'radionode' node */

    $.RadioModuleNodeFactory             = function () {
    };

    $.RadioModuleNodeFactory.prototype   = {

        typeName    : "radionode",

        create      : function ( noiseModule ) {

            return new $.RadioModuleNode( noiseModule );
        }
    };

    $.RadioModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.RadioModuleNode.defaults     = {

        radioAudioElement         : undefined,
        radioAudioIdSelector      : undefined,
        radioAudioClassSelector   : undefined
    };

    $.RadioModuleNode.prototype    = {

        defaultOptions            : function ( ) {
            return $.RadioModuleNode.defaults;
        },

        createModuleAudioNode     : function ( module ) {

            var audio = this._getRadioAudioElement( module ).get( 0 );

            if (!audio) {
                return;
            };

            var source = this.nm.audioContext.createMediaElementSource( audio );

            return source;

        },

        createModuleDiv           : function ( $moduleEl, module, audioNode ) {

            var template    = '<span class="nm-label"></span>';
            var $span   = $( template );

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

        resetModuleSettings       : function ( $moduleEl, module, audioNode ) {

            var audio = module.options.radioAudioElement.get( 0 );

            if (!audio) {
                return;
            };

            audio.pause( );
            audio.removeAttribute( "src" );
            audio.load( );

        },


        /* Private Methods */
        _getRadioAudioElement     : function ( module ) {

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

} )( window, navigator, jQuery );
