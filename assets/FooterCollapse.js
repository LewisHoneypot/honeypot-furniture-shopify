class FooterCollapse extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.details = this.querySelector("details");
    this.summary = this.querySelector("summary");

    this.details.addEventListener(
      "keyup",
      (event) => event.code.toUpperCase() === "ESCAPE" && this.close()
    );
    this.summary.addEventListener("click", this.toggle.bind(this));
    document.addEventListener("matchMobile", this.close.bind(this));
    document.addEventListener("unmatchMobile", this.open.bind(this));

    if (!window.matchMedia("(max-width: 749px)").matches) {
      this.details.setAttribute("open", true);
    } else {
      if (this.dataset.open == undefined) this.details.removeAttribute("open");
    }
  }

  toggle(event) {
    event.preventDefault();
    event.target.closest("details").hasAttribute("open")
      ? this.close()
      : this.open();
  }

  open() {
    this.details.setAttribute("open", true);
  }

  close() {
    window.matchMedia("(max-width: 749px)").matches &&
      this.details.removeAttribute("open");
  }
}
customElements.define("footer-collapse", FooterCollapse);
