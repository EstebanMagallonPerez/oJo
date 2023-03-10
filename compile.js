var fs = require('fs');
var uglify = require("uglify-js");

dirname = "compiled"

var compiledFile = `
function fillTemplate(template, data)
{
		const regex = /\{\{\\w+\}\}/gm;
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
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    data = {}
    html = fillTemplate(html,data)
    template.innerHTML = html;
    return template.content.firstChild;
}
function createTracker(context,data){
    dataWithWatcher = \`var x = {listener: undefined,
            set (){
                console.log("setting everything...")
                this.internal = val;
                this.listener(val);
            },
            registerListener: function(listener) {
            this.listener = listener;
        },\`
    var length = Object.keys(data).length
    var count = 0
    for (var [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
            value = "\\"" + value + "\\""
        }
        dataWithWatcher += key + \`Internal : \` + value + \`,
            set \`+ key + \`(val) {
            this.\`+ key + \`Internal = val;
            this.listener(val);
            },
            get \`+ key + \`() {
            return this.\`+ key + \`Internal;
            }\`
        if (count < length) { dataWithWatcher += "," }
        count++;
    }
    dataWithWatcher += "}"
    eval(dataWithWatcher)
    x.registerListener(function (val) {
        context.updateTemplate(this)
    })
    return x;
}`
var component = `
class CLASSNAME_REPLACE extends HTMLElement {
    constructor() {
        super();
        // element created
    }

    connectedCallback() {
        this.attachShadow({ mode: "open" });
        var xmlHttp = new XMLHttpRequest();
		xmlHttp.open( "GET", "FILENAME_REPLACE", false ); // false for synchronous request
        xmlHttp.send(null);
        var html = xmlHttp.responseText
		if (this.hasAttribute("data-template")) {
            var dataName = this.getAttribute("data-template");
            var data = eval(dataName)
            html = fillTemplate(html, data)
            this.updateTemplate = function(data){
                var html = fillTemplate(xmlHttp.responseText,data)
                this.shadowRoot.innerHTML = html
            }
            eval(dataName+" = createTracker(this,"+dataName+")")
        }
        var res = htmlToElement(html)
        this.shadowRoot.append(res);
		CUSTOM_ONLOAD
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
}\r`
function onError() {
	console.log("error")
}
fs.readdir("template", function (err, filenames) {

	if (err !== null) {
		onError(err);
		return;
	}
	var count = 0;
	filenames.forEach(function (filename) {
		console.log("compiling ",filename)
		let componentText = component.replace("FILENAME_REPLACE", "/template/" + filename).replace("CLASSNAME_REPLACE", "template_" + count);
		componentText += 'customElements.define("' + filename.replace(".html", "") + '", template_' + count + ');';
		var content = fs.readFileSync("template/" + filename, 'utf8');
		var scriptContent = ""
		if (content.indexOf("<script>") > -1) {
			scriptContent = content.split("<script>")[1].split("</script>")[0]
		}
		componentText = componentText.replace("CUSTOM_ONLOAD", scriptContent)
		compiledFile += componentText;
		console.log("linting ",filename)
		console.log("compiled ",filename)
		count++;
	});
	console.log("spitting out the compiled JS", 'compiled.js')
	fs.writeFile(dirname + '/compiled.js', compiledFile, err => {
		if (err) {
			console.error(err);
		}
	});
	var uglified = uglify.minify([compiledFile]);

	fs.writeFile('./compiled/compiled.min.js', uglified.code, function (err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Barfing out the minified JS ", 'compiled.min.js');
		}
	});
});
var customComponent = ''