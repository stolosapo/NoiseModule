( function( window, navigator, $, undefined ) {

    let nodeRegistrationConfig_old = function () {
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

    let nodeRegistrationConfig = function () {
        return function ( ) {

            let gainFactory = new $.GainModuleNodeFactory( );
            let filterFactory = new $.BiquadFilterModuleNodeFactory( );
            let eqFactory = new $.EqualizerModuleNodeFactory( gainFactory, filterFactory );
            let kingFactory = new $.KingTubbyModuleNodeFactory( gainFactory );
            let noiseFactory = new $.NoiseModuleNodeFactory( );
            let moogFactory = new $.MoogFilterModuleNodeFactory( );
            let oscFactory = new $.OscilatorModuleNodeFactory( );
            let liveFactory = new $.LiveInputModuleNodeFactory( );
            let radioFactory = new $.RadioModuleNodeFactory( );
            let soundCloudFactory = new $.SoundCloudModuleNodeFactory( );
            let delayFactory = new $.DelayModuleNodeFactory( );
            let convolverFactory = new $.ConvolverModuleNodeFactory( );
            let compressorFactory = new $.DynamicsCompressorModuleNodeFactory( );
            let pannerFactory = new $.StereoPannerModuleNodeFactory( );
            let shapperFactory = new $.WaveShaperModuleNodeFactory( );
            let waveFactory = new $.PeriodWaveModuleNodeFactory( );
            let analyserFactory = new $.AnalyserModuleNodeFactory( );
            let recorderFactory = new $.RecorderModuleNodeFactory( );

            let config = {};

            config[ gainFactory.typeName ] = gainFactory;
            config[ filterFactory.typeName ] = filterFactory;
            config[ eqFactory.typeName ] = eqFactory;
            config[ kingFactory.typeName ] = kingFactory;
            config[ noiseFactory.typeName ] = noiseFactory;
            config[ moogFactory.typeName ] = moogFactory;
            config[ oscFactory.typeName ] = oscFactory;
            config[ liveFactory.typeName ] = liveFactory;
            config[ radioFactory.typeName ] = radioFactory;
            config[ soundCloudFactory.typeName ] = soundCloudFactory;
            config[ delayFactory.typeName ] = delayFactory;
            config[ convolverFactory.typeName ] = convolverFactory;
            config[ compressorFactory.typeName ] = compressorFactory;
            config[ pannerFactory.typeName ] = pannerFactory;
            config[ shapperFactory.typeName ] = shapperFactory;
            config[ waveFactory.typeName ] = waveFactory;
            config[ analyserFactory.typeName ] = analyserFactory;
            config[ recorderFactory.typeName ] = recorderFactory;

            return config;
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
