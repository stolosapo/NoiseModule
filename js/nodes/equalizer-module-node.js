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

        biquadFilterFrequency   : 440,
        biquadFilterDetune      : 0,
        biquadFilterQ           : 1,
        biquadFilterGain        : 0,

        eqPreAmpInGain          : 1,
        eqPreAmpOutGain         : 1,
        eqBandControl           : 'gain',
        eqBandMin               : -12,
        eqBandMax               : 12,
        eqBandStep              : 1,

        eqBands                 : [
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

            let _self       = this;

            let preAmp      = _self.gainNode.createGain( module, module.options.eqPreAmpInGain );
            let outputGain  = _self.gainNode.createGain( module, module.options.eqPreAmpOutGain );

            let nodes       = [ ];
            let prevNode    = preAmp;

            nodes.push( preAmp );

            // Create all bands
            module.options.eqBands.forEach( (band, index) => {

                let bandNode    = _self.biquadfilterNode.createBiquadFilter(
                    module,
                    band.type,
                    band.frequency,
                    band.detune,
                    band.Q,
                    band.gain );

                bandNode._id = index;

                _self.nm.connectNodes( prevNode, bandNode );

                prevNode        = bandNode;

                nodes.push( prevNode );
            } );

            _self.nm.connectNodes( prevNode, outputGain );

            nodes.push( outputGain );

            return { inNode: preAmp, outNode: outputGain, allNodes: nodes };
        },

        createModuleDiv         : function ( module, audioNode ) {

            let _self       = this;
            let inGain      = audioNode.inNode;
            let outGain     = audioNode.outNode;


            let $container  = this.nm.ui.createContentContainer( );

            let $inGainDiv  = this.nm.ui.createSliderControl( inGain, 'gain', 'preAmp In', 0, 2, 0.1, '' );
            $inGainDiv.addClass( 'pre-amp' );
            $inGainDiv.addClass( 'in' );

            let $outGainDiv = this.nm.ui.createSliderControl( outGain, 'gain', 'preAmp Out', 0, 2, 0.1, '' );
            $outGainDiv.addClass( 'pre-amp' );
            $outGainDiv.addClass( 'out' );

            let lastIndex   = audioNode.allNodes.length - 1;

            this.nm.ui.appendElementToTarget( $inGainDiv, $container );

            audioNode.allNodes.forEach( (node, index) => {

                let $filter  = _self._createFilterUI( _self, index, lastIndex, module, node );

                _self.nm.ui.appendElementToTarget( $filter, $container );
            } );

            this.nm.ui.appendElementToTarget( $outGainDiv, $container );

            return $container;
        },

        resetModuleSettings     : function ( module, audioNode ) {

            let _self       = this;

            let inClasses   = [ 'gain', 'pre-amp', 'in' ];
            let outClasses  = [ 'gain', 'pre-amp', 'out' ];

            this.nm.ui.resetSliderSettingByClasses( _self.$div, audioNode.inNode, 'gain', inClasses, module.options.eqPreAmpInGain );
            this.nm.ui.resetSliderSettingByClasses( _self.$div, audioNode.outNode, 'gain', outClasses, module.options.eqPreAmpOutGain );

            let lastIndex   = audioNode.allNodes.length - 1;

            audioNode.allNodes.forEach( (node, index) => {
                _self._resetFilter( _self, index, lastIndex, module, node )
            } );
        },

        exportOptions           : function ( ) {

            let options     = this._self.module.options;
            let settings    = this.nm.buildModuleOptions( options );

            let inNode      = this._self.inNode;
            let outNode     = this._self.outNode;
            let allNodes    = this._self.allNodes;

            settings.biquadFilterFrequency = options.biquadFilterFrequency;
            settings.biquadFilterDetune = options.biquadFilterDetune;
            settings.biquadFilterQ = options.biquadFilterQ;
            settings.biquadFilterGain = options.biquadFilterGain;

            settings.eqPreAmpInGain = inNode.gain.value;
            settings.eqPreAmpOutGain = outNode.gain.value;
            settings.eqBandControl = options.eqBandControl;
            settings.eqBandMin = options.eqBandMin;
            settings.eqBandMax = options.eqBandMax;
            settings.eqBandStep = options.eqBandStep;

            settings.eqBands =
                options.eqBands.map( (b, i) => {

                    let nb = Object.assign( {}, b );
                    let nodeArr = allNodes.filter(n => n._id === i);

                    if (nodeArr.length != 1) {
                        return nb;
                    }

                    let node = nodeArr[0];

                    nb.gain = node.gain.value;

                    return nb;
                } );

            return settings;
        },

        _createFilterUI         : function ( _self, index, lastIndex, module, node ) {

            let min         = module.options.eqBandMin;
            let max         = module.options.eqBandMax;
            let step        = module.options.eqBandStep;

            if ( index == 0 || index == lastIndex ) {
                return;
            }

            let bandIndex   = index - 1;
            let description = module.options.eqBands[ bandIndex ].description;

            let $filter  = _self.nm.ui.createSliderControl(
                node,
                module.options.eqBandControl,
                description,
                min,
                max,
                step,
                '' );

            $filter.addClass( 'eq-band' );
            $filter.addClass( 'band' + bandIndex );

            return $filter;
        },

        _resetFilter            : function ( _self, index, lastIndex, module, node ) {
            if ( index == 0 || index == lastIndex ) {
                return;
            }

            let bandControlType = module.options.eqBandControl;
            let bandIndex       = index - 1;

            let classes     = [ bandControlType, 'eq-band', 'band' + bandIndex ];
            let value       = module.options.eqBands[ bandIndex ][ bandControlType ];

            _self.nm.ui.resetSliderSettingByClasses(
                _self.$div,
                node,
                bandControlType,
                classes,
                value );
        },
    };

} )( window, navigator, jQuery );
