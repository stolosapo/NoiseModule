( function( window, navigator, $, undefined ) {

    let nodeRegistrationConfig = function () {
        return function ( noiseModuleObject ) {
            return [
                { nodeType: "noise", nodeImpl: new $.NoiseModuleNode( noiseModuleObject ) },
    			{ nodeType: "moogfilter", nodeImpl: new $.MoogFilterModuleNode( noiseModuleObject ) },
    			{ nodeType: "oscillator", nodeImpl: new $.OscilatorModuleNode( noiseModuleObject ) },
    			{ nodeType: "liveinput", nodeImpl: new $.LiveInputModuleNode( noiseModuleObject ) },
    			{ nodeType: "radionode", nodeImpl: new $.RadioModuleNode( noiseModuleObject ) },
    			{ nodeType: "soundcloudnode", nodeImpl: new $.SoundCloudModuleNode( noiseModuleObject ) },
    			{ nodeType: "biquadfilter", nodeImpl: new $.BiquadFilterModuleNode( noiseModuleObject ) },
    			{ nodeType: "equalizer", nodeImpl: new $.EqualizerModuleNode( noiseModuleObject ) },
    			{ nodeType: "delay", nodeImpl: new $.DelayModuleNode( noiseModuleObject ) },
    			{ nodeType: "kingtubbynode", nodeImpl: new $.KingTubbyModuleNode( noiseModuleObject ) },
    			{ nodeType: "convolver", nodeImpl: new $.ConvolverModuleNode( noiseModuleObject ) },
    			{ nodeType: "dynamicscompressor", nodeImpl: new $.DynamicsCompressorModuleNode( noiseModuleObject ) },
    			{ nodeType: "gain", nodeImpl: new $.GainModuleNode( noiseModuleObject ) },
    			{ nodeType: "stereopannernode", nodeImpl: new $.StereoPannerModuleNode( noiseModuleObject ) },
    			{ nodeType: "waveshapernode", nodeImpl: new $.WaveShaperModuleNode( noiseModuleObject ) },
    			{ nodeType: "periodicwave", nodeImpl: new $.PeriodWaveModuleNode( noiseModuleObject ) },
    			{ nodeType: "analyser", nodeImpl: new $.AnalyserModuleNode( noiseModuleObject ) },
    			{ nodeType: "recorder", nodeImpl: new $.RecorderModuleNode( noiseModuleObject ) }
            ];
        };
    };

    /* Noise Module Factory */
	$.fn.noiseModule	= function ( options ) {

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

					$.data( this, 'noiseModule', instance );
				}

			});

			return instance;

		}

	};

} )( window, navigator, jQuery );
