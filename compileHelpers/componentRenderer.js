class CLASSNAME_REPLACE extends HTML_ELEMENT_TYPE {
  updater = null;
  filename = "FILENAME_REPLACE";

  prepareForUpdates() {
    this.updateDict = {};
    this.recursiveTraverse(this, this);
  }
  callUpdate(dataName) {
    var data;
    if (dataName !== null) {
      eval("data = " + dataName + ";");
      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.updateData(item);
        });
      } else {
        this.updateData(data);
      }
    }
  }
  constructor() {
    // Always call super first in constructor
    super();
    this.updateDict = {};
    this.handleRenderEvent = handleRenderEvent.bind(this);
    this.recursiveTraverse = recursiveTraverse.bind(this);
    this.updateData = updateData.bind(this);
    this.callUpdate = this.callUpdate.bind(this);
    setTimeout(handleOjoPrepare.bind(this), 0);
    document.addEventListener("oJoUpdate", (event) => {
      var dataName = this.getAttribute("data-template");
      let temp = this;
      while (dataName == undefined && temp != null && temp.tagName != "HTML") {
        dataName = temp.getAttribute("data-template");
        temp = temp.parentNode;
      }

      var data = null;
      eval("data = " + dataName);
      if (event.detail !== undefined) {
        if (event.detail.target === data) {
          this.callUpdate(dataName);
        }
      } else {
        this.callUpdate(dataName);
      }
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    setTimeout(() => {
      CUSTOM_ONLOAD;
    }, 0);
  }
  connectedCallback() {}

  disconnectedCallback() {}

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
  // there can be other element methods and properties
}
