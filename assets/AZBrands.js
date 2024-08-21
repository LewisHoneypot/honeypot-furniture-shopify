class AZBrands extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.createObserver();
  }

  init() {
    this.wrapper = document.querySelector('[id^="AZWrapper-"]');
    this.navigation = document.querySelector('[id^="AZTable-"]');

    let list = this.getAttribute("data-brand");

    this.getAllBrands(list);
  }

  getAllBrands(list) {
    JSON.parse(list).forEach((vendor) => {
      let letter = vendor.letter,
        handle = vendor.handle,
        name = vendor.name,
        brand = `<a href="${handle}" class="d-block link link--text u-none">${name}</a>`,
        item = document.createElement("li"),
        brandGroup;

      item.classList.add("brand", "o-h", "center", "gradient");
      item.setAttribute("data-az-letter", letter);
      item.innerHTML = brand;

      if (this.isNumber(letter)) {
        brandGroup = this.wrapper.querySelector(
          `.az-group[data-letter="0-9"] ul`
        );
      } else {
        brandGroup = this.wrapper.querySelector(
          `.az-group[data-letter="${letter}"] ul`
        );
      }

      brandGroup.appendChild(item);
    });

    this.parseListBrand();
  }

  parseListBrand() {
    this.wrapper.querySelectorAll(".az-group").forEach((element) => {
      let letter = element.dataset.letter;

      if (element.querySelector(".az-group__list")?.childNodes.length > 0) {
        this.navigation
          .querySelector(`[data-letter="${letter}"]`)
          .classList.remove("disable");
        this.navigation
          .querySelector(`[data-letter="${letter}"]`)
          .classList.add("has-letter");

        if (this.wrapper.classList.contains("hide-no__brand")) {
          element.classList.add("d-block");
          element.classList.remove("d-none");
        }
      }
    });
  }

  isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  createObserver() {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(this);
            this.init();
          }
        });
      },
      { rootMargin: "0px 0px -200px 0px" }
    );

    observer.observe(this);
  }
}
customElements.define("az-brands", AZBrands);
