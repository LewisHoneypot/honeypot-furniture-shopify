class BundlePriceTotal extends HTMLElement {
  constructor() {
    super();

    this.priceBeforeSales = this.querySelectorAll(
      ".price__sale .price-before--sale"
    );
    this.priceSalesTotal = this.querySelector(".price-sale-total");

    this.prices = this.querySelectorAll(".price__regular .price-item--regular");
    this.priceTotal = this.querySelector(".price-item-total");

    this.render(
      this.priceBeforeSales,
      this.priceSalesTotal,
      this.prices,
      this.priceTotal
    );
  }
  render(priceBeforeSales, priceSalesTotal, priceAfterSales, priceTotal) {
    const numberFormatter = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let totalSales = 0,
      totalPrice = 0;
    // Set value
    priceSalesTotal.closest(".price-item--regular").classList.add("d-none");

    priceBeforeSales?.forEach((price) => {
      if (price.innerText.trim() != "") {
        priceSalesTotal
          .closest(".price-item--regular")
          .classList.remove("d-none");

        const priceBeforeNumber = parseFloat(
          price.innerText.trim().slice(1).replace(/,/g, "")
        );
        totalSales += priceBeforeNumber;

        this.querySelectorAll(
          ".price__regular .price-item--regular:not(.price-after--sale)"
        ).forEach((priceBefore) => {
          const priceBeforeNumber = parseFloat(
            priceBefore.innerText.trim().slice(1).replace(/,/g, "")
          );
          totalSales += priceBeforeNumber;

          priceSalesTotal.innerHTML = `$${numberFormatter.format(totalSales)}`;
        });
      }
    });

    // Total
    priceAfterSales.forEach((price) => {
      const priceNumber = parseFloat(
        price.innerText.trim().slice(1).replace(/,/g, "")
      );
      totalPrice += priceNumber;
    });

    priceTotal.innerHTML = `$${numberFormatter.format(totalPrice)}`;
  }
}
customElements.define("bundle-price-total", BundlePriceTotal);

class BundleProducts extends HTMLElement {
  constructor() {
    super();

    this.cartDrawer = document.querySelector("cart-drawer");
    this.bundleButton = this.querySelector(".bundle__button");
    if (this.bundleButton)
      this.bundleButton.addEventListener(
        "click",
        this.onButtonClick.bind(this)
      );
  }

  onButtonClick(event) {
    event.preventDefault();

    const ids = this.querySelectorAll('[name="id"]');
    const items = {
      items: [...ids]
        .map((e) => e.value)
        .map((e) => ({
          id: e,
          quantity: 1,
        })),
    };

    if (document.body.classList.contains("template-cart")) {
      Shopify.postLink2(routes.cart_add_url, {
        parameters: {
          ...items,
        },
      });
      return;
    }

    this.handleErrorMessage();

    this.bundleButton.setAttribute("disabled", true);
    this.bundleButton.classList.add("loading");
    const sections = this.cartDrawer
      ? this.cartDrawer.getSectionsToRender().map((section) => section.id)
      : [];

    const body = JSON.stringify({
      ...items,
      sections: sections,
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig("javascript"), body })
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);
          return;
        }

        if (this.cartDrawer) {
          this.cartDrawer.renderContents(response);
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.bundleButton.classList.remove("loading");
        this.bundleButton.removeAttribute("disabled");
      });
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper =
      this.errorMessageWrapper ||
      this.querySelector(".product-form__error-message");

    if (this.errorMessageWrapper) {
      this.errorMessage =
        this.errorMessage ||
        this.errorMessageWrapper.querySelector(".product-form__error-message");
      this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    } else {
      if (errorMessage) {
        alert(errorMessage);
      }
    }
  }
}
customElements.define("bundle-products", BundleProducts);
