function interpolateTemplate(element, data) {
  // Replace placeholders in attributes
  console.log(element, data);
  for (let attr of Array.from(element.attributes)) {
    Object.keys(data).forEach((key) => {
      element.setAttribute(
        attr.name,
        attr.value.replaceAll("{{" + key + "}}", data[key])
      );
    });
  }
  [...element.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      Object.keys(data).forEach((key) => {
        node.textContent = node.textContent.replaceAll(
          "{{" + key + "}}",
          data[key]
        );
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      interpolateTemplate(node, data);
    }
  });
}

const renderEvent = new Event("render");
const updateEvent = new Event("updateText");

document.addEventListener("DOMContentLoaded", function () {
  document.dispatchEvent(renderEvent);
  document.dispatchEvent(updateEvent);
});

storedTemplates = {};
function getTemplate(fileName) {
  if (Object.hasOwn(storedTemplates, fileName) == false) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", fileName, false); // false for synchronous request
    xmlHttp.send(null);
    var html = xmlHttp.responseText;
    let res = htmlToElement(html);
    storedTemplates[fileName] = res;
  }
  return storedTemplates[fileName].cloneNode(true);
}

function mergeAttributes(fromNode, toNode) {
  for (let attr of fromNode.attributes) {
    const name = attr.name;
    const value = attr.value;

    const existing = toNode.getAttribute(attr.name) || "";
    const merged = new Set([
      ...existing.trim().split(/\s+/),
      ...value.trim().split(/\s+/),
    ]);
    toNode.setAttribute(name, [...merged].filter(Boolean).join(" "));
  }
}

function fillTemplate(template, data) {
  const regex = /\{\{\\w+\}\}/gm;
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
  template.innerHTML = html;
  return template.content.firstChild;
}

function deepWatch(obj, onChange) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (typeof val === "object" && val !== null) {
        return deepWatch(val, onChange); // recurse into nested objects
      }
      return val;
    },
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) {
        onChange();
      }
      return result;
    },
  });
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
      "Internal : " +
      value +
      ",set " +
      key +
      "(val) {this." +
      key +
      "Internal = val; this.listener(val);},get " +
      key +
      "() {return this." +
      key +
      "Internal;}";
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
class template_0 extends HTMLDivElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-carousel-caption.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    ;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-carousel-caption", template_0, { extends: "div" });class template_1 extends HTMLDivElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-carousel-container.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    
  let id = this.getAttribute("id")
  let carouselItems = this.querySelectorAll("[is=bs-carousel-item]");
  var button = document.createElement("button")
  button.setAttribute("type", "button");
  let one = document.querySelectorAll(".carousel-indicators");
  for (var i = 0; i < carouselItems.length; i++) {
    let tempButton = button.cloneNode(true)
    if (i == 0) {
      tempButton.setAttribute("aria-current", "true");
      tempButton.setAttribute("class", "active");
      tempButton.setAttribute("aria-label", "slide" + i + 1);
    }
    tempButton.setAttribute("data-bs-slide-to", "" + i);
    tempButton.setAttribute("data-bs-target", id);
    one[0].appendChild(tempButton)
  };
;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-carousel-container", template_1, { extends: "div" });class template_2 extends HTMLDivElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-carousel-item.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    ;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-carousel-item", template_2, { extends: "div" });class template_3 extends HTMLDivElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-container.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    ;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-container", template_3, { extends: "div" });class template_4 extends HTMLLIElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-navbar-item.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    ;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-navbar-item", template_4, { extends: "li" });class template_5 extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-navbar.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    ;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-navbar", template_5, { extends: "nav" });class template_6 extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/bs-section.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    ;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-section", template_6, { extends: "section" });class template_7 extends HTMLTableRowElement {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("/template/v-task.html");
        mergeAttributes(template, this);
        if (template.getElementsByTagName("slot").length > 0) {
          var slot = template.getElementsByTagName("slot")[0].parentNode;
          template.getElementsByTagName("slot")[0].remove();
          Array.from(this.children).forEach((child) => {
            slot.appendChild(child);
          });
        }
        Array.from(template.children).forEach((child) => {
          this.appendChild(child);
        });
        this.customOnload();
      }.bind(this, self),
      { once: true }
    );
    document.addEventListener(
      "updateText",
      function () {
        console.log("updating");
        const templateData = this.getAttribute("data-template");

        var data;
        if (templateData) {
          console.log("updating", this);
          console.log("templateData", templateData);
          if (templateData.trim().startsWith("{")) {
            data = new Function(`return (${templateData})`)(); // safe-ish eval
            console.log("in if", data);
          } else {
            eval("data = " + templateData);
            for (var i = 0; i < data.length; i++) {
              let tempNode = this.cloneNode(true);
              tempNode.setAttribute(
                "data-template",
                templateData + "[" + i + "]"
              );
              this.insertAdjacentElement("beforebegin", tempNode);
            }
            console.log(data);
            if (data.length > 1) {
              this.remove();
            }
          }
        }
        if (data != null && data != undefined) {
          interpolateTemplate(this, data);
        }
      }.bind(this, self)
    );
  }

  customOnload() {
    
    console.log("loaded")
;
  }
  connectedCallback() {}

  disconnectedCallback() {
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }
  logger() {
    console.log("we are logging some stuff", this);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        console.log(updateEvent.eventPhase);
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("v-task", template_7, { extends: "tr" });