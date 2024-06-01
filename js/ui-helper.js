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

let createByPassButton = function(noiseModule, module) {
    const byPassedClass = 'bypassed';

    let $button = document.createElement("img");
    $button.classList.add("nm-bypass-button");

    $button.addEventListener('click', function(e) {
        if (this.classList.contains(byPassedClass)) {
            noiseModule.reAttachModule(module);
            this.classList.remove(byPassedClass);
        } else {
            noiseModule.byPassModule(module);
            this.classList.add(byPassedClass);
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

let dragElement = function($elem) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById($elem.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById($elem.id + "header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      $elem.onmousedown = dragMouseDown;
    }
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      $elem.style.top = ($elem.offsetTop - pos2) + "px";
      $elem.style.left = ($elem.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }