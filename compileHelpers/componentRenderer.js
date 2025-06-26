class CLASSNAME_REPLACE extends HTML_ELEMENT_TYPE {
  constructor() {
    // Always call super first in constructor
    super();
    document.addEventListener(
      "render",
      function () {
        var template = getTemplate("FILENAME_REPLACE");
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
    CUSTOM_ONLOAD;
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
