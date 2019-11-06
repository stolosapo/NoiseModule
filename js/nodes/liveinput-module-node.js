( function( window, navigator, $, undefined ) {

    /**
     * LiveInputModuleNode: Class for 'liveinput' node
     */
    $.LiveInputModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.LiveInputModuleNode.defaults     = {
    };

    $.LiveInputModuleNode.prototype    = {

        defaultOptions          : function ( ) {
            return $.LiveInputModuleNode.defaults;
        },

        createModuleAudioNode   : function ( module ) {

            navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia;

            if (navigator.mediaDevices) {

                var _self = this;

                var source;

                navigator.mediaDevices.getUserMedia(
                {
                    "audio": {
                        "mandatory": {
                            "googEchoCancellation": "false",
                            "googAutoGainControl": "false",
                            "googNoiseSuppression": "false",
                            "googHighpassFilter": "false"
                        },
                        "optional": [ ]
                    },
                }).then( function( stream ) {

                    source      = _self.nm.audioContext.createMediaStreamSource( stream );

                    /* Update source node map with this new instance */
                    _self.nm._updateAudioNode( module.name, source );

                    var $divEl  = _self.nm._findModuleDivByName( module );
                    var $content    = $( $divEl ).find( '.nm-content' );

                    _self.nm._appendModuleFooter( $( $divEl ), $content, module, source );

                    /* If module option is started then do the connection */
                    if (module.options.started) {
                        _self.nm._connectAllDestinations( module );
                    }

                } );

                return source;

            }

        },

        createModuleDiv         : function ( $moduleEl, module, audioNode ) {

            this.nm._createPlayStopButton( $moduleEl, module, audioNode );

        },

        resetModuleSettings     : function ( $moduleEl, module, audioNode ) {
        }
    };

} )( window, navigator, jQuery );
