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

let createPlayPauseButton = function(noiseModule, module, clickEvent) {
    let playClass   = 'play';
    let pauseClass  = 'pause';

    let $button = document.createElement("img");
    $button.classList.add("nm-play-button");

    if (module.options.started) {
        $button.classList.add(pauseClass);
    }
    else {
        $button.classList.add(playClass);
    }

    $button.addEventListener('click', function(e) {
        noiseModule.resumeAudioContext();

        if (this.classList.contains(playClass)) {
            clickEvent(this, e);
            this.classList.replace(playClass, pauseClass);
        }
        else {
            clickEvent(this, e);
            this.classList.replace(pauseClass, playClass);
        }
    });

    return $button;
}

let createSliderWrapper = function($input, property, description, units) {
    let value = function(v) {
        return v + " " + units;
    }
    
    let $wrapperDiv = document.createElement("div");
    $wrapperDiv.classList.add(property);
    $wrapperDiv.name = description;

    let $divInfo = document.createElement("div");
    $divInfo.classList.add("nm-slider-info");   
    appendElementToTarget($divInfo, $wrapperDiv);

    let $spanDescription = document.createElement("span");
    $spanDescription.classList.add("nm-label");
    $spanDescription.innerText = description;
    appendElementToTarget($spanDescription, $divInfo);

    let $spanValue = document.createElement("span");
    $spanValue.classList.add("nm-value");
    $spanValue.innerText = value($input.value);
    appendElementToTarget($spanValue, $divInfo);  

    $input.addEventListener("input", function(e) {
        $spanValue.innerText = value(this.value);
    })

    appendElementToTarget($input, $wrapperDiv);
    return $wrapperDiv;
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