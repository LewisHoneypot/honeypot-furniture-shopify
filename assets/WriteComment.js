class WriteComment extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      document.body.classList.contains("w-c") ? this.hide() : this.show();
    });
  }

  show() {
    document.body.classList.add("w-c");
  }

  hide() {
    document.body.classList.remove("w-c");
  }
}
customElements.define("write-comment", WriteComment);
