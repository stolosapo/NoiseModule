( function( window, navigator, $, undefined ) {

    /**
	 * SoundCloudModuleNode: Class for 'soundcloudnode' node
	 */
	$.SoundCloudModuleNode             = function ( noiseModule ) {

		this.nm = noiseModule;

	};

    $.SoundCloudModuleNode.defaults    = {

        soundCloudClientId	: '8n0A1crHP5gI2tR3j3uSHGDWOMMM9xyo',
		soundCloudTrackUrl	: '',
		soundCloudAudio		: undefined
    };

	$.SoundCloudModuleNode.prototype   = {

        defaultOptions            : function ( ) {
            return $.SoundCloudModuleNode.defaults;
        },

		createModuleAudioNode     : function ( module ) {

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

		createModuleDiv           : function ( $moduleEl, module, audioNode ) {

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

		resetModuleSettings       : function ( $moduleEl, module, audioNode ) {

			var audio	= module.options.soundCloudAudio;
			var $img	= $moduleEl.find( '.nm-play-button' );

			audio.pause( );

			$img.removeClass( 'pause' );
			$img.addClass( 'play' );

			audio.load( );

		},


		/* Private Methods */
		_soundCloudPlayPauseEvent : function ( self, $moduleEl, module, audioNode, playPause ) {

			var audio 		= module.options.soundCloudAudio;

			if (audio.paused) {
				audio.play( );
			}
			else {
				audio.pause( );
			};

		},
	};

} )( window, navigator, jQuery );
