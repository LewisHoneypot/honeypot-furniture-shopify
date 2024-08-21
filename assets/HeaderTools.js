class HeaderMenu extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");

    document.addEventListener("page:loaded", () => {
      this.mediaHover = this.querySelectorAll(".banner__media-hover");
      if (!window.matchMedia("(max-width: 749px)").matches) {
        this.mediaHover?.forEach((e) => {
          if (e.querySelector(".data__media-hover")) {
            this.maskHover = e.querySelectorAll(".data__media-hover");
            this.maskHover?.forEach((mask) => {
              mask?.addEventListener("mouseenter", (event) => {
                e.classList.add("mask-hover");
              });

              mask?.addEventListener("mouseleave", (event) => {
                e.classList.remove("mask-hover");
              });
            });
          } else {
            e.classList.remove("banner__media-hover");
          }
        });
      }
    });
  }

  onToggle() {
    if (!this.header) return;
    if (this.header.classList.contains("transparent"))
      this.header.classList.toggle("transparent-hidden");

    if (
      document.documentElement.style.getPropertyValue(
        "--header-bottom-position-desktop"
      ) !== ""
    )
      return;
    document.documentElement.style.setProperty(
      "--header-bottom-position-desktop",
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}
customElements.define("header-menu", HeaderMenu);

class HeaderSubMenu extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");
  }
}
customElements.define("header-submenu", HeaderSubMenu);
