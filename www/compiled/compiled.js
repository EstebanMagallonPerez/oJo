
function fillTemplate(template, data)
{
		const regex = /{{\w+}}/gm;
		const str = template;
		let m;
		while ((m = regex.exec(str)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			m.forEach((match, groupIndex) => {
				for (const [key, value] of Object.entries(data)) {
					if(key == match.replaceAll("{","").replaceAll("}",""))
					{
						template = template.replaceAll(match,value)
						break
					}
				}
			});
			m.forEach((match, groupIndex) => {
				template = template.replaceAll(match,"")
			});
		}
		return template
}
function getKeys(template){
    dummyDict = {}
    var sindex = template.indexOf("{{")
    var eindex = template.indexOf("}}")
    while(sindex >-1 && eindex > -1)
    {
        key = template.substring(sindex+2, eindex)
        dummyDict[key] = ""
        eindex = template.indexOf("}}",eindex+2)
        sindex = template.indexOf("{{",sindex+2)
    }
    return dummyDict
}
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    data = {}
    html = fillTemplate(html,data)
    template.innerHTML = html;
    return template.content.firstChild;
}
function createTracker(context,data){
    dataWithWatcher = `var x = {listener: undefined,
            set (){
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
        var hasTemplate = this.hasAttribute("data-template")
        var isStatic = false
        var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", "/template/react-banner.html", false ); // false for synchronous request
        xmlHttp.send();
        
        var html = xmlHttp.responseText
        if (hasTemplate) {
            var dataName = this.getAttribute("data-template");
            try{
                var data = JSON.parse(dataName)
                isStatic = true
            }catch{
                var templateData = getKeys(html)
                try{
                    var data = eval(dataName)
                    if(Array.isArray(data) == false)
                    {
                        data = Object.assign(templateData, data)
                    }
                }catch{
                    eval("window."+dataName +"= templateData")
                    var data = eval(dataName)
                }
                
            }
        }
        if (hasTemplate) {
            if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    var sibling = document.createElement(this.tagName)
                    sibling.setAttribute("data-template",dataName+"["+(data.length-i-1)+"]")
                    this.insertAdjacentElement("afterend", sibling)
                }
                this.remove()
                return;
            }
            if(isStatic === false){
                eval(dataName+" = createTracker(this,"+dataName+")")

            }
            html = fillTemplate(html, data)
            this.updateTemplate = function(data){
            var html = fillTemplate(xmlHttp.responseText,data)
            res = htmlToElement(html)
            this.innerHTML = res.outerHTML
            //this.shadowRoot.innerHTML = html
            }
        }
        var res = htmlToElement(html)
        //this.shadowRoot.append(res);
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
        var hasTemplate = this.hasAttribute("data-template")
        var isStatic = false
        var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", "/template/react-card.html", false ); // false for synchronous request
        xmlHttp.send();
        
        var html = xmlHttp.responseText
        if (hasTemplate) {
            var dataName = this.getAttribute("data-template");
            try{
                var data = JSON.parse(dataName)
                isStatic = true
            }catch{
                var templateData = getKeys(html)
                try{
                    var data = eval(dataName)
                    if(Array.isArray(data) == false)
                    {
                        data = Object.assign(templateData, data)
                    }
                }catch{
                    eval("window."+dataName +"= templateData")
                    var data = eval(dataName)
                }
                
            }
        }
        if (hasTemplate) {
            if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    var sibling = document.createElement(this.tagName)
                    sibling.setAttribute("data-template",dataName+"["+(data.length-i-1)+"]")
                    this.insertAdjacentElement("afterend", sibling)
                }
                this.remove()
                return;
            }
            if(isStatic === false){
                eval(dataName+" = createTracker(this,"+dataName+")")

            }
            html = fillTemplate(html, data)
            this.updateTemplate = function(data){
            var html = fillTemplate(xmlHttp.responseText,data)
            res = htmlToElement(html)
            this.innerHTML = res.outerHTML
            //this.shadowRoot.innerHTML = html
            }
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