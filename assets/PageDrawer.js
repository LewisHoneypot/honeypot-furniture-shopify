class PageDrawer extends HTMLElement {
  constructor() {
    super();

    this.component = this;
    this.inner = this.querySelector('[id^="Drawer-Inner-"]');
    this.overlay = this.querySelector('[id^="Drawer-Overlay-"]');
    this.breakpoints = this.dataset.breakpoint.split(",");

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector('[id^="Drawer-Overlay-"]')?.addEventListener(
      "click",
      this.close.bind(this)
    );

    this.init();
  }

  init() {
    let bpoint;
    let _component = this.dataset.classComponent.split(" ");
    let _inner = this.dataset.classInner.split(" ");
    let _overlay = this.dataset.classOverlay.split(" ");
    let popup = this.dataset.sidebarType;

    this.breakpoints.forEach((breakpoint) => {
      switch (breakpoint) {
        case "xs":
          bpoint = "(max-width: 550px)";
          break;
        case "sm":
          bpoint = "(max-width: 749px)";
          break;
        case "md":
          bpoint = "(max-width: 989px)";
          break;
        case "lg":
          bpoint = "(max-width: 1199px)";
          break;
      }
    });

    if (popup == "true") {
      this.toggleClass(this.component, _component, true);
      this.toggleClass(this.inner, _inner, true);
      this.toggleClass(this.overlay, _overlay, true);
    } else if (window.matchMedia(bpoint).matches) {
      this.toggleClass(this.component, _component, true);
      this.toggleClass(this.inner, _inner, true);
      this.toggleClass(this.overlay, _overlay, true);
    } else {
      this.toggleClass(this.component, _component, false);
      this.toggleClass(this.inner, _inner, false);
      this.toggleClass(this.overlay, _overlay, false);
    }

    new ResizeObserver((entries) => {
      if (popup == "true") {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.inner, _inner, true);
        this.toggleClass(this.overlay, _overlay, true);
      } else if (window.matchMedia(bpoint).matches) {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.inner, _inner, true);
        this.toggleClass(this.overlay, _overlay, true);
      } else {
        this.toggleClass(this.component, _component, false);
        this.toggleClass(this.inner, _inner, false);
        this.toggleClass(this.overlay, _overlay, false);
      }
    }).observe(document.body);
  }

  toggleClass(element, c, check) {
    switch (check) {
      case true:
        element.classList.add(...c);
        break;
      case false:
        element.classList.remove(...c);
        break;
    }
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
    });
    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this;
        const focusElement =
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close");
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );
    document.body.classList.add("o-h");
  }

  close() {
    this.classList.remove("active");
    removeTrapFocus(this.activeElement);
    document.body.classList.remove("o-h");
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("page-drawer", PageDrawer);
