( function( window, navigator, $, undefined ) {

    /* LiveInputModuleNode: Class for 'liveinput' node */

    $.LiveInputModuleNodeFactory             = function () {
    };

    $.LiveInputModuleNodeFactory.prototype   = {

        typeName    : "liveinput",

        create      : function ( noiseModule ) {

            return new $.LiveInputModuleNode( noiseModule );
        }
    };

    $.LiveInputModuleNode              = function ( noiseModule ) {

        this.nm = noiseModule;
    };

    $.LiveInputModuleNode.defaults     = {

        started: false
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

                    let $footer = _self.nm.ui.createModuleFooter( module, source );
                    _self.nm.ui.appendElementToTarget( $footer, _self.$div[0].parentNode );

                    /* If module option is started then do the connection */
                    if (module.options.started) {
                        _self.nm._connectAllDestinations( module );
                    }

                } );

                return source;

            }

        },

        createModuleDiv         : function ( module, audioNode ) {

            let $container  = this.nm.ui.createContentContainer( );
            let $button = this.nm.ui.createPlayStopButton( module, audioNode );

            this.nm.ui.appendElementToTarget( $button, $container );

            return $container;
        },

        resetModuleSettings     : function ( module, audioNode ) {
        }
    };

} )( window, navigator, jQuery );
