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
