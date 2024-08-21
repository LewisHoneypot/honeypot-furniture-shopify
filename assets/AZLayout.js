class AZLayout extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.wrapper = document.querySelector('[id^="AZWrapper-"]');
    this.navigation = document.querySelector('[id^="AZTable-"]');

    if (!this.wrapper || !this.navigation) return;

    if (this.navigation.querySelector("button")) {
      this.navigation.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", this.onClickHandler.bind(this));
      });
    }
  }

  onClickHandler(event) {
    let letter = event.target.dataset.id;

    this.navigation.querySelectorAll("li").forEach((element) => {
      if (element == event.target.closest("li")) {
        event.target.closest("li").classList.add("active");
      } else {
        element.classList.remove("active");
      }
    });

    this.wrapper.querySelectorAll(".az-group").forEach((element) => {
      element.classList.remove("d-block");
      element.classList.add("d-none");
    });

    if (letter != undefined && letter != null) {
      this.wrapper.classList.remove("active-all");
      this.wrapper
        .querySelector(`[data-letter="${letter}"]`)
        .classList.remove("d-none");
      this.wrapper
        .querySelector(`[data-letter="${letter}"]`)
        .classList.add("d-block");
    } else {
      if (this.wrapper.classList.contains("hide-no__brand")) {
        this.wrapper.querySelectorAll(".az-group").forEach((element) => {
          if (element.querySelector(".az-group__list")?.childNodes.length > 0) {
            element.classList.add("d-block");
            element.classList.remove("d-none");
          }
        });
      } else {
        this.wrapper.classList.add("active-all");
      }
    }
  }
}
customElements.define("az-layout", AZLayout);
