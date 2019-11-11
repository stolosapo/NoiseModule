( function( window, navigator, $, undefined ) {

    /* DelayModuleNode: Class for 'delay' node */

    $.DelayModuleNodeFactory             = function () {
    };

    $.DelayModuleNodeFactory.prototype   = {

        typeName    : "delay",

        create      : function ( noiseModule ) {

            return new $.DelayModuleNode( noiseModule );
        }
    };

    $.DelayModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;

    };

    $.DelayModuleNode.defaults     = {

        delayTime   : 0.2
    };

    $.DelayModuleNode.prototype    = {

        defaultOptions        : function ( ) {
            return $.DelayModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            let node = this.nm.audioContext.createDelay ();

            node.delayTime.value = module.options.delayTime;

            return node;

        },

        createModuleDiv       : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );
            let $timeDiv    = this.nm.ui.createSimpleSliderControl( audioNode, 'delayTime', 0, 10, 0.01, "Sec" );

            this.nm.ui.appendElementToTarget( $timeDiv, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'delayTime', module.options.delayTime );

        },

    };

} )( window, navigator, jQuery );
