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

            let node = this.nm.audioContext.createConvolver( );

            console.log(node);

            return node;

        },

        createModuleDiv       : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let spanTemplate    = '<span class="nm-label info link"></span>'
            let $normSpan       = $( spanTemplate );

            $normSpan.text( 'normalize: ' + audioNode.normalize );

            $normSpan[0].addEventListener( 'click', function( e ) {

                audioNode.normalize = !audioNode.normalize;

                $normSpan.text( 'normalize: ' + audioNode.normalize );

            } );

            this.nm.ui.appendElementToTarget( $normSpan, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

        },

        exportOptions         : function ( ) {

            let options     = this._self.module.options;
            let settings    = this.nm.buildModuleOptions( options );

            return settings;
        },

    };

} )( window, navigator, jQuery );
