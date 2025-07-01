const renderEvent = new Event("render");
const updateEvent = new Event("updateData");
const initEvent = new Event("initData");
storedTemplates = {};
proxyBackedVariables = {};

document.addEventListener("DOMContentLoaded", function () {
  document.dispatchEvent(renderEvent);
});

function interpolateTemplate(element, data) {
  // Replace placeholders in attributes
  for (let attr of Array.from(element.attributes)) {
    Object.keys(data).forEach((key) => {
      element.setAttribute(
        attr.name,
        attr.value.replaceAll("{{" + key + "}}", data[key])
      );
    });
  }
  nodeList = [];
  [...element.childNodes].forEach((node) => {
    if (
      node.innerHTML !== undefined &&
      node.innerHTML !== null &&
      node.innerHTML.trim() !== ""
    ) {
      Object.keys(data).forEach((key) => {
        if (node.innerHTML.includes("{{" + key + "}}")) {
          nodeList.push("{{" + key + "}}");
        }
        node.innerHTML = node.innerHTML.replaceAll(
          "{{" + key + "}}",
          "<span data-reference='" + key + "'>" + data[key] + "</span>"
        );
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      nodeList = interpolateTemplate(node, data);
      console.log("nodeList1 is:", nodeList);
    }
  });
  nodeList.push("");
  nodeList = nodeList.filter(function (element) {
    return element !== undefined;
  });
  const stringToAdd = element.tagName + ">";

  nodeList = nodeList.map((element) => stringToAdd + element);
  return nodeList;
}

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

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

// Handler for 'render' event for custom elements
function handleRenderEvent(self, templateName) {
  // this function handles moving the template from the file system to the DOM
  // and merging attributes from the template to the custom element
  return function () {
    var template = getTemplate(templateName);
    // Save the original template HTML for future updates (before any interpolation)
    if (!self._originalTemplateHTML) {
      self._originalTemplateHTML = template.innerHTML;
    }
    mergeAttributes(template, self);
    if (template.getElementsByTagName("slot").length > 0) {
      var slot = template.getElementsByTagName("slot")[0].parentNode;
      template.getElementsByTagName("slot")[0].remove();
      Array.from(self.children).forEach((child) => {
        slot.appendChild(child);
      });
    }
    Array.from(template.children).forEach((child) => {
      self.appendChild(child);
    });
    if (typeof self.customOnload === "function") {
      self.customOnload();
    }
  };
}

// Handler for 'initData' event for custom elements
function handleInitDataEvent(self) {
  return function () {
    const templateData = self.getAttribute("data-template");
    var data;
    if (templateData) {
      if (templateData.trim().startsWith("{")) {
        data = new Function(`return (${templateData})`)(); // safe-ish eval
      } else {
        eval("data = " + templateData);
        for (var i = 0; i < data.length; i++) {
          let tempNode = self.cloneNode(true);
          tempNode.setAttribute("data-template", templateData + "[" + i + "]");
          self.insertAdjacentElement("beforebegin", tempNode);
        }
        if (data.length > 1) {
          self.remove();
        }
      }
    }
    if (data != null && data != undefined) {
      findList = interpolateTemplate(self, data);
      console.log("findList is:", findList);
    }
  };
}

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// MutationObserver to debounce and dispatch initData after DOM settles
(function setupInitDataMutationObserver() {
  const DEBOUNCE_DELAY = 10; // ms
  const debouncedInit = debounce(() => {
    document.dispatchEvent(initEvent);
  }, DEBOUNCE_DELAY);
  const observer = new MutationObserver(() => {
    debouncedInit();
  });
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    });
  }
})();
class template_0 extends HTMLDivElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-carousel-caption.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    ;
  }
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-carousel-caption", template_0, { extends: "div" });class template_1 extends HTMLDivElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-carousel-container.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    
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
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-carousel-container", template_1, { extends: "div" });class template_2 extends HTMLDivElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-carousel-item.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    ;
  }
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-carousel-item", template_2, { extends: "div" });class template_3 extends HTMLDivElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-container.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    ;
  }
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-container", template_3, { extends: "div" });class template_4 extends HTMLLIElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-navbar-item.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    ;
  }
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-navbar-item", template_4, { extends: "li" });class template_5 extends HTMLElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-navbar.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    ;
  }
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-navbar", template_5, { extends: "nav" });class template_6 extends HTMLElement {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "/template/bs-section.html"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    ;
  }
  connectedCallback() {
    // Add updateData event listener when element is connected
    this._updateDataHandler = function () {
      // Get latest data from data-template attribute
      const templateData = this.getAttribute("data-template");
      let data;
      if (templateData) {
        if (templateData.trim().startsWith("{")) {
          data = new Function(`return (${templateData})`)();
        } else {
          eval("data = " + templateData);
        }
      }
      if (data != null && data != undefined) {
        interpolateTemplate(this, data);
      } else {
      }
    }.bind(this);
    document.addEventListener("updateData", this._updateDataHandler);
  }

  disconnectedCallback() {
    // Remove updateData event listener when element is disconnected
    if (this._updateDataHandler) {
      document.removeEventListener("updateData", this._updateDataHandler);
    }
    // browser calls this method when the element is removed from the document
    // (can be called many times if an element is repeatedly added/removed)
  }

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != newValue) {
      if (updateEvent.eventPhase == 0) {
        document.dispatchEvent(updateEvent);
      }
    }
  }
  // there can be other element methods and properties
}
customElements.define("bs-section", template_6, { extends: "section" });