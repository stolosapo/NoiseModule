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

        nodeTypeName          : "dynamicscompressor",

        defaultOptions        : function ( ) {
            return $.DynamicsCompressorModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {

            var node = this.nm.audioContext.createDynamicsCompressor ();

            node.threshold.value = module.options.compressorThreshold;
            node.knee.value = module.options.compressorKnee;
            node.ratio.value = module.options.compressorRatio;
            node.reduction.value = module.options.compressorReduction;
            node.attack.value = module.options.compressorAttack;
            node.release.value = module.options.compressorRelease;

            return node;

        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            var $thresholdDiv   = this.nm._createSimpleSliderControl( audioNode, 'threshold', -36, 0, 0.01, "DB" );
            var $kneeDiv        = this.nm._createSimpleSliderControl( audioNode, 'knee', 0, 40, 0.01, "DB" );
            var $ratioDiv       = this.nm._createSimpleSliderControl( audioNode, 'ratio', 1, 50, 0.1, "Sec" );
            var $reductionDiv   = this.nm._createSimpleSliderControl( audioNode, 'reduction', -20, 0, 0.01, "DB" );
            var $attackDiv      = this.nm._createSimpleSliderControl( audioNode, 'attack', 0, 1, 0.001, "Sec" );
            var $releaseDiv     = this.nm._createSimpleSliderControl( audioNode, 'release', 0, 2, 0.01, "Sec" );

            $thresholdDiv.appendTo( $moduleEl );
            $kneeDiv.appendTo( $moduleEl );
            $ratioDiv.appendTo( $moduleEl );
            $reductionDiv.appendTo( $moduleEl );
            $attackDiv.appendTo( $moduleEl );
            $releaseDiv.appendTo( $moduleEl );

        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            this.nm._resetSliderSetting( $moduleEl, audioNode, 'threshold', module.options.compressorThreshold );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'knee', module.options.compressorKnee );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'ratio', module.options.compressorRatio );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'reduction', module.options.compressorReduction );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'attack', module.options.compressorAttack );
            this.nm._resetSliderSetting( $moduleEl, audioNode, 'release', module.options.compressorRelease );

        },

    };

} )( window, navigator, jQuery );
