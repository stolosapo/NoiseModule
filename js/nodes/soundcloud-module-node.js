( function( window, navigator, $, undefined ) {

    /* SoundCloudModuleNode: Class for 'soundcloudnode' node */

    $.SoundCloudModuleNodeFactory             = function () {
    };

    $.SoundCloudModuleNodeFactory.prototype   = {

        typeName    : "soundcloudnode",

        create      : function ( noiseModule ) {

            return new $.SoundCloudModuleNode( noiseModule );
        }
    };

    $.SoundCloudModuleNode             = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.SoundCloudModuleNode.defaults    = {

        soundCloudClientId  : '8n0A1crHP5gI2tR3j3uSHGDWOMMM9xyo',
        soundCloudTrackUrl  : '',
        soundCloudAudio     : undefined
    };

    $.SoundCloudModuleNode.prototype   = {

        defaultOptions            : function ( ) {
            return $.SoundCloudModuleNode.defaults;
        },

        createModuleAudioNode     : function ( module ) {

            let _self       = this;

            let source;

            let baseUrl     = 'https://api.soundcloud.com/resolve.json?url=';
            let clientParameter     = 'client_id=' + module.options.soundCloudClientId;
            let url         = baseUrl + module.options.soundCloudTrackUrl + '&' + clientParameter;

            let audio       = new Audio( );
            audio.crossOrigin   = "anonymous";

            module.options.soundCloudAudio = audio;

            this.nm._requestGET( url, function ( response ) {

                let trackInfo   = JSON.parse( response );
                let streamUrl   = trackInfo.stream_url + "?" + clientParameter;

                audio.src   = streamUrl;

                source      = _self.nm.audioContext.createMediaElementSource( audio );

                /* Update source node map with this new instance */
                _self.nm._updateAudioNode( module.name, source );

                let $divEl  = _self.nm._findModuleDivByName( module );
                let $content    = $( $divEl ).find( '.nm-content' );

                _self.nm._appendModuleFooter( $( $divEl ), $content, module, source );
                _self.nm._connectAllDestinations( module );

                /* If module option is started then do the connection */
                if (module.options.started) {
                    audio.play( );
                }
            } );

        },

        createModuleDiv           : function ( $moduleEl, module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let template    = '<span class="nm-label"></span>';
            let $span       = $( template );

            let audio       = module.options.soundCloudAudio;

            if (!audio) {
                $span.text( 'Could not connect...' );
                this.nm.ui.appendElementToTarget( $span, $container );
                return $container;
            };

            let $audioEl    = $( audio );

            $audioEl.on( 'playing', function( e ) { $span.text( 'Playing' ); } );
            $audioEl.on( 'pause', function( e ) { $span.text( 'Paused' ); } );
            $audioEl.on( 'play', function( e ) { $span.text( 'Play' ); } );
            $audioEl.on( 'ended', function( e ) { $span.text( 'Ended' ); } );
            $audioEl.on( 'seeking', function( e ) { $span.text( 'Seeking' ); } );
            $audioEl.on( 'waiting', function( e ) { $span.text( 'Waiting' ); } );

            let $play = this.nm.ui.createPlayPauseButton( $moduleEl, module, audioNode, this._soundCloudPlayPauseEvent );

            this.nm.ui.appendElementToTarget( $span, $container );
            this.nm.ui.appendElementToTarget( $play, $container );

            return $container;
        },

        resetModuleSettings       : function ( $moduleEl, module, audioNode ) {

            let audio   = module.options.soundCloudAudio;
            let $img    = $moduleEl.find( '.nm-play-button' );

            audio.pause( );

            $img.removeClass( 'pause' );
            $img.addClass( 'play' );

            audio.load( );
        },


        /* Private Methods */
        _soundCloudPlayPauseEvent : function ( self, $moduleEl, module, audioNode, playPause ) {

            let audio       = module.options.soundCloudAudio;

            if (audio.paused) {
                audio.play( );
            }
            else {
                audio.pause( );
            };

        },
    };

} )( window, navigator, jQuery );
