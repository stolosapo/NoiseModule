( function( window, navigator, $, undefined ) {

    /* AnalyserModuleNode: Class for 'analyser' node */

    $.AnalyserModuleNodeFactory             = function () {
    };

    $.AnalyserModuleNodeFactory.prototype   = {

        typeName    : "analyser",

        create      : function ( noiseModule ) {

            return new $.AnalyserModuleNode( noiseModule );
        }
    };

    $.AnalyserModuleNode           = function ( noiseModule ) {

        this.nm = noiseModule;

    };

    $.AnalyserModuleNode.defaults  = {

        analyserFftSize     : 2048,
        analyserMainBgColor : 200,
        analyserBarBgColor  : 50,
        analyserSineBgColor : 0
    };

    $.AnalyserModuleNode.prototype = {

        defaultOptions                : function ( ) {
            return $.AnalyserModuleNode.defaults;
        },

        createModuleAudioNode         : function ( module ) {

            var analyser        = this.nm.audioContext.createAnalyser ( );

            analyser.fftSize    = module.options.analyserFftSize;

            var bufferLength    = analyser.frequencyBinCount;
            var dataArray       = new Uint8Array ( bufferLength );

            analyser.getByteTimeDomainData ( dataArray );

            return analyser;

        },

        createModuleDiv               : function ( $moduleEl, module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let template    = '<canvas class="nm-analyser-canvas"></canvas>';
            let $canvas     = $( template );
            let canvasCtx   = $canvas[0].getContext("2d");

            // $canvas.appendTo( $moduleEl );

            if (module.type === 'sinewave') {

                this._createSinewaveAnalyser( module, $canvas, canvasCtx, audioNode );
            }
            else if (module.type === 'frequencybars') {

                this._createFequencyBarsAnalyser( module, $canvas, canvasCtx, audioNode );
            }
            else {

                this._createSinewaveAnalyser( module, $canvas, canvasCtx, audioNode );
            }

            this.nm.ui.appendElementToTarget( $canvas, $container );

            return $container;
        },

        resetModuleSettings           : function ( $moduleEl, module, audioNode ) {

        },

        _createSinewaveAnalyser       : function ( module, $canvas, canvasCtx, audioNode ) {

            var WIDTH       = $canvas[ 0 ].width;
            var HEIGHT      = $canvas[ 0 ].height;

            var mainBg      = module.options.analyserMainBgColor;
            var sineBg      = module.options.analyserSineBgColor;

            audioNode.fftSize   = 2048;
            var bufferLength    = audioNode.fftSize;

            var dataArray       = new Uint8Array( bufferLength );

            canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

            function draw( ) {

                drawVisual      = requestAnimationFrame( draw );

                audioNode.getByteTimeDomainData( dataArray );

                canvasCtx.fillStyle     = 'rgb(' + mainBg + ', ' + mainBg + ', ' + mainBg + ')';
                canvasCtx.fillRect( 0, 0, WIDTH, HEIGHT );

                canvasCtx.lineWidth     = 2;
                canvasCtx.strokeStyle   = 'rgb(' + sineBg + ', ' + sineBg + ', ' + sineBg + ')';

                canvasCtx.beginPath();

                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;

                for ( var i = 0; i < bufferLength; i++ ) {

                    var v = dataArray[ i ] / 128.0;
                    var y = v * HEIGHT / 2;

                    if ( i === 0 ) {
                        canvasCtx.moveTo( x, y );
                    } else {
                        canvasCtx.lineTo( x, y );
                    }

                    x += sliceWidth;

                }

                canvasCtx.lineTo( WIDTH, HEIGHT / 2);
                canvasCtx.stroke( );
            };

            draw( );

        },

        _createFequencyBarsAnalyser   : function ( module, $canvas, canvasCtx, audioNode ) {

            var WIDTH       = $canvas[ 0 ].width;
            var HEIGHT      = $canvas[ 0 ].height;

            var mainBg      = module.options.analyserMainBgColor;
            var barBg       = module.options.analyserBarBgColor;

            audioNode.fftSize   = 256;

            var bufferLength    = audioNode.frequencyBinCount;
            var dataArray       = new Uint8Array( bufferLength );

            canvasCtx.clearRect( 0, 0, WIDTH, HEIGHT );

            function draw( ) {

                drawVisual  = requestAnimationFrame( draw );

                audioNode.getByteFrequencyData( dataArray );

                canvasCtx.fillStyle = 'rgb(' + mainBg + ', ' + mainBg + ', ' + mainBg + ')';
                canvasCtx.fillRect( 0, 0, WIDTH, HEIGHT );

                var barWidth = ( WIDTH / bufferLength ) * 2.5;
                var barHeight;
                var x = 0;

                for(var i = 0; i < bufferLength; i++) {

                    barHeight = dataArray[ i ];

                    canvasCtx.fillStyle = 'rgb(' + ( barHeight + 100 ) + ', ' + barBg + ', ' + barBg + ')';
                    canvasCtx.fillRect( x, HEIGHT - barHeight / 2, barWidth, barHeight / 2 );

                    x += barWidth + 1;
                }

            }

            draw( );

        },

    };

} )( window, navigator, jQuery );
