class CollapseCollection extends HTMLElement {
  constructor() {
    super();
    this.accordions = this.querySelectorAll(".item");

    this.init();
  }

  init() {
    this.openAccordion(this.accordions[0]);
    this.accordions.forEach((accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.addEventListener("click", () => {
        if (content.style.maxHeight) {
          this.closeAccordion(accordion);
        } else {
          this.accordions.forEach((accordion) =>
            this.closeAccordion(accordion)
          );
          this.openAccordion(accordion);
        }
      });

      this.resize(accordion);
    });
  }

  openAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion__content");
    accordion.classList.add("accordion__active");
    content.style.maxHeight = content.scrollHeight + "px";
  };

  closeAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion__content");
    accordion.classList.remove("accordion__active");
    content.style.maxHeight = null;
  };

  resize = (accordion) => {
    const content = accordion.querySelector(".accordion__content");

    window.addEventListener("resize", () => {
      if (accordion.classList.contains("accordion__active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  };
}

customElements.define("collapse-collection", CollapseCollection);
