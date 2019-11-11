( function( window, navigator, $, undefined ) {

    /* EqualizerModuleNode: Class for 'equalizer' node */

    $.EqualizerModuleNodeFactory             = function ( gainModuleFactory, biquadfilterModuleFactory ) {

        this.gainModuleFactory = gainModuleFactory;
        this.biquadfilterModuleFactory = biquadfilterModuleFactory;
    };

    $.EqualizerModuleNodeFactory.prototype   = {

        typeName    : "equalizer",

        create      : function ( noiseModule ) {

            let gainModuleNode = this.gainModuleFactory.create( noiseModule );
            let biquadfilterModuleNode = this.biquadfilterModuleFactory.create( noiseModule );

            return new $.EqualizerModuleNode( noiseModule, gainModuleNode, biquadfilterModuleNode );
        }
    };

    $.EqualizerModuleNode              = function ( noiseModule, gainModuleNode, biquadfilterModuleNode ) {

        this.nm = noiseModule;
        this.gainNode = gainModuleNode;
        this.biquadfilterNode = biquadfilterModuleNode;
    };

    $.EqualizerModuleNode.defaults     = {

        eqPreAmpInGain  : 1,
        eqPreAmpOutGain : 1,
        eqBandControl   : 'gain',
        eqBandMin       : -12,
        eqBandMax       : 12,
        eqBandStep      : 1,
        eqBands         : [
            { description: '60 Hz', type: 'lowshelf', frequency: 60, detune: 0, Q: 1, gain: 0 },
            { description: '170 Hz', type: 'lowshelf', frequency: 170, detune: 0, Q: 1, gain: 0 },
            { description: '310 Hz', type: 'lowshelf', frequency: 310, detune: 0, Q: 1, gain: 0 },
            { description: '600 Hz', type: 'peaking', frequency: 600, detune: 0, Q: 1, gain: 0 },
            { description: '1 KHz', type: 'peaking', frequency: 1000, detune: 0, Q: 1, gain: 0 },
            { description: '3 KHz', type: 'peaking', frequency: 3000, detune: 0, Q: 1, gain: 0 },
            { description: '6 KHz', type: 'peaking', frequency: 6000, detune: 0, Q: 1, gain: 0 },
            { description: '12 KHz', type: 'highshelf', frequency: 12000, detune: 0, Q: 1, gain: 0 },
            { description: '14 KHz', type: 'highshelf', frequency: 14000, detune: 0, Q: 1, gain: 0 },
            { description: '16 KHz', type: 'highshelf', frequency: 16000, detune: 0, Q: 1, gain: 0 }
        ]
    };

    $.EqualizerModuleNode.prototype    = {

        defaultOptions          : function ( ) {
            return $.EqualizerModuleNode.defaults;
        },

        createModuleAudioNode   : function ( module ) {

            var _self   = this;

            var preAmp  = _self.gainNode.createGain( module, module.options.eqPreAmpInGain );
            var outputGain  = _self.gainNode.createGain( module, module.options.eqPreAmpOutGain );

            var nodes   = [ ];
            var prevNode    = preAmp;

            nodes.push( preAmp );

            // Create all bands
            $.each( module.options.eqBands, function( index, band ) {

                var bandNode    = _self.biquadfilterNode.createBiquadFilter(
                    module,
                    band.type,
                    band.frequency,
                    band.detune,
                    band.Q,
                    band.gain );

                _self.nm.connectNodes( prevNode, bandNode );

                prevNode        = bandNode;

                nodes.push( prevNode );

            } );

            _self.nm.connectNodes( prevNode, outputGain );

            nodes.push( outputGain );

            return { inNode: preAmp, outNode: outputGain, allNodes: nodes };

        },

        createModuleDiv         : function ( $moduleEl, module, audioNode ) {

            var _self       = this;
            var inGain      = audioNode.inNode;
            var outGain     = audioNode.outNode;

            var min         = module.options.eqBandMin;
            var max         = module.options.eqBandMax;
            var step        = module.options.eqBandStep;

            var $inGainDiv  = this.nm._createSliderControl( inGain, 'gain', 'preAmp In', 0, 2, 0.1, '' );
            $inGainDiv.addClass( 'pre-amp' );
            $inGainDiv.addClass( 'in' );

            var $outGainDiv = this.nm._createSliderControl( outGain, 'gain', 'preAmp Out', 0, 2, 0.1, '' );
            $outGainDiv.addClass( 'pre-amp' );
            $outGainDiv.addClass( 'out' );

            var lastIndex   = audioNode.allNodes.length - 1;

            $inGainDiv.appendTo( $moduleEl );

            $.each( audioNode.allNodes, function( index, node ) {

                if ( index == 0 || index == lastIndex ) {
                    return;
                }

                var bandIndex   = index - 1;
                var description = module.options.eqBands[ bandIndex ].description;

                var $filterDiv  = _self.nm._createSliderControl(
                    node,
                    module.options.eqBandControl,
                    description,
                    min,
                    max,
                    step,
                    '' );

                $filterDiv.addClass( 'eq-band' );
                $filterDiv.addClass( 'band' + bandIndex );

                $filterDiv.appendTo( $moduleEl );

            } );


            $outGainDiv.appendTo( $moduleEl );

        },

        resetModuleSettings     : function ( $moduleEl, module, audioNode ) {

            var _self       = this;

            var inClasses   = [ 'gain', 'pre-amp', 'in' ];
            var outClasses  = [ 'gain', 'pre-amp', 'out' ];

            this.nm._resetSliderSettingByClasses( $moduleEl, audioNode.inNode, 'gain', inClasses, module.options.eqPreAmpInGain );
            this.nm._resetSliderSettingByClasses( $moduleEl, audioNode.outNode, 'gain', outClasses, module.options.eqPreAmpOutGain );

            var lastIndex   = audioNode.allNodes.length - 1;

            $.each( audioNode.allNodes, function( index, node ) {

                if ( index == 0 || index == lastIndex ) {
                    return;
                }

                var bandControlType = module.options.eqBandControl;
                var bandIndex       = index - 1;

                var classes     = [ bandControlType, 'eq-band', 'band' + bandIndex ];
                var value       = module.options.eqBands[ bandIndex ][ bandControlType ];

                _self.nm._resetSliderSettingByClasses(
                    $moduleEl,
                    node,
                    bandControlType,
                    classes,
                    value );

            } );

        },

    };

} )( window, navigator, jQuery );
