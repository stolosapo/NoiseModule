( function( window, navigator, $, undefined ) {

    /* StereoPannerModuleNode: Class for 'stereopannernode' node */

    $.StereoPannerModuleNodeFactory             = function () {
    };

    $.StereoPannerModuleNodeFactory.prototype   = {

        typeName    : "stereopannernode",

        create      : function ( noiseModule ) {

            return new $.StereoPannerModuleNode( noiseModule );
        }
    };

    $.StereoPannerModuleNode           = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.StereoPannerModuleNode.defaults  = {

        stereoPannerPan : 0
    };

    $.StereoPannerModuleNode.prototype = {

        defaultOptions        : function ( ) {
            return $.StereoPannerModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            var node = this.nm.audioContext.createStereoPanner ( );

            node.pan.value = module.options.stereoPannerPan;

            return node;

        },

        createModuleDiv       : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );
            let $panDiv     = this.nm.ui.createSimpleSliderControl( audioNode, 'pan', -1, 1, 0.01, "" );

            this.nm.ui.appendElementToTarget( $panDiv, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'pan', module.options.stereoPannerPan );
        }

    };

} )( window, navigator, jQuery );
