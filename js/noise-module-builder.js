( function( window, navigator, $, undefined ) {

    let nodeRegistrationConfig = function () {
        return function ( noiseModuleObject ) {

            let gainModuleNode = new $.GainModuleNode( noiseModuleObject );
            let biquadfilterModuleNode = new $.BiquadFilterModuleNode( noiseModuleObject );
            let equalizerModuleNode = new $.EqualizerModuleNode( noiseModuleObject, gainModuleNode, biquadfilterModuleNode );
            let kingTubbyModuleNode = new $.KingTubbyModuleNode( noiseModuleObject, gainModuleNode )

            return [
                new $.NoiseModuleNode( noiseModuleObject ),
                new $.MoogFilterModuleNode( noiseModuleObject ),
                new $.OscilatorModuleNode( noiseModuleObject ),
                new $.LiveInputModuleNode( noiseModuleObject ),
                new $.RadioModuleNode( noiseModuleObject ),
                new $.SoundCloudModuleNode( noiseModuleObject ),
                biquadfilterModuleNode,
                equalizerModuleNode,
                new $.DelayModuleNode( noiseModuleObject ),
                kingTubbyModuleNode,
                new $.ConvolverModuleNode( noiseModuleObject ),
                new $.DynamicsCompressorModuleNode( noiseModuleObject ),
                gainModuleNode,
                new $.StereoPannerModuleNode( noiseModuleObject ),
                new $.WaveShaperModuleNode( noiseModuleObject ),
                new $.PeriodWaveModuleNode( noiseModuleObject ),
                new $.AnalyserModuleNode( noiseModuleObject ),
                new $.RecorderModuleNode( noiseModuleObject )
            ];
        };
    };

    /* Noise Module Factory */
    $.fn.noiseModule    = function ( options, useUI ) {

        if ( typeof options === 'string' ) {

            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function() {

                var instance = $.data( this, 'noiseModule' );

                if ( !instance ) {

                    window.console.error( "cannot call methods on noiseModule prior to initialization; " +
                    "attempted to call method '" + options + "'" );
                    return;

                }

                if ( !$.isFunction( instance[ options ] ) || options.charAt(0) === "_" ) {

                    window.console.error( "no such method '" + options + "' for noiseModule instance" );
                    return;

                }

                instance[ options ].apply( instance, args );

            });

            return this;

        }
        else {

            var instance;

            this.each(function() {

                instance = $.data( this, 'noiseModule' );

                if ( !instance ) {

                    options._nodeRegistrationConfig = nodeRegistrationConfig();

                    instance = new $.NoiseModule( options, this );

                    if ( useUI ) {
                        let instanceUI = new $.NoiseModuleUI( instance, options, this );
                    }

                    $.data( this, 'noiseModule', instance );
                }

            });

            return instance;

        }

    };

} )( window, navigator, jQuery );
