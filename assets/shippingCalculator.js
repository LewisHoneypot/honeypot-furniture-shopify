class ShippingCalculator extends HTMLElement {
  constructor() {
    super();

    this.setupCountries();

    this.errors = this.querySelector("#ShippingCalculatorErrors");
    this.success = this.querySelector("#ShippingCalculatorSuccess");
    this.zip = this.querySelector("#address_zip");
    this.country = this.querySelector("#address_country");
    this.province = this.querySelector("#address_province");
    this.button = this.querySelector("#get-rates-submit");

    this.button.addEventListener("click", this.onSubmitHandler.bind(this));
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        "address_country",
        "address_province",
        {
          hideElement: "address_province_container",
        }
      );
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();

    this.errors.classList.add("hidden");
    this.success.classList.add("hidden");
    this.zip.classList.remove("invalid");
    this.country.classList.remove("invalid");
    this.province.classList.remove("invalid");
    this.button.classList.add("loading");
    this.button.setAttribute("disabled", true);

    const body = JSON.stringify({
      shipping_address: {
        zip: this.zip.value,
        country: this.country.value,
        province: this.province.value,
      },
    });
    let sectionUrl = `${routes.cart_url}/shipping_rates.json`;

    // remove double `/` in case shop might have /en or language in URL
    sectionUrl = sectionUrl.replace("//", "/");

    fetch(sectionUrl, { ...fetchConfig("javascript"), body })
      .then((response) => response.json())
      .then((parsedState) => {
        if (parsedState.shipping_rates) {
          this.success.classList.remove("hidden");
          this.success.innerHTML = "";

          parsedState.shipping_rates.forEach((rate) => {
            const child = document.createElement("p");
            child.innerHTML = `${rate.name}: ${rate.price} ${Shopify.currency.active}`;
            this.success.appendChild(child);
          });
        } else {
          let errors = [];
          Object.entries(parsedState).forEach(([attribute, messages]) => {
            errors.push(`${messages[0]}`);
          });

          this.errors.classList.remove("hidden");
          this.errors.querySelector(".errors").innerHTML = errors.join("; ");
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.button.classList.remove("loading");
        this.button.removeAttribute("disabled");
      });
  }
}
customElements.define("shipping-calculator", ShippingCalculator);
