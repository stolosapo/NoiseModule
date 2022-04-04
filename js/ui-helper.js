let appendElementToTarget = function($elem, $target) {
    if (!$elem || !$target) {
        return;
    }

    $target.appendChild($elem);
}

let createPlayStopButton = function(noiseModule, module) {
    let playClass   = 'play';
    let stopClass   = 'stop';

    let $button = document.createElement("img");
    $button.classList.add("nm-play-button");

    if (module.options.started) {
        $button.classList.add(stopClass);
    }
    else {
        $button.classList.add(playClass);
    }

    $button.addEventListener('click', function(e) {
        noiseModule.resumeAudioContext();

        if (this.classList.contains(playClass)) {
            noiseModule.connectAllDestinations(module);
            this.classList.replace(playClass, stopClass);
        }
        else {
            noiseModule.disconnectAllDestinations(module);
            this.classList.replace(stopClass, playClass);
        }
    });

    return $button;
}

let createPlayPauseButton = function(noiseModule, module, audioNode, playPauseClickEvent) {
    let playClass   = 'play';
    let pauseClass  = 'pause';

    let $button = document.createElement("img");
    $button.classList.add("nm-play-button");

    if ( module.options.started ) {
        $button.classList.add(pauseClass);
    }
    else {
        $button.classList.add(playClass);
    }

    $button.addEventListener('click', function() {
        noiseModule.resumeAudioContext();

        if (this.classList.contains(playClass)) {
            // playPauseClickEvent(_self, module, audioNode, true );

            this.classList.replace(playClass, pauseClass);
        }
        else {
            // playPauseClickEvent( _self, module, audioNode, false );

            this.classList.replace(pauseClass, playClass);
        }
    });

    return $button;
}

let createSliderControl = function(initialValue, min, max, step, changeEvent) {
    let $input = document.createElement("input");  
    $input.min = min;
    $input.max = max;
    $input.step = step;
    $input.type = "range";
    $input.value = initialValue;
    $input.addEventListener('input', changeEvent);
    return $input;
}