// button container auto scroll center when click
class ScrollContainerCenter extends HTMLElement {
  constructor() {
    super();

    this.buttonContainer = this.querySelector(".button-center-container");
    this.buttons = this.querySelectorAll(".button-center-item");

    this.onclick(this.buttons, this.buttonContainer);
  }

  onclick(buttons, scrollContainer) {
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        const screenWidth = window.innerWidth;
        const buttonRect = button.getBoundingClientRect();
        const buttonCenter = buttonRect.left + buttonRect.width / 2;
        const scrollAmount = buttonCenter - screenWidth / 2;
        setTimeout(() => {
          scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }, 200);
      })
    );
  }
}
customElements.define("scroll-container-center", ScrollContainerCenter);
