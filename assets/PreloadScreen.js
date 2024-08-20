class PreloadScreen extends HTMLElement {
  constructor() {
    super();

    document.addEventListener("page:loaded", () => {
      setTimeout(() => {
        this.setAttribute("loaded", true);
      }, 300);
    });

    document.addEventListener(
      "pointermove",
      () => {
        document.body.classList.add("function__show");
      },
      { once: true }
    );
  }
}
customElements.define("preload-screen", PreloadScreen);
