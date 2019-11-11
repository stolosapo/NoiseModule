( function( window, navigator, $, undefined ) {

    /* RecorderModuleNode: Class for 'recorder' node */

    $.RecorderModuleNodeFactory             = function () {
    };

    $.RecorderModuleNodeFactory.prototype   = {

        typeName    : "recorder",

        create      : function ( noiseModule ) {

            return new $.RecorderModuleNode( noiseModule );
        }
    };

    $.RecorderModuleNode           = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.RecorderModuleNode.defaults     = {

        recorderChunks          : [ ],
        recorderStopCallback    : undefined,
        recorderMediaRecorder   : undefined,
        recorderMediaRecordings : [ ]
    };

    $.RecorderModuleNode.prototype = {

        defaultOptions                : function ( ) {
            return $.RecorderModuleNode.defaults;
        },

        createModuleAudioNode         : function ( module ) {

            let recorder        = this.nm.audioContext.createMediaStreamDestination( );

            let mediaRecorder   = new MediaRecorder( recorder.stream );
            mediaRecorder.ignoreMutedMedia = true;

            module.options.recorderMediaRecorder = mediaRecorder;


            // push each chunk (blobs) in an array
            mediaRecorder.ondataavailable   = function( e ) {

                module.options.recorderChunks.push( e.data );
            };


            // Make blob out of our blobs, and open it.
            mediaRecorder.onstop        = function( e ) {

                let blob = new Blob(module.options.recorderChunks, { 'type' : 'audio/ogg; codecs=opus' });

                let audioURL = window.URL.createObjectURL(blob);

                module.options.recorderMediaRecordings.push( audioURL );

                if (module.options.recorderStopCallback != undefined) {

                    module.options.recorderStopCallback( module );
                };
            };

            return recorder;

        },

        createModuleDiv               : function ( module, audioNode ) {

            let $container      = this.nm.ui.createContentContainer( );

            let stopImgClass    = [ 'stop' ];
            let spanTemp        = '<span class="nm-label info"></span>';
            let $span           = $( spanTemp );

            let listTemp        = '<ul class="nm-label nm-list"></ul>';
            let $list           = $( listTemp );

            $span.text( 'Status:' );

            let $play = this.nm.ui.createPlayPauseButton( module, audioNode, this._recorderPlayPauseClickEvent );
            let $stop = this.nm.ui.createCustomButton( module, audioNode, stopImgClass, this._recorderStopClickEvent );

            module.options.recorderStopCallback = function( module ) {

                $list.empty( );

                module.options.recorderMediaRecordings.forEach( (rec, index) => {

                    let $a = $( '<a>' );
                    $a.attr( 'href', rec );
                    $a.attr( 'target', '_blank' );
                    $a.text( 'track ' + (index + 1) );

                    $list.append( $('<li>').append( $a ) );
                } );
            };

            this.nm.ui.appendElementToTarget( $play, $container );
            this.nm.ui.appendElementToTarget( $stop, $container );
            this.nm.ui.appendElementToTarget( $span, $container );
            this.nm.ui.appendElementToTarget( $list, $container );

            return $container;
        },

        resetModuleSettings           : function ( module, audioNode ) {

        },

        _recorderPlayPauseClickEvent  : function ( self, $moduleEl, module, audioNode, playPause ) {

            let mediaRecorder   = module.options.recorderMediaRecorder;
            let $span       = $( $moduleEl ).find( '.nm-label.info' );


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

            let pauseClass      = 'pause';
            let playClass       = 'play';

            let mediaRecorder   = module.options.recorderMediaRecorder;
            let $span       = $moduleEl.find( '.nm-label.info' );
            let $img        = $moduleEl.find( '.nm-play-button.pause' );

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
