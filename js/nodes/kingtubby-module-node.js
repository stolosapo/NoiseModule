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
            delay._id        = 1;

            let feedback     = this.gainNode.createGain( module, module.options.kingTubbyGain );
            feedback._id     = 2;

            let filter       = this.nm.audioContext.createBiquadFilter( );
            filter.frequency.value  = module.options.kingTubbyCutOffFreq;
            filter._id       = 3;

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

        createModuleDiv       : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );

            let delay       = audioNode.allNodes[ 1 ]
            let feedback    = audioNode.allNodes[ 2 ];
            let filter      = audioNode.allNodes[ 3 ];

            let $inGainDiv  = this.nm.ui.createSliderControl( audioNode.inNode, 'gain', 'preAmp In', 0, 2, 0.1, '' );
            $inGainDiv.addClass( 'pre-amp' );
            $inGainDiv.addClass( 'in' );

            let $outGainDiv = this.nm.ui.createSliderControl( audioNode.outNode, 'gain', 'preAmp Out', 0, 2, 0.1, '' );
            $outGainDiv.addClass( 'pre-amp' );
            $outGainDiv.addClass( 'out' );

            let $delayDiv       = this.nm.ui.createSliderControl( delay, 'delayTime', 'delay', 0, 10, 0.01, "Sec" );
            $delayDiv.addClass( 'delay' );

            let $feedbackDiv    = this.nm.ui.createSliderControl( feedback, 'gain', 'feedback', 0, 1, 0.01, "" );
            $feedbackDiv.addClass( 'feedback' );

            let $freqDiv        = this.nm.ui.createSliderControl( filter, 'frequency', 'cutoff', 0, 8000, 1, "Hz" );
            $freqDiv.addClass( 'biquadfilter' );

            this.nm.ui.appendElementToTarget( $inGainDiv, $container );
            this.nm.ui.appendElementToTarget( $delayDiv, $container );
            this.nm.ui.appendElementToTarget( $feedbackDiv, $container );
            this.nm.ui.appendElementToTarget( $freqDiv, $container );
            this.nm.ui.appendElementToTarget( $outGainDiv, $container );

            return $container;
        },

        resetModuleSettings   : function ( module, audioNode ) {

            let delay       = audioNode.allNodes[ 1 ]
            let feedback    = audioNode.allNodes[ 2 ];
            let filter      = audioNode.allNodes[ 3 ];

            let inClasses   = [ 'gain', 'pre-amp', 'in' ];
            let outClasses  = [ 'gain', 'pre-amp', 'out' ];

            this.nm.ui.resetSliderSettingByClasses( this.$div, audioNode.inNode, 'gain', inClasses, module.options.kingTubbyPreAmpInGain );
            this.nm.ui.resetSliderSettingByClasses( this.$div, audioNode.outNode, 'gain', outClasses, module.options.kingTubbyPreAmpOutGain );

            this.nm.ui.resetSliderSettingByClasses( this.$div, delay, 'delayTime', [ 'delayTime', 'delay' ], module.options.kingTubbyDelayTime );
            this.nm.ui.resetSliderSettingByClasses( this.$div, feedback, 'gain', [ 'gain', 'feedback' ], module.options.kingTubbyGain );
            this.nm.ui.resetSliderSettingByClasses( this.$div, filter, 'frequency', [ 'frequency', 'biquadfilter' ], module.options.kingTubbyCutOffFreq );

        },

        exportOptions         : function ( ) {

            let options     = this._self.module.options;
            let settings    = this.nm.buildModuleOptions( options );

            let inNode      = this._self.inNode;
            let outNode     = this._self.outNode;
            let allNodes    = this._self.allNodes;

            function getNode(id) {
                let arr = allNodes.filter(n => n._id === id);

                if (arr.length != 1) {
                    return void(0);
                }

                return arr[0];
            }

            let delay = getNode(1);
            let feedback = getNode(2);
            let filter = getNode(3);

            settings.kingTubbyPreAmpInGain = inNode.gain.value;
            settings.kingTubbyPreAmpOutGain = outNode.gain.value;
            settings.kingTubbyDelayTime = delay ? delay.delayTime.value : options.kingTubbyDelayTime;
            settings.kingTubbyGain = feedback ? feedback.gain.value : options.kingTubbyGain;
            settings.kingTubbyCutOffFreq = filter ? filter.frequency.value : options.kingTubbyCutOffFreq;

            return settings;
        },
    };

} )( window, navigator, jQuery );
