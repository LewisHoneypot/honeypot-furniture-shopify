class LookbookPoint extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.button = this.querySelector("button");
    this.button.addEventListener("mouseover", this.onMouseover.bind(this));
    this.onMouseLeave();
    this.button.addEventListener("click", this.onClickButtons.bind(this));
    this.createObserver();

    document.body.addEventListener("click", this.onBodyClick.bind(this));
    document.addEventListener("matchExtraLarge", this.close.bind(this));
    document.addEventListener("unmatchExtraLarge", this.load.bind(this));
  }

  load() {
    if (
      !this.getAttribute("loaded") &&
      window.matchMedia("(min-width: 1200px)").matches &&
      this.querySelector("template")
    ) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      this.querySelector(".lookbook__point-popup").appendChild(
        content.firstElementChild
      );
    }
  }

  onClickButtons(event) {
    if (this.querySelector(`.point-button:not(.point-style--classic)`)) {
      if (window.matchMedia("(max-width: 1024px)").matches) {
        const drawer = document.querySelector(
          this.getAttribute("data-side-drawer")
        );
        if (drawer) drawer.open(this.button);
      }
    } else if (this.querySelector(`.point-button.point-style--classic`)) {
      if (window.matchMedia("(max-width: 749px)").matches) {
        const drawer = document.querySelector(
          this.getAttribute("data-side-drawer")
        );
        if (drawer) drawer.open(this.button);
      }
    } else {
      if (window.matchMedia("(max-width: 1199px)").matches) {
        const drawer = document.querySelector(
          this.getAttribute("data-side-drawer")
        );
        if (drawer) drawer.open(this.button);
      }
    }
  }

  onMouseover() {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      const items = document.querySelectorAll("lookbook-point");

      items.forEach((item) => item.classList.remove("active"));
      this.open();
    }
  }

  onMouseLeave() {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      const items = document.querySelectorAll(".lookbook__point-popup");

      items.forEach((item) => {
        item.addEventListener("mouseleave", () => {
          if (this.classList.contains("active")) {
            this.classList.remove("active");
          }
        });
      });
    }
  }

  open() {
    this.classList.add("active");
  }

  close() {
    this.classList.contains("active") && this.classList.remove("active");
  }

  onBodyClick(event) {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      !this.contains(event.target) && this.close();
      document.body && this.close();
    }
  }

  createObserver() {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(this);
            this.load();
          }
        });
      },
      { rootMargin: "0px 0px -200px 0px" }
    );

    observer.observe(this);
  }
}
customElements.define("lookbook-point", LookbookPoint);
