( function( window, navigator, $, undefined ) {

    /* GainModuleNode: Class for 'gain' node */

    $.GainModuleNodeFactory             = function () {
    };

    $.GainModuleNodeFactory.prototype   = {

        typeName    : "gain",

        create      : function ( noiseModule ) {

            return new $.GainModuleNode( noiseModule );
        }
    };

    $.GainModuleNode           = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.GainModuleNode.defaults  = {

        gainGain    : 0.7

    };

    $.GainModuleNode.prototype = {

        nodeTypeName          : "gain",

        defaultOptions        : function ( ) {
            return $.GainModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            return this.createGain( module );
        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            var $gainDiv    = this.nm._createSimpleSliderControl( audioNode, this.nodeTypeName, 0, 1, 0.01, "" );

            $gainDiv.appendTo( $moduleEl );

            return $gainDiv;
        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            // this.nm._resetSliderSetting( $moduleEl, audioNode, 'gain', module.options.gainGain );
            this.nm._resetSliderSetting( this.$div, audioNode, this.nodeTypeName, module.options.gainGain );

        },

        createGain            : function ( module, value ) {

            var gain = this.nm.audioContext.createGain ();

            gain.gain.value = value || module.options.gainGain;

            return gain;
        }
    };

} )( window, navigator, jQuery );
