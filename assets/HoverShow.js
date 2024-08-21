class HoverShow extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.button = this.querySelectorAll("[data-target]");
    this.data = this.querySelectorAll(".data-show");

    this.button.forEach((button) =>
      button.addEventListener("mouseenter", this.openEvent.bind(this))
    );
  }

  openEvent(event) {
    var checkButton = event.target.getAttribute("data-target");

    this.data.forEach((data) =>
      checkButton === data.id
        ? data.classList.add("active")
        : data.classList.remove("active")
    );
  }
}
customElements.define("hover-show", HoverShow);
