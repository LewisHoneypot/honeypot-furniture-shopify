class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector(".section-header");
    this.headerWrapper = this.closest(".header-wrapper");
    this.borderOffset =
      this.borderOffset || this.headerWrapper.classList.contains("b-bottom")
        ? 1
        : 0;

    let headerBottomPosition;

    if (this.headerWrapper.classList.contains("transparent")) {
      headerBottomPosition = parseInt(
        this.headerWrapper.getBoundingClientRect().bottom - this.borderOffset
      );
    } else {
      headerBottomPosition = parseInt(
        this.header.getBoundingClientRect().bottom - this.borderOffset
      );
    }

    document.documentElement.style.setProperty(
      "--header-bottom-position",
      `${headerBottomPosition}px`
    );

    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });

    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`o-h-${this.dataset.breakpoint}`);
    document.body.classList.add(`menu-mobile-show`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
  }
}
customElements.define("header-drawer", HeaderDrawer);
