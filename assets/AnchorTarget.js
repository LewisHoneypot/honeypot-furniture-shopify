class AnchorTarget extends HTMLElement {
  constructor() {
    super();

    const buttons = document.querySelectorAll("[data-anchor]");

    if (!buttons) return;
    buttons.forEach((button) => {
      const section = button.closest("[data-anchor-container]"),
        sectionHeight = section.offsetHeight;

      button.addEventListener("click", () => {
        window.scrollTo({
          top: sectionHeight,
          behavior: "smooth",
        });
      });
    });
  }
}
customElements.define("anchor-target", AnchorTarget);
