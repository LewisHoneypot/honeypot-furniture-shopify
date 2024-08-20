class NewsletterForm extends HTMLElement {
  constructor() {
    super();
    this.querySelector(".form--check label").addEventListener(
      "click",
      this.onClickChecked.bind(this)
    );
  }

  onClickChecked(e) {
    e.target.closest(".form--check").querySelector("input").checked
      ? this.querySelector(".newsletter-form__button").setAttribute(
        "disabled",
        true
      )
      : this.querySelector(".newsletter-form__button").removeAttribute(
        "disabled"
      );
  }
}
customElements.define("form-has-check", NewsletterForm);
