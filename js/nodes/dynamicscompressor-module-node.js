( function( window, navigator, $, undefined ) {

    /* DynamicsCompressorModuleNode: Class for 'dynamicscompressor' node */

    $.DynamicsCompressorModuleNodeFactory             = function () {
    };

    $.DynamicsCompressorModuleNodeFactory.prototype   = {

        typeName    : "dynamicscompressor",

        create      : function ( noiseModule ) {

            return new $.DynamicsCompressorModuleNode( noiseModule );
        }
    };

    $.DynamicsCompressorModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;

    };

    $.DynamicsCompressorModuleNode.defaults     = {

        compressorThreshold : -25,
        compressorKnee      : 30,
        compressorRatio     : 12,
        compressorReduction : -20,
        compressorAttack    : 0.003,
        compressorRelease   : 0.25
    };

    $.DynamicsCompressorModuleNode.prototype    = {

        defaultOptions        : function ( ) {
            return $.DynamicsCompressorModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            let node = this.nm.audioContext.createDynamicsCompressor ();

            node.threshold.value = module.options.compressorThreshold;
            node.knee.value = module.options.compressorKnee;
            node.ratio.value = module.options.compressorRatio;
            node.reduction.value = module.options.compressorReduction;
            node.attack.value = module.options.compressorAttack;
            node.release.value = module.options.compressorRelease;

            return node;

        },

        createModuleDiv       : function ( module, audioNode ) {

            let $container      = this.nm.ui.createContentContainer( );
            let $thresholdDiv   = this.nm.ui.createSimpleSliderControl( audioNode, 'threshold', -36, 0, 0.01, "DB" );
            let $kneeDiv        = this.nm.ui.createSimpleSliderControl( audioNode, 'knee', 0, 40, 0.01, "DB" );
            let $ratioDiv       = this.nm.ui.createSimpleSliderControl( audioNode, 'ratio', 1, 50, 0.1, "Sec" );
            let $reductionDiv   = this.nm.ui.createSimpleSliderControl( audioNode, 'reduction', -20, 0, 0.01, "DB" );
            let $attackDiv      = this.nm.ui.createSimpleSliderControl( audioNode, 'attack', 0, 1, 0.001, "Sec" );
            let $releaseDiv     = this.nm.ui.createSimpleSliderControl( audioNode, 'release', 0, 2, 0.01, "Sec" );

            this.nm.ui.appendElementToTarget( $thresholdDiv, $container );
            this.nm.ui.appendElementToTarget( $kneeDiv, $container );
            this.nm.ui.appendElementToTarget( $ratioDiv, $container );
            this.nm.ui.appendElementToTarget( $reductionDiv, $container );
            this.nm.ui.appendElementToTarget( $attackDiv, $container );
            this.nm.ui.appendElementToTarget( $releaseDiv, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'threshold', module.options.compressorThreshold );
            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'knee', module.options.compressorKnee );
            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'ratio', module.options.compressorRatio );
            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'reduction', module.options.compressorReduction );
            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'attack', module.options.compressorAttack );
            this.nm.ui.resetSliderSetting( this.$div, audioNode, 'release', module.options.compressorRelease );

        },

    };

} )( window, navigator, jQuery );
