( function( window, navigator, $, undefined ) {

    /**
	 * RecorderModuleNode: Class for 'recorder' node
	 */
	$.RecorderModuleNode           = function ( noiseModule ) {

		this.nm = noiseModule;

	};

    $.RecorderModuleNode.defaults     = {

        recorderChunks		    : [ ],
		recorderStopCallback	: undefined,
		recorderMediaRecorder	: undefined,
		recorderMediaRecordings	: [ ]
    };

	$.RecorderModuleNode.prototype = {

        defaultOptions                : function ( ) {
            return $.RecorderModuleNode.defaults;
        },

		createModuleAudioNode         : function ( module ) {

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

		createModuleDiv               : function ( $moduleEl, module, audioNode ) {

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

		resetModuleSettings           : function ( $moduleEl, module, audioNode ) {

		},

		_recorderPlayPauseClickEvent  : function ( self, $moduleEl, module, audioNode, playPause ) {

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

		_recorderStopClickEvent       : function ( self, $moduleEl, module, audioNode ) {

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

} )( window, navigator, jQuery );
