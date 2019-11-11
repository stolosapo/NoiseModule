( function( window, navigator, $, undefined ) {

    /* WaveShaperModuleNode: Class for 'waveshapernode' node */

    $.WaveShaperModuleNodeFactory             = function () {
    };

    $.WaveShaperModuleNodeFactory.prototype   = {

        typeName    : "waveshapernode",

        create      : function ( noiseModule ) {

            return new $.WaveShaperModuleNode( noiseModule );
        }
    };

    $.WaveShaperModuleNode             = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.WaveShaperModuleNode.defaults   = {

        waveShapperCurveAmount  : 400,

        /* none, 2x, 4x */
        waveShapperOversample   : '4x'
    };

    $.WaveShaperModuleNode.prototype   = {

        defaultOptions            : function ( ) {
            return $.WaveShaperModuleNode.defaults;
        },

        createModuleAudioNode     : function ( module ) {

            let node = this.nm.audioContext.createWaveShaper ( );

            node.curve = this._createDistortionCurve ( module.options.waveShapperCurveAmount );
            node.oversample = module.options.waveShapperOversample;

            return node;

        },

        createModuleDiv           : function ( module, audioNode ) {

            let $container      = this.nm.ui.createContentContainer( );

            let _self           = this;

            let $curveDiv       = this.nm._createSimpleSliderControl( audioNode, 'curve', 0, 1000, 1, "", function() {
                audioNode.curve = _self._createDistortionCurve ( this.value );
            } );

            let $oversampleDiv  = this.nm._createSimpleSliderControl( audioNode, 'oversample', 0, 4, 2, "", function() {
                let value = this.value == 0 ? 'none' : this.value + 'x';
                audioNode.oversample = value;
            } );

            this.nm.ui.appendElementToTarget( $curveDiv, $container );
            this.nm.ui.appendElementToTarget( $oversampleDiv, $container );

            return $container;
        },

        resetModuleSettings       : function ( module, audioNode ) {

            this.nm._resetSliderSetting( this.$div, audioNode, 'curve', module.options.waveShapperCurveAmount );
            this.nm._resetSliderSetting( this.$div, audioNode, 'oversample', module.options.waveShapperOversample );

        },

        _createDistortionCurve    : function ( amount ) {

            let k = typeof amount === 'number' ? amount : 50;
            let n_samples = 44100;

            let curve = new Float32Array(n_samples);
            let deg = Math.PI / 180;
            let i = 0
            let x;

            for ( ; i < n_samples; ++i ) {

                x = i * 2 / n_samples - 1;

                curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
            }

            return curve;

        },

    };

} )( window, navigator, jQuery );
