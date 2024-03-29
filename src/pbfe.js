function inherit(cls, className) {
    var proto = Object.create(cls.prototype);
    proto.className = className;
    return proto;
}

function addElementProperty(cls, name) {
    Object.defineProperty(cls.prototype, name, {
        get: function() {
            return this.element[name];
        },
        set: function(value) {
            this.element[name] = value;
        }
    })
}

function addStyleProperty(cls, name) {
    Object.defineProperty(cls.prototype, name, {
        get: function() {
            return this.element.style[name];
        },
        set: function(text) {
            this.element.style[name] = text;
        }
    })
}

function Widget() {
    if (!this.element) this.element = document.createElement("div");
    if (!this.body) this.body = this.element;
    this.element.classList.add("pbfe" + (this.className ? this.className : "Widget"));
}

Widget.prototype.appendChild = function(widget) {
    this.body.appendChild(widget.element);
}

Widget.prototype.appendChildren = function(array) {
    for (var i = 0; i < array.length; ++i) {
        this.appendChild(array[i]);
    }
}

Widget.prototype.removeChild = function(widget) {
    this.body.removeChild(widget.element);
}

Widget.prototype.removeChildAfterTransition = function(widget, callback) {
    var body = this.body;
    this.element.addEventListener("transitionend", function listener() {
        body.removeChild(widget.element);
        if (callback) callback();
        this.removeEventListener("transitionend", listener);
    });
}

Widget.prototype.addEventListener = function(type, listener) {
    this.element.addEventListener.apply(this.element, arguments);
}

Widget.prototype.contains = function(widget) {
    return widget.element.parentNode == this.element;
}

addStyleProperty(Widget, "width");
addStyleProperty(Widget, "height");
addStyleProperty(Widget, "order");
addStyleProperty(Widget, "flexGrow");
addStyleProperty(Widget, "flexShrink");
addStyleProperty(Widget, "flexBasis");
addStyleProperty(Widget, "alignSelf");

function Container(element) {
    if (!element) {
        element = document.createElement("div");
        document.body.appendChild(element);
    }

    this.element = element;
    Widget.call(this);
}

Container.prototype = inherit(Widget, "Container");

Container.prototype.createShadow = function() {
    if (document.getElementById("pbfeShadow")) return;
    var div = document.createElement("div");
    div.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:100;";
    div.id = "pbfeShadow";
    this.element.appendChild(div);
}

Container.prototype.showToast = function(text, timeout, waitHideTransition) {
    var toast = new Toast(text);
    this.appendChild(toast);
    // Force transition to play, if any.
    setTimeout(toast.show.bind(toast), 0);

    var self = this;
    setTimeout(function() {
        if (waitHideTransition) {
            toast.element.addEventListener("transitionend", function listener() {
                self.removeChild(toast);
                toast.element.removeEventListener("transitionend", listener);
            });
            toast.hide();
        }
        else this.removeChild(toast);
    }, timeout);
}

function Flexbox(direction) {
    var element = document.createElement("div");
    element.style.display = "flex";
    element.style.flexDirection = direction;
    this.element = element;
    Widget.call(this);
}

Flexbox.prototype = inherit(Widget, "Flexbox");
addStyleProperty(Flexbox, "flexDirection");
addStyleProperty(Flexbox, "justifyContent");
addStyleProperty(Flexbox, "alignItems");
addStyleProperty(Flexbox, "alignContent");
addStyleProperty(Flexbox, "gap");
addStyleProperty(Flexbox, "rowGap");
addStyleProperty(Flexbox, "columnGap");

function Floatbox() {
    var element = document.createElement("div");
    element.style.position = "fixed";
    this.element = element;
    Widget.call(this);
}

Floatbox.prototype = inherit(Widget, "Floatbox");
addStyleProperty(Floatbox, "zIndex");
addStyleProperty(Floatbox, "top");
addStyleProperty(Floatbox, "left");
addStyleProperty(Floatbox, "bottom");
addStyleProperty(Floatbox, "right");

function Label(text) {
    var element = document.createElement("span");
    element.innerText = text;
    this.element = element;
    Widget.call(this);
}

Label.prototype = inherit(Widget, "Label");

Object.defineProperty(Label.prototype, "text", {
    get: function() {
        return this.element.innerText;
    },
    set: function(text) {
        this.element.innerText = text;
    }
})

function Button(text, type) {
    var element = document.createElement("button");
    if (text) element.innerText = text;
    if (type) element.classList.add(type);
    this.element = element;
    Widget.call(this);
}

Button.prototype = inherit(Label, "Button");

function Dialog(titleText) {
    var element = document.createElement("div");
    element.style.zIndex = 101;

    var title = document.createElement("div");
    title.classList.add("pbfeDialogTitle");
    title.innerText = titleText;
    element.appendChild(title);

    var body = document.createElement("div");
    body.classList.add("pbfeDialogBody");
    element.appendChild(body);

    var buttons = document.createElement("div");
    buttons.classList.add("pbfeDialogButtons");
    buttons.style.display = "flex";
    element.appendChild(buttons);

    this.element = element;
    this.title = title;
    this.body = body;
    this.buttons = buttons;
    Widget.call(this);
}

Dialog.prototype = inherit(Widget, "Dialog");

Dialog.prototype.show = function() {
    this.element.classList.add("show");
    var shadow = document.getElementById("pbfeShadow");
    if (shadow) shadow.classList.add("show");
}

Dialog.prototype.hide = function() {
    if (this.element.classList.contains("show")) {
        this.element.classList.remove("show");
        var shadow = document.getElementById("pbfeShadow");
        if (shadow) shadow.classList.remove("show");
    }
}

Dialog.prototype.appendButton = function(widget) {
    this.buttons.appendChild(widget.element);
}

Dialog.prototype.removeButton = function(widget) {
    this.buttons.removeChild(widget.element);
}

Dialog.prototype.appendHideButton = function(btnText, type) {
    var btn = new Button(btnText, type);
    btn.addEventListener("click", this.hide.bind(this));
    this.appendButton(btn);
}

Object.defineProperty(Dialog.prototype, "titleText", {
    get: function() {
        return this._title.innerText;
    },
    set: function(text) {
        this._title.innerText = text;
    }
})

function Input(type) {
    function createCheckbox() {
        var element = document.createElement("button");
        element.classList.add("pbfeCheckbox");

        var inner = document.createElement("div");
        inner.classList.add("pbfeCheckboxInner");
        element.appendChild(inner);

        Object.defineProperty(element, "checked", {
            get: function() {
                return this._checked;
            },
            set: function(value) {
                if (this._checked == value) return;
                this._checked = value;
                if (value) element.classList.add("checked");
                else element.classList.remove("checked");

                element.dispatchEvent(new Event("change"));
            }
        });
        element._checked = false;

        element.addEventListener("click", function() {
            this.checked = !this.checked;
        });

        return element;
    }

    var element;
    switch (type) {
        case "checkbox":
            element = createCheckbox();
            break;

        default:
            // no replacement, fallback to input element
            element = document.createElement("input");
            element.type = type;
            break;

    }
    this.element = element;
    this.type = type;
    Widget.call(this);
}

Input.prototype = inherit(Widget, "Input");

addElementProperty(Input, "value");
addElementProperty(Input, "placeholder");
addElementProperty(Input, "min");
addElementProperty(Input, "max");
addElementProperty(Input, "step");

function ProgressBar() {
    var element = document.createElement("div");
    var inner = document.createElement("div");
    inner.classList.add("pbfeProgressBarInner");
    inner.style.width = "0%";
    inner.style.height = "100%";
    element.appendChild(inner);

    this.element = element;
    this.inner = inner;
    Widget.call(this);
}

ProgressBar.prototype = inherit(Widget, "ProgressBar");

ProgressBar.prototype.setProgress = function(value) {
    var inner = this.inner;
    if (typeof value == "number") {
        if (value < 0) {
            inner.style.removeProperty("width");
            inner.classList.add("indeterminate");
            return;
        }
        else
            value = (value * 100) + "%";
    }

    if (inner.classList.contains("indeterminate"))
        inner.classList.remove("indeterminate");

    inner.style.width = value;
}

function Canvas() {
    this.element = document.createElement("canvas");
    Widget.call(this);
}

Canvas.prototype = inherit(Widget, "Canvas");

Canvas.prototype.getContext = function() {
    return this.element.getContext.apply(this.element, arguments);
}

function Toast(text) {
    var element = document.createElement("div");
    element.style.zIndex = 102;
    element.innerText = text;
    this.element = element;
    Widget.call(this);
}

Toast.prototype = inherit(Label, "Toast");

Toast.prototype.show = function() {
    this.element.classList.add("show");
}

Toast.prototype.hide = function() {
    this.element.classList.remove("show");
}

function Selector() {
    var element = document.createElement("select");
    this.element = element;
    Widget.call(this);
}

Selector.prototype = inherit(Widget, "Selector");

Selector.prototype.addOption = function(text, value, isPlaceholder) {
    var option = document.createElement("option");
    option.text = text;
    if (value) option.value = value;
    if (isPlaceholder) {
        option.hidden = option.disabled = option.selected = true;
    }
    this.element.appendChild(option);
}

addElementProperty(Selector, "value");

const pbfe = {
    Container,
    Widget,
    Flexbox,
    Floatbox,
    Label,
    Button,
    Dialog,
    Input,
    ProgressBar,
    Canvas,
    Toast,
    Selector
}

export default pbfe;