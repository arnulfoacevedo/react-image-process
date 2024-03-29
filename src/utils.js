import pbfe from "./pbfe.js";

export function redrawFunc(draw) {
    let frameRequested = false;
    return function() {
        if (frameRequested) return;
        frameRequested = true;
        window.requestAnimationFrame(function() {
            draw();
            frameRequested = false;
        });
    }
}

var currentTouchId = null;
export function touchToMouseEvent(e) {
    var touches = e.changedTouches;
    var touch;
    if (currentTouchId != null) {
        for (let i = 0; i < touches.length; ++i) {
            if (touches[i].identifier == currentTouchId) {
                touch = touches[i];
                break;
            }
        }
    }

    var type = "";
    switch (e.type) {
        case "touchstart":
            if (currentTouchId != null || touches.length == 0) return;
            type = "mousedown";
            touch = touches[0];
            currentTouchId = touch.identifier;
            break;

        case "touchmove":
            type = "mousemove";
            break;
        
        case "touchend":
            if (touch) currentTouchId = null;
            type = "mouseup";
            break;

        default: return;
    }

    if (!touch) return;

    var simulatedEvent = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        button: 0,
        relatedTarget: null
    });

    this.dispatchEvent(simulatedEvent);
}

export function MenuInputs() {}
MenuInputs.prototype.create = function(name, labelText, inputType, split) {
    if (!labelText) labelText = name;
    var label = new pbfe.Label(labelText);
    label.element.classList.add("menuInputBox");
    if (split) label.element.classList.add("split");

    var input;
    if (inputType == "color") {
        input = new pbfe.Widget;
        input.element.classList.add("cpButton");
    }
    else {
        input = new pbfe.Input(inputType);
        input.element.setAttribute("aria-label", labelText);
    }
    label.appendChild(input);
    this[name] = input.element;
    return label;
}

export function createRangeDetents(id, values) {
    var detents = document.createElement("datalist");
    detents.id = id;
    for (let i = 0; i < values.length; ++i) {
        let option = document.createElement("option");
        option.value = values[i];
        detents.appendChild(option);
    }
    document.body.appendChild(detents);
    return id;
}

export function isPointInRect(x, y, rect) {
    return (x >= rect.x && y >= rect.y &&
            x <= rect.x + rect.width && y <= rect.y + rect.height);
}

export function isPointInCircle(x, y, cx, cy, radius) {
    return Math.pow(x - cx, 2) + Math.pow(y - cy, 2) < Math.pow(radius, 2);
}

export function getTouchDist(touch1, touch2) {
    return Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
}

export function createLine(ctx, x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}