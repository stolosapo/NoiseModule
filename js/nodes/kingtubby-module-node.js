( function( window, navigator, $, undefined ) {

    /* KingTubbyModuleNode: Class for 'kingtubbynode' node */

    $.KingTubbyModuleNodeFactory             = function ( gainModuleFactory ) {

        this.gainModuleFactory = gainModuleFactory;
    };

    $.KingTubbyModuleNodeFactory.prototype   = {

        typeName    : "kingtubbynode",

        create      : function ( noiseModule ) {

            let gainModuleNode = this.gainModuleFactory.create( noiseModule );

            return new $.KingTubbyModuleNode( noiseModule, gainModuleNode );
        }
    };

    $.KingTubbyModuleNode              = function ( noiseModule, gainModuleNode ) {

        this.nm = noiseModule;
        this.gainNode = gainModuleNode;
    };

    $.KingTubbyModuleNode.defaults     = {

        kingTubbyPreAmpInGain     : 1,
        kingTubbyPreAmpOutGain    : 1,
        kingTubbyDelayTime        : 0.5,
        kingTubbyGain             : 0.8,
        kingTubbyCutOffFreq       : 1000
    };

    $.KingTubbyModuleNode.prototype    = {

        defaultOptions        : function ( ) {
            return $.KingTubbyModuleNode.defaults;
        },

        createModuleAudioNode : function ( module ) {


            let preAmp       = this.gainNode.createGain( module, module.options.kingTubbyPreAmpInGain );
            let outputGain   = this.gainNode.createGain( module, module.options.kingTubbyPreAmpOutGain );

            let delay        = this.nm.audioContext.createDelay( );
            delay.delayTime.value    = module.options.kingTubbyDelayTime;

            let feedback     = this.gainNode.createGain( module, module.options.kingTubbyGain );
            let filter       = this.nm.audioContext.createBiquadFilter( );
            filter.frequency.value  = module.options.kingTubbyCutOffFreq;

            let nodes = [ ];
            nodes.push( preAmp );
            nodes.push( delay );
            nodes.push( feedback );
            nodes.push( filter );
            nodes.push( outputGain );

            this.nm.connectNodes( delay, feedback );
            this.nm.connectNodes( feedback, filter );
            this.nm.connectNodes( filter, delay );

            this.nm.connectNodes( preAmp, delay );
            this.nm.connectNodes( preAmp, outputGain );
            this.nm.connectNodes( delay, outputGain );

            return { inNode: preAmp, outNode: outputGain, allNodes: nodes };
        },

        createModuleDiv       : function ( $moduleEl, module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let delay       = audioNode.allNodes[ 1 ]
            let feedback    = audioNode.allNodes[ 2 ];
            let filter      = audioNode.allNodes[ 3 ];

            let $inGainDiv  = this.nm._createSliderControl( audioNode.inNode, 'gain', 'preAmp In', 0, 2, 0.1, '' );
            $inGainDiv.addClass( 'pre-amp' );
            $inGainDiv.addClass( 'in' );

            let $outGainDiv = this.nm._createSliderControl( audioNode.outNode, 'gain', 'preAmp Out', 0, 2, 0.1, '' );
            $outGainDiv.addClass( 'pre-amp' );
            $outGainDiv.addClass( 'out' );

            let $delayDiv       = this.nm._createSliderControl( delay, 'delayTime', 'delay', 0, 10, 0.01, "Sec" );
            $delayDiv.addClass( 'delay' );

            let $feedbackDiv    = this.nm._createSliderControl( feedback, 'gain', 'feedback', 0, 1, 0.01, "" );
            $feedbackDiv.addClass( 'feedback' );

            let $freqDiv        = this.nm._createSliderControl( filter, 'frequency', 'cutoff', 0, 8000, 1, "Hz" );
            $freqDiv.addClass( 'biquadfilter' );

            this.nm.ui.appendElementToTarget( $inGainDiv, $container );
            this.nm.ui.appendElementToTarget( $delayDiv, $container );
            this.nm.ui.appendElementToTarget( $feedbackDiv, $container );
            this.nm.ui.appendElementToTarget( $freqDiv, $container );

            return $outGainDiv;
        },

        resetModuleSettings   : function ( $moduleEl, module, audioNode ) {

            let delay       = audioNode.allNodes[ 1 ]
            let feedback    = audioNode.allNodes[ 2 ];
            let filter      = audioNode.allNodes[ 3 ];

            let inClasses   = [ 'gain', 'pre-amp', 'in' ];
            let outClasses  = [ 'gain', 'pre-amp', 'out' ];

            this.nm._resetSliderSettingByClasses( this.$div, audioNode.inNode, 'gain', inClasses, module.options.kingTubbyPreAmpInGain );
            this.nm._resetSliderSettingByClasses( this.$div, audioNode.outNode, 'gain', outClasses, module.options.kingTubbyPreAmpOutGain );

            this.nm._resetSliderSettingByClasses( this.$div, delay, 'delayTime', [ 'delayTime', 'delay' ], module.options.kingTubbyDelayTime );
            this.nm._resetSliderSettingByClasses( this.$div, feedback, 'gain', [ 'gain', 'feedback' ], module.options.kingTubbyGain );
            this.nm._resetSliderSettingByClasses( this.$div, filter, 'frequency', [ 'frequency', 'biquadfilter' ], module.options.kingTubbyCutOffFreq );

        },

    };

} )( window, navigator, jQuery );
