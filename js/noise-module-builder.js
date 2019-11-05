( function( window, navigator, $, undefined ) {

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

					instance = new $.NoiseModule( options, this );

					$.data( this, 'noiseModule', instance );
				}

			});

			return instance;

		}

	};

} )( window, navigator, jQuery );
