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
    document.addEventListener("oJoPrepare", handleOjoPrepare.bind(this), {
      once: true,
    });
    document.addEventListener("oJoUpdate", (event) => {
      var dataName = this.getAttribute("data-template");
      this.callUpdate(dataName);
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    CUSTOM_ONLOAD;
  }
  connectedCallback() {}

  disconnectedCallback() {}

  static get observedAttributes() {
    return ["data-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {}
  // there can be other element methods and properties
}
