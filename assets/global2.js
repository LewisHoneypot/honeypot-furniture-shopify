class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.input.addEventListener("change", this.onInputChange.bind(this));
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    if (event.target.name === "plus") {
      this.input.stepUp();
    } else {
      this.input.value == 1 ? (this.input.value = 0) : this.input.stepDown();
    }
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle("disabled", value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle("disabled", value >= max);
    }
  }
}
customElements.define("quantity-input", QuantityInput);

class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('button[type="reset"]');

    if (this.input) {
      this.input.form.addEventListener("reset", this.onFormReset.bind(this));
      this.input.addEventListener(
        "input",
        debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );
    }
  }

  toggleResetButton() {
    const resetIsHidden = this.resetButton.classList.contains("hidden");
    if (this.input.value.length > 0 && resetIsHidden) {
      this.resetButton.classList.remove("hidden");
    } else if (this.input.value.length === 0 && !resetIsHidden) {
      this.resetButton.classList.add("hidden");
    }
  }

  onChange() {
    this.toggleResetButton();
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm()) {
      this.input.value = "";
      this.input.focus();
      this.toggleResetButton();
    }
  }
}
customElements.define("search-form", SearchForm);

class ShowMoreButton extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector("button");
    button.addEventListener("click", (event) => {
      this.expandShowMore(event);
      const nextElementToFocus = event.target
        .closest(".parent-display")
        .querySelector(".show-more-item");
      if (
        nextElementToFocus &&
        !nextElementToFocus.classList.contains("hidden")
      ) {
        nextElementToFocus.querySelector("input").focus();
      }
    });
  }
  expandShowMore(event) {
    const parentDisplay = event.target
      .closest('[id^="Show-More-"]')
      .closest(".parent-display");
    const parentWrap = parentDisplay.querySelector(".parent-wrap");
    this.querySelectorAll(".label-text").forEach((element) =>
      element.classList.toggle("hidden")
    );
    parentDisplay
      .querySelectorAll(".show-more-item")
      .forEach((item) => item.classList.toggle("hidden"));
    this.classList.toggle("hidden");
  }
}
customElements.define("show-more-button", ShowMoreButton);

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

class StaingardDrawerOpener extends HTMLElement {
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
customElements.define("staingard-drawer-opener", StaingardDrawerOpener);

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
