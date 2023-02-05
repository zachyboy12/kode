let nextid = 1;

// This is the #1 most important thing in VD: The VElement class!
class VElement {
  constructor(
    attributes = null,
    children = [],
    innerHTML = "",
    innerText = ""
  ) {
    this.updateDelay = 1;
    this.updateAlways = true;
    this.parent = "VDparent";
    this.children = children;
    this.html = innerHTML;
    this.text = innerText;
    if (attributes) {
      this.attributes = attributes;
    } else {
      this.attributes = {};
    }
    this.id = `__${nextid}__`;
    nextid++;
    this.oncreate();
    let vdom = this.render();
    const parent = document.getElementById(this.parent);
    parent.insertAdjacentHTML(
      "beforeend",
      '<div id="' + this.id + '">' + vdom + "</div>"
    );
    let element = document.getElementById(this.id);
    this.renderedChildren = element.childNodes;
    this.renderedElement = document.getElementById(this.id);
    this.afterRender();
    element.addEventListener("abort", (event) => {
      this.onEvent(event.key);
    });
    element.addEventListener("animationcancel", (event) => {
      this.onEvent(event.key);
    });
    element.addEventListener("animationend", (event) => {
      this.onEvent(event.key);
    });
    element.addEventListener("abort", (event) => {
      this.onEvent(event.key);
    });
    // TODO: Continue adding event listeners to every event
    if (this.updateAlways) {
      let intervalId = setInterval(() => {
        if (!this.updateAlways) {
          clearInterval(intervalId);
        }
        vdom = this.render();
        document.getElementById(this.id).remove();
        parent.insertAdjacentHTML(
          "beforeend",
          '<div id="' + this.id + '">' + vdom + "</div>"
        );
        this.update();
      }, this.updateDelay * 1000);
    }
    setInterval(() => {
      if (this.html !== this.element.innerHTML) {
        this.html = this.element.innerHTML;
      }
      if (this.text !== this.element.innerText) {
        this.element.innerText = this.text;
      }
      if (this.attributes !== this.element.attributes) {
        for (let key in this.attributes) {
          this.element.setAttribute(key, this.attributes[key]);
        }
      }
    });
  }

  render() {
    return "";
  }

  oncreate() {}

  update() {}

  onEvent(event) {}

  afterRender() {}
}

function group(vElement, number) {
  if (!number && number !== 0) {
    number = 2;
  }
  if (number < 2) {
    throw new TypeError("Too little number of VElements.");
  }
  for (let i = 0; i < number; i++) {
    new vElement();
  }
}

function renderType(vElement) {
  window[vElement.name + "__"] = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      setTimeout(() => {
        let element = new vElement(
          this.attributes,
          this.childNodes,
          this.innerHTML,
          this.innerText
        );
        element.element = this;
        element.attributes = this.attributes;
        window[element.id] = element;
      }, 1);
    }
  };
  customElements.define(
    vElement.name.toLowerCase() + "-",
    window[vElement.name + "__"]
  );
}
