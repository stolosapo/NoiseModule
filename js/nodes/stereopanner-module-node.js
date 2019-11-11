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

        nodeTypeName          : "stereopannernode",

        defaultOptions        : function ( ) {
            return $.StereoPannerModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            var node = this.nm.audioContext.createStereoPanner ( );

            node.pan.value = module.options.stereoPannerPan;

            return node;

        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            var $panDiv = this.nm._createSimpleSliderControl( audioNode, 'pan', -1, 1, 0.01, "" );

            $panDiv.appendTo( $moduleEl );

        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            this.nm._resetSliderSetting( $moduleEl, audioNode, 'pan', module.options.stereoPannerPan );

        }

    };

} )( window, navigator, jQuery );
