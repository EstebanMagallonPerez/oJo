const renderEvent = new Event("render");

document.addEventListener("DOMContentLoaded", function () {
  document.dispatchEvent(renderEvent);
});

function ccHandler(fileName, callback) {
  var hasTemplate = this.hasAttribute("data-template");
  var isStatic = false;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", fileName, false); // false for synchronous request
  xmlHttp.send(null);
  var html = xmlHttp.responseText;
  var fileName = fileName;
  var dataName = this.getAttribute("data-template");
  if (hasTemplate && dataName !== undefined) {
    try {
      var data = JSON.parse(dataName);
      isStatic = true;
    } catch {
      var templateData = getKeys(html);
      try {
        var data = eval(dataName);
        if (Array.isArray(data) == false) {
          data = Object.assign(templateData, data);
        }
      } catch {
        eval("window." + dataName + "= templateData");
        var data = eval(dataName);
      }
    }
  }
  if (hasTemplate) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        var sibling = document.createElement(this.tagName);
        sibling.setAttribute(
          "data-template",
          dataName + "[" + (data.length - i - 1) + "]"
        );
        this.insertAdjacentElement("afterend", sibling);
      }
      this.remove();
      return;
    }
    if (isStatic === false) {
      eval(dataName + " = createTracker(this," + dataName + ")");
    }
    html = fillTemplate(html, data);
    this.updateTemplate = function (data) {
      var html = fillTemplate(xmlHttp.responseText, data);
      res = htmlToElement(html);
      this.innerHTML = res.outerHTML;
    };
  }
  let res = htmlToElement(html);
  let slot = res.getElementsByTagName("slot");
  if (slot.length > 0) {
    let p = slot[0].parentNode;
    slot[0].remove();
    var div_array = [...this.children]; // converts NodeList to Array
    div_array.forEach((div) => {
      p.append(div);
    });
  }
  this.append(res);
  callback.bind(this)();
}
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
          if (typeof value !== typeof "") {
            let value1 = JSON.stringify(value);
            template = template.replaceAll(match, value1);
          } else {
            template = template.replaceAll(match, value);
          }
          break;
        }
      }
    });
    m.forEach((match, groupIndex) => {
      template = template.replaceAll(match, "");
    });
  }
  return template;
}
function getKeys(template) {
  dummyDict = {};
  var sindex = template.indexOf("{{");
  var eindex = template.indexOf("}}");
  while (sindex > -1 && eindex > -1) {
    key = template.substring(sindex + 2, eindex);
    dummyDict[key] = "";
    eindex = template.indexOf("}}", eindex + 2);
    sindex = template.indexOf("{{", sindex + 2);
  }
  return dummyDict;
}
function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  data = {};
  html = fillTemplate(html, data);
  template.innerHTML = html;
  return template.content.firstChild;
}

function createTracker(context, data) {
  if (data.listener != undefined) {
    return data;
  }
  dataWithWatcher = `var x = {listener: undefined,
            set (){
                this.internal = val;
                this.listener(val);
            },
            registerListener: function(listener) {
            this.listener = listener;
        },`;
  var length = Object.keys(data).length;
  var count = 0;
  for (var [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      value = '"' + value + '"';
    }
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    dataWithWatcher +=
      key +
      `Internal : ` +
      value +
      `,
            set ` +
      key +
      `(val) {
            this.` +
      key +
      `Internal = val;
            this.listener(val);
            },
            get ` +
      key +
      `() {
            return this.` +
      key +
      `Internal;
            }`;
    if (count < length) {
      dataWithWatcher += ",";
    }
    count++;
  }
  dataWithWatcher += "}";

  eval(dataWithWatcher);
  x.registerListener(function (val) {
    context.updateTemplate(this);
  });
  return x;
}
class template_0 extends HTMLElement {
  constructor() {
    super();
    // element created
  }
  customOnload() {}

  connectedCallback() {
    document.addEventListener(
      "render",
      function () {
        ccHandler.bind(
          this,
          "/template/bs-carousel-caption.html",
          this.customOnload
        )();
      }.bind(this, self),
      { once: true }
    );
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
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
customElements.define("bs-carousel-caption", template_0);
class template_1 extends HTMLElement {
  constructor() {
    super();
    // element created
  }
  customOnload() {
    console.log("in the onload ");
    let id = this.children[0].getAttribute("id");
    let carouselItems = document.querySelectorAll("bs-carousel-item");
    let cArray = [...carouselItems];
    let output = "";
    let count = 0;
    cArray.forEach((element) => {
      console.log("in the foreach ");
      output +=
        '<button type="button" data-bs-target="' +
        id +
        '"' +
        (count == 0 ? 'class="active"' : "") +
        ' data-bs-slide-to="' +
        count +
        '" aria-current="true" aria-label="Slide ' +
        (count + 1) +
        '"></button>';
      count += 1;
    });
    let one = document.querySelectorAll(".carousel-indicators");
    one[0].innerHTML = output;
  }

  connectedCallback() {
    document.addEventListener(
      "render",
      function () {
        ccHandler.bind(
          this,
          "/template/bs-carousel-container.html",
          this.customOnload
        )();
      }.bind(this, self),
      { once: true }
    );
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
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
customElements.define("bs-carousel-container", template_1);
class template_2 extends HTMLElement {
  constructor() {
    super();
    // element created
  }
  customOnload() {}

  connectedCallback() {
    document.addEventListener(
      "render",
      function () {
        ccHandler.bind(
          this,
          "/template/bs-carousel-item.html",
          this.customOnload
        )();
      }.bind(this, self),
      { once: true }
    );
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
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
customElements.define("bs-carousel-item", template_2);
class template_3 extends HTMLElement {
  constructor() {
    super();
    // element created
  }
  customOnload() {}

  connectedCallback() {
    document.addEventListener(
      "render",
      function () {
        ccHandler.bind(
          this,
          "/template/bs-container.html",
          this.customOnload
        )();
      }.bind(this, self),
      { once: true }
    );
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
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
customElements.define("bs-container", template_3);
class template_4 extends HTMLElement {
  constructor() {
    super();
    // element created
  }
  customOnload() {}

  connectedCallback() {
    document.addEventListener(
      "render",
      function () {
        ccHandler.bind(
          this,
          "/template/bs-navbar-item.html",
          this.customOnload
        )();
      }.bind(this, self),
      { once: true }
    );
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
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
customElements.define("bs-navbar-item", template_4);
class template_5 extends HTMLElement {
  constructor() {
    super();
    // element created
  }
  customOnload() {}

  connectedCallback() {
    document.addEventListener(
      "render",
      function () {
        ccHandler.bind(this, "/template/bs-navbar.html", this.customOnload)();
      }.bind(this, self),
      { once: true }
    );
  }

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return [
      /* array of attribute names to monitor for changes */
    ];
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
customElements.define("bs-navbar", template_5);
