
function fillTemplate(template, data) {
    const regex = /{{\w+}}/gm;
    const str = template;
    let m;
    while ((m = regex.exec(str)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach((match, groupIndex) => {
            for (const [key, value] of Object.entries(data)) {
                if (key == match.replaceAll("{", "").replaceAll("}", "")) {
                    template = template.replaceAll(match, value)
                    break
                }
            }
        });
        m.forEach((match, groupIndex) => {
            template = template.replaceAll(match, "")
        });
    }
    return template
}
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    data = {}
    html = fillTemplate(html, data)
    template.innerHTML = html;
    return template.content.firstChild;
}
function createTracker(context, data) {
    dataWithWatcher = `var x = {listener: undefined,
            set (){
                console.log("setting everything...")
                this.internal = val;
                this.listener(val);
            },
            registerListener: function(listener) {
            this.listener = listener;
        },`
    var length = Object.keys(data).length
    var count = 0
    for (var [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
            value = "\"" + value + "\""
        }
        dataWithWatcher += key + `Internal : ` + value + `,
            set `+ key + `(val) {
            this.`+ key + `Internal = val;
            this.listener(val);
            },
            get `+ key + `() {
            return this.`+ key + `Internal;
            }`
        if (count < length) { dataWithWatcher += "," }
        count++;
    }
    dataWithWatcher += "}"
    eval(dataWithWatcher)
    x.registerListener(function (val) {
        context.updateTemplate(this)
    })
    return x;
}
class template_0 extends HTMLElement {
    constructor() {
        super();
        // element created
    }

    connectedCallback() {
        if (this.hasAttribute("data-template")) {
            var dataName = this.getAttribute("data-template");
            var data = eval(dataName)
            if (Array.isArray(data)) {
                console.log("you passed an array... lets make multiple elements")
            }
        }

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", "/template/react-banner.html", false); // false for synchronous request
        xmlHttp.send(null);
        var html = xmlHttp.responseText
        if (this.hasAttribute("data-template")) {
            var dataName = this.getAttribute("data-template");
            var data = eval(dataName)
            html = fillTemplate(html, data)
            this.updateTemplate = function (data) {
                var html = fillTemplate(xmlHttp.responseText, data)
                this.innerHTML = html
            }
            eval(dataName + " = createTracker(this," + dataName + ")")
        }
        var res = htmlToElement(html)
        this.append(res);

    }

    disconnectedCallback() {
        // browser calls this method when the element is removed from the document
        // (can be called many times if an element is repeatedly added/removed)
    }

    static get observedAttributes() {
        return [/* array of attribute names to monitor for changes */];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // called when one of attributes listed above is modified
    }

    adoptedCallback() {
        // called when the element is moved to a new document
        // (happens in document.adoptNode, very rarely used)
    }

    // there can be other element methods and properties
}
customElements.define("react-banner", template_0);
class template_1 extends HTMLElement {
    constructor() {
        super();
        // element created
    }

    connectedCallback() {
        if (this.hasAttribute("data-template")) {
            var dataName = this.getAttribute("data-template");
            var data = eval(dataName)
            if (Array.isArray(data)) {
                console.log("you passed an array... lets make multiple elements")
                console.log(data.length)
                for (var i = 0; i < data.length; i++) {
                    var sibling = document.createElement(this.tagName)
                    sibling.setAttribute("data-template",dataName+"["+(data.length-i-1)+"]")
                    this.insertAdjacentElement("afterend", sibling)
                }
                this.remove()
                return;
            }

        }

        //this.attachShadow({ mode: "open" });
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", "/template/react-card.html", false); // false for synchronous request
        xmlHttp.send(null);
        var html = xmlHttp.responseText
        if (this.hasAttribute("data-template")) {
            var dataName = this.getAttribute("data-template");
            var data = eval(dataName)
            html = fillTemplate(html, data)
            this.updateTemplate = function (data) {
                var html = fillTemplate(xmlHttp.responseText, data)
                this.innerHTML = html
            }
            eval(dataName + " = createTracker(this," + dataName + ")")
        }
        var res = htmlToElement(html)
        //this.shadowRoot.append(res);
        this.append(res);

        console.log("Script loading works")

    }

    disconnectedCallback() {
        // browser calls this method when the element is removed from the document
        // (can be called many times if an element is repeatedly added/removed)
    }

    static get observedAttributes() {
        return [/* array of attribute names to monitor for changes */];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // called when one of attributes listed above is modified
    }

    adoptedCallback() {
        // called when the element is moved to a new document
        // (happens in document.adoptNode, very rarely used)
    }

    // there can be other element methods and properties
}
customElements.define("react-card", template_1);