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

        defaultOptions        : function ( ) {
            return $.GainModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            return this.createGain( module );
        },

        createModuleDiv       : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );
            let $gain       = this.nm.ui.createSimpleSliderControl( audioNode, "gain", 0, 1, 0.01, "" );

            this.nm.ui.appendElementToTarget( $gain, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

            this.nm.ui.resetSliderSetting( this.$div, audioNode, "gain", module.options.gainGain );
        },

        exportOptions         : function ( ) {

            let settings = this.nm.buildModuleSettings( );

            settings.gainGain = this._self.outNode.gain.value;

            return settings;
        },

        createGain            : function ( module, value ) {

            var gain = this.nm.audioContext.createGain ();

            gain.gain.value = value || module.options.gainGain;

            return gain;
        }
    };

} )( window, navigator, jQuery );
