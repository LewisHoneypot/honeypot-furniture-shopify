class SideDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector('[id^="Drawer-Overlay-"]')?.addEventListener(
      "click",
      this.close.bind(this)
    );
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    if (!this.dataset.moved) document.body.appendChild(this);
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
    });

    if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
      this.addEventListener(
        "transitionstart",
        () => {
          document.body.classList.add("drawer--opening");
          document.body.classList.remove("drawer--open", "drawer--closing");
        },
        { once: true }
      );

      this.addEventListener(
        "transitionend",
        () => {
          document.body.classList.remove("drawer--opening", "drawer--closing");
          document.body.classList.add("drawer--open");
        },
        { once: true }
      );
    }

    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this;
        const focusElement =
          this.querySelector(".search__input") ||
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close") ||
          this.querySelector(".popup__input");
        trapFocus(containerToTrapFocusOn, focusElement);
        if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
          document.body.classList.remove("drawer--opening", "drawer--closing");
          document.body.classList.add("drawer--open");
        }
      },
      { once: true }
    );
    document.body.classList.add("o-h");
  }

  close() {
    this.classList.remove("active");
    if (this.activeElement && !this.activeElement.closest("sticky-add-to-cart"))
      removeTrapFocus(this.activeElement);
    document.body.classList.remove("o-h");

    if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
      this.addEventListener(
        "transitionstart",
        () => {
          document.body.classList.add("drawer--closing");
          document.body.classList.remove("drawer--opening", "drawer--open");
        },
        { once: true }
      );

      this.addEventListener(
        "transitionend",
        () => {
          document.body.classList.remove(
            "drawer--closing",
            "drawer--opening",
            "drawer--open"
          );
        },
        { once: true }
      );
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("side-drawer", SideDrawer);

class LookbookDrawer extends SideDrawer {
  constructor() {
    super();
  }

  load() {
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      this.querySelector(".side-drawer").appendChild(content.firstElementChild);
    }
  }

  open(triggeredBy) {
    this.load();
    super.open(triggeredBy);
  }
}
customElements.define("lookbook-drawer", LookbookDrawer);

class SideDrawerOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    let checkLoad = true;
    button.addEventListener("click", () => {
      const drawer = document.querySelector(
        this.getAttribute("data-side-drawer")
      );
      const drawerDesktop = document.querySelector(
        this.getAttribute("data-side-drawer-desktop")
      );
      if (checkLoad && drawer.querySelector(".url__data")) {
        checkLoad = false;
        const $thisData = drawer;
        const urlStyle =
          $thisData.querySelector(".url__data").dataset.urlStyleSheet;

        buildStyleSheet(urlStyle, $thisData);
      }
      if (drawer) drawer.open(button);
      if (drawerDesktop) drawerDesktop.open(button);
    });
  }
}
customElements.define("side-drawer-opener", SideDrawerOpener);

class ProtectionDrawerOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const drawer = document.querySelector(
        this.getAttribute("data-side-drawer")
      );
      drawer.classList.add("animate", "active");
    });
  }
  show() {
    this.section.classList.remove("d-none");
    document.body.classList.add("before-you-leave__show", "o-h");
    setTimeout(() => {
      this.drawer.classList.add("active");
    }, 100);
  }
}
customElements.define("protection-drawer-opener", ProtectionDrawerOpener);

class LookbookDrawerOpener extends SideDrawerOpener {
  constructor() {
    super();
  }
}
customElements.define("lookbook-drawer-opener", LookbookDrawerOpener);

class PageDrawerOpener extends SideDrawerOpener {
  constructor() {
    super();
  }
}
customElements.define("page-drawer-opener", PageDrawerOpener);
