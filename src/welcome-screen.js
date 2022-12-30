import pbfe from "./pbfe.js"
import editor from "./editor.js";
import toast from "./toast.js";

var container, box, urlDialog;

function init(_container) {
    container = _container;

    box = new pbfe.Flexbox;
    box.element.id = "welcomeScreen";
    box.justifyContent = "center";
    box.alignItems = "center";

    var titleBox = new pbfe.Flexbox("column");
    titleBox.gap = "0.25rem";
    
    var title = new pbfe.Label("Avatar Cropper");
    title.element.id = "title";
    titleBox.appendChild(title);

    var versionLabel = new pbfe.Label("by LeadRDRK - v1.1");
    titleBox.appendChild(versionLabel);

    var buttonsBox = new pbfe.Flexbox("column");
    buttonsBox.element.id = "openButtonsBox";
    buttonsBox.flexBasis = "20%";
    buttonsBox.gap = "0.5rem";
    
    var openButton = new pbfe.Button("Open File...");
    buttonsBox.appendChild(openButton);

    var urlButton = new pbfe.Button("Open URL...");
    buttonsBox.appendChild(urlButton);

    var hint = new pbfe.Label("You can also drag and drop an image here.");
    hint.element.style.textAlign = "center";
    hint.element.style.fontStyle = "italic";
    buttonsBox.appendChild(hint);

    box.appendChild(titleBox);
    box.appendChild(buttonsBox);

    openButton.addEventListener("click", openFilePicker);
    initURLDialog();
    urlButton.addEventListener("click", urlDialog.show.bind(urlDialog));

    welcomeScreen.shown = true;
}

function initURLDialog() {
    urlDialog = new pbfe.Dialog("Open URL");

    var hint = new pbfe.Label("You can also paste an image here.");
    hint.element.style.marginBottom = "0.5rem";
    urlDialog.appendChild(hint);

    var input = new pbfe.Input("text");
    input.element.id = "urlInput";
    input.placeholder = "https://example.com/image.png";
    urlDialog.appendChild(input);

    var okButton = new pbfe.Button("OK");
    urlDialog.appendButton(okButton);

    var cancelButton = new pbfe.Button("Cancel");
    urlDialog.appendButton(cancelButton);

    input.addEventListener("paste", function(e) {
        var data = e.clipboardData || e.originalEvent.clipboardData;
        if (!data) return;

        var items = data.items;
        for (let i = 0; i < items.length; ++i) {
            let item = items[i];
            if (item.kind == "file") {
                let file = item.getAsFile();
                if (file.type.startsWith("image/")) {
                    editor.open(file, hide);
                    break;
                }
            }
        }
    });

    okButton.addEventListener("click", function() {
        if (input.value === "") {
            toast.show("URL cannot be empty.");
            return;
        }
        urlDialog.hide();
        editor.open(input.value, hide);
    });

    cancelButton.addEventListener("click", function() {
        urlDialog.hide();
    });

    container.appendChild(urlDialog);
}

function show() {
    setTimeout(function() { box.element.classList.remove("hide"); }, 0);
    container.appendChild(box);
    container.appendChild(urlDialog);
    welcomeScreen.shown = true;
}

function hide() {
    box.element.classList.add("hide");
    urlDialog.hide();
    welcomeScreen.shown = false;

    container.removeChildAfterTransition(box, function() {
        if (container.contains(urlDialog)) container.removeChild(urlDialog);
    });
}

var inputEl = document.createElement("input");
inputEl.type = "file";
inputEl.accept = "image/*";

function openFilePicker() {
    inputEl.value = null;
    inputEl.click();
}

inputEl.addEventListener("change", function(e) {
    var fileList = this.files;
    for (let i = 0; i < fileList.length; ++i) {
        let file = fileList[i];
        if (file.type.startsWith("image/")) {
            editor.open(file, hide);
            return;
        }
    }
    toast.show("Invalid image file.");
});

var welcomeScreen = {
    shown: false, init, show, hide
}
export default welcomeScreen;