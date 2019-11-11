( function( window, navigator, $, undefined ) {

    /* ConvolverModuleNode: Class for 'convolver' node */

    $.ConvolverModuleNodeFactory             = function () {
    };

    $.ConvolverModuleNodeFactory.prototype   = {

        typeName    : "convolver",

        create      : function ( noiseModule ) {

            return new $.ConvolverModuleNode( noiseModule );
        }
    };

    $.ConvolverModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;

    };

    $.ConvolverModuleNode.defaults     = {
    };

    $.ConvolverModuleNode.prototype    = {

        defaultOptions        : function ( ) {
            return $.ConvolverModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            var node = this.nm.audioContext.createConvolver( );

            console.log(node);

            return node;

        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            var spanTemplate    = '<span class="nm-label info link"></span>'
            var $normSpan       = $( spanTemplate );

            $normSpan.text( 'normalize: ' + audioNode.normalize );

            $normSpan[0].addEventListener( 'click', function( e ) {

                audioNode.normalize = !audioNode.normalize;

                $normSpan.text( 'normalize: ' + audioNode.normalize );

            } );

            $normSpan.appendTo( $moduleEl );

        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

        }

    };

} )( window, navigator, jQuery );
