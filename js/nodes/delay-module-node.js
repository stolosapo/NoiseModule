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

            var node = this.nm.audioContext.createDelay ();

            node.delayTime.value = module.options.delayTime;

            return node;

        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            var $timeDiv    = this.nm._createSimpleSliderControl( audioNode, 'delayTime', 0, 10, 0.01, "Sec" );

            $timeDiv.appendTo( $moduleEl );

        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            this.nm._resetSliderSetting( $moduleEl, audioNode, 'delayTime', module.options.delayTime );

        },

    };

} )( window, navigator, jQuery );
