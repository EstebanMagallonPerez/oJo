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
  [...element.childNodes].forEach((node) => {
    if (
      node.innerHTML !== undefined &&
      node.innerHTML !== null &&
      node.innerHTML.trim() !== ""
    ) {
      Object.keys(data).forEach((key) => {
        node.innerHTML = node.innerHTML.replaceAll(
          "{{" + key + "}}",
          "<span data-reference='" + key + "'>" + data[key] + "</span>"
        );
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      interpolateTemplate(node, data);
    }
  });
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
      interpolateTemplate(self, data);
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
    console.log(
      "[LOG] Dispatching debounced initData event after DOM mutation"
    );
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
