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

    let nodeRegistrationConfig_new = function () {
        return function ( noiseModuleObject ) {

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

            config[ gainFactory.typeName ] = gainFactory.create( noiseModuleObject );
            config[ filterFactory.typeName ] = filterFactory.create( noiseModuleObject );
            config[ eqFactory.typeName ] = eqFactory.create( noiseModuleObject );
            config[ kingFactory.typeName ] = kingFactory.create( noiseModuleObject );
            config[ noiseFactory.typeName ] = noiseFactory.create( noiseModuleObject );
            config[ moogFactory.typeName ] = moogFactory.create( noiseModuleObject );
            config[ oscFactory.typeName ] = oscFactory.create( noiseModuleObject );
            config[ liveFactory.typeName ] = liveFactory.create( noiseModuleObject );
            config[ radioFactory.typeName ] = radioFactory.create( noiseModuleObject );
            config[ soundCloudFactory.typeName ] = soundCloudFactory.create( noiseModuleObject );
            config[ delayFactory.typeName ] = delayFactory.create( noiseModuleObject );
            config[ convolverFactory.typeName ] = convolverFactory.create( noiseModuleObject );
            config[ compressorFactory.typeName ] = compressorFactory.create( noiseModuleObject );
            config[ pannerFactory.typeName ] = pannerFactory.create( noiseModuleObject );
            config[ shapperFactory.typeName ] = shapperFactory.create( noiseModuleObject );
            config[ waveFactory.typeName ] = waveFactory.create( noiseModuleObject );
            config[ analyserFactory.typeName ] = analyserFactory.create( noiseModuleObject );
            config[ recorderFactory.typeName ] = recorderFactory.create( noiseModuleObject );

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

                    let cccc = nodeRegistrationConfig_new();

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
