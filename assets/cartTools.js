// cart tool
class CartTool extends HTMLElement {
  constructor() {
    super();
    const buttons = this.querySelectorAll(".cartTool-item");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = button.dataset.popup;
        document.getElementById(id).classList.add("show");
        document.querySelector(".previewCart").classList.add("active-tool");
      });
    });

    document
      .querySelector(`.previewCart .drawer__overlay`)
      ?.addEventListener("click", (event) => {
        document
          .querySelector(".popup-toolDown.show")
          ?.classList.remove("show");
        document.querySelector(".previewCart").classList.remove("active-tool");
      });
  }
}
customElements.define("cart-item-tool", CartTool);

class CartCancel extends HTMLElement {
  constructor() {
    super();

    this.querySelector("button").addEventListener("click", (event) => {
      document.querySelector(".popup-toolDown.show")?.classList.remove("show");
      document.querySelector(".previewCart").classList.remove("active-tool");
    });
  }
}
customElements.define("cart-cancel-popup", CartCancel);
