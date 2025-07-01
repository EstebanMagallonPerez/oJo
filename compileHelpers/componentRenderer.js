class CLASSNAME_REPLACE extends HTML_ELEMENT_TYPE {
  updater = null;
  constructor() {
    // Always call super first in constructor
    super();
    // Use helper.js handlers for render and initData
    document.addEventListener(
      "render",
      handleRenderEvent(this, "FILENAME_REPLACE"),
      { once: true }
    );
    document.addEventListener("initData", handleInitDataEvent(this), {
      once: true,
    });
  }

  customOnload() {
    // No need to save _originalTemplateHTML here; it's now saved in handleRenderEvent
    CUSTOM_ONLOAD;
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
