class MapTemplate extends HTMLElement {
  constructor() {
    super();

    this.map = this.querySelector("iframe");
  }

  init() {
    this.map.addEventListener(
      "load",
      function () {
        this.dispatchEvent(
          new CustomEvent("loadingEnd", {
            detail: {
              element: this.map,
              parent: this,
            },
          })
        );

        this.setAttribute("loaded", true);
      }.bind(this)
    );
  }

  execute() {
    this.setIframeSrc();
  }

  setIframeSrc() {
    let map_src = `https://maps.google.com/maps?z=${this.dataZoom}&t=${this.dataType
      }&q=${this.dataLocation.replace(/"/g, "")}&ie=UTF8&&output=embed`;

    this.map.src = map_src;
    this.map.removeAttribute("srcdoc");
  }

  loadIframeSrc() {
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.dispatchEvent(
              new CustomEvent("loadingStart", {
                detail: {
                  element: this.map,
                  parent: this,
                },
              })
            );

            this.execute();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -100px 0px",
      }
    ).observe(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    oldValue !== newValue &&
      (Shopify.designMode ? this.execute() : this.loadIframeSrc());
  }

  connectedCallback() {
    this.init();
  }

  static get observedAttributes() {
    return ["data-zoom", "data-type", "data-location"];
  }

  get dataZoom() {
    return this.getAttribute("data-zoom");
  }

  get dataType() {
    return this.getAttribute("data-type");
  }

  get dataLocation() {
    return this.getAttribute("data-location");
  }

  set dataZoom(zoom) {
    this.setAttribute("data-zoom", zoom);
  }

  set dataType(type) {
    this.setAttribute("data-type", type);
  }

  set dataLocation(location) {
    this.setAttribute("data-location", location);
  }
}

customElements.define("map-template", MapTemplate);
