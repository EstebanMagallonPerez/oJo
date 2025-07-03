const updateEvent = new Event("oJoUpdate");

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
class WatchedObject {
  constructor(obj) {
    var proxy = new Proxy(obj, {
      set(target, prop, value, receiver) {
        const oldVal = target[prop];
        target[prop] = value;
        if (oldVal !== value) {
          // Dispatch oJoUpdate with a reference to the object (or a unique key if needed)
          document.dispatchEvent(
            new CustomEvent("oJoUpdate", { detail: { target: receiver } })
          );
        }
        return value;
      },
    });
    return proxy;
  }
}

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
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

function handleRenderEvent() {
  var template = getTemplate(this.filename);
  mergeAttributes(template, this);
  if (template.getElementsByTagName("slot").length > 0) {
    var slot = template.getElementsByTagName("slot")[0].parentNode;
    template.getElementsByTagName("slot")[0].remove();
    Array.from(this.children).forEach((child) => {
      slot.appendChild(child);
    });
  }
  if (template.children.length == 0) {
    this.innerHTML = template.innerHTML;
  } else {
    Array.from(template.children).forEach((child) => {
      this.appendChild(child);
    });
  }
}

function recursiveTraverse(node, parent) {
  let trimmedText = node.textContent.trim();
  // Check for attributes with {{varName}} syntax
  if (node.hasAttributes()) {
    for (let attr of node.attributes) {
      const regex = /{{.*?}}/gm;
      const found = attr.value.match(regex);
      if (found !== null) {
        for (let i = 0; i < found.length; i++) {
          const varName = found[i].replace(/[{}]/g, "").trim();
          if (!parent.updateDict[varName]) {
            parent.updateDict[varName] = [];
          }
          parent.updateDict[varName].push({
            node: node,
            attributeName: attr.name,
            baseValue: attr.value,
            updateType: "attribute",
          });
        }
      }
    }
  }
  if (node.children.length === 0) {
    if (trimmedText !== undefined && trimmedText.trim() !== "") {
      const regex = /{{.*?}}/gm;
      const found = node.textContent.match(regex);
      if (found !== null) {
        for (let i = 0; i < found.length; i++) {
          const varName = found[i].replace(/[{}]/g, "").trim();
          if (!parent.updateDict[varName]) {
            parent.updateDict[varName] = [];
          }
          parent.updateDict[varName].push({
            node: node,
            updateType: "text",
            baseValue: node.textContent,
          });
        }
      }
    }
  }
  for (let i = 0; i < node.children.length; i++) {
    recursiveTraverse.call(this, node.children[i], parent);
  }
}
function updateData(data) {
  for (var key in data) {
    if (this.updateDict[key]) {
      this.updateDict[key].forEach((updateInfo) => {
        if (updateInfo.updateType === "text") {
          updateInfo.node.textContent = updateInfo.baseValue.replace(
            /{{.*?}}/g,
            data[key] || ""
          );
        } else if (updateInfo.updateType === "attribute") {
          if (updateInfo.baseValue !== undefined) {
            updateInfo.node.setAttribute(
              updateInfo.attributeName,
              updateInfo.baseValue.replace(/{{.*?}}/g, data[key] || "")
            );
          }
        }
      });
    }
  }
  // After all updates, replace any remaining handlebars (e.g., {{id}}) with ""
  for (let key in this.updateDict) {
    this.updateDict[key].forEach((updateInfo) => {
      if (updateInfo.updateType === "text") {
        updateInfo.node.textContent = updateInfo.node.textContent.replace(
          /{{.*?}}/g,
          ""
        );
      } else if (updateInfo.updateType === "attribute") {
        updateInfo.node.setAttribute(
          updateInfo.attributeName,
          updateInfo.node
            .getAttribute(updateInfo.attributeName)
            .replace(/{{.*?}}/g, "")
        );
      }
    });
  }
}

function handleOjoPrepare() {
  var dataName = this.getAttribute("data-template");
  var data;
  let temp = this;
  while (dataName == undefined && temp != null && temp.tagName != "HTML") {
    dataName = temp.getAttribute("data-template");
    temp = temp.parentNode;
  }

  if (dataName !== null) {
    eval("data = " + dataName + ";");
    if (Array.isArray(data)) {
      data.forEach((item) => {
        let newNode = this.cloneNode(true);
        newNode.setAttribute(
          "data-template",
          dataName + "[" + data.indexOf(item) + "]"
        );
        this.parentNode.appendChild(newNode);
      });
      this.remove();
      return; // Don't continue if replaced by clones
    }
  }
  this.handleRenderEvent();
  this.prepareForUpdates();
  if (typeof this.callUpdate === "function") {
    this.callUpdate(dataName);
  }
  this.customOnload();
}
