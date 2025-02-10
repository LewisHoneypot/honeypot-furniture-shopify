if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
    }

    async onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);

      // Add custom form data parsing if necessary
      /************************************************************/
      document.querySelectorAll('.all-wrpp-varit input').forEach(function (input) {
        if (!input.hasAttribute('disabled')) {
          var name = input.getAttribute('name');
          var value = input.value;

          var ipType = input.getAttribute('type');
          if (ipType !== 'radio') {
            if (ipType !== 'checkbox') {
              formData.append(name, value);
            } else {
              if (input.checked) {
                formData.append(name, value);
              }
            }
          }
        }
      });

      document.querySelectorAll('.all-wrpp-varit select').forEach(function (select) {
        if (!select.hasAttribute('disabled')) {
          var name = select.getAttribute('name');
          var value = select.value;

          formData.append(name, value);
        }
      });

      document.querySelectorAll('.all-wrpp-varit textarea').forEach(function (textarea) {
        if (!textarea.hasAttribute('disabled')) {
          var name = textarea.getAttribute('name');
          var value = textarea.value;

          formData.append(name, value);
        }
      });

      // swatch override
      document.querySelectorAll('.swt-checked input').forEach(function (input) {
        if (!input.hasAttribute('disabled')) {
          var name = input.getAttribute('name');
          var value = input.value;

          formData.append(name, value);
        }
      });
      /************************************************************/

      if (this.cart) {
        formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then(async (response) => {
          if (response.status) {
            publish(PUB_SUB_EVENTS.cartError, { source: 'product-form', productVariantId: formData.get('id'), errors: response.description, message: response.message });
            this.handleErrorMessage(response.description);

            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          }

          // Handle successful addition to cart
          if (this.cart) {
            const addedItemId = parseInt(formData.get('id'), 10); // Get the ID of the added item

            // Perform the Protection removal logic AFTER cart update
            setTimeout(async () => {
              const updatedCart = await this.getCart(); // Fetch the updated cart
              const addedItem = updatedCart.items.find((item) => item.id === addedItemId);

              if (addedItem && addedItem.product_type === "Sofas") {
                // console.log("Sofa added. Checking for Protection items to remove.");
                await this.removeProtectionItems(updatedCart);
              }
            }, 0);

            this.cart.renderContents(response);
          } else {
            window.location = window.routes.cart_url;
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    async removeProtectionItems(cart) {
      const protectionItems = cart.items.filter((item) => item.title.includes("Emmiera"));
      if (protectionItems.length === 0) {
        // console.log("No Protection items found to remove.");
        return;
      }

      await Promise.all(
        protectionItems.map((item) =>
          fetch("/cart/change.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.key, quantity: 0 }),
          })
        )
      );
      // console.log("Removed Protection items.");

      // Refresh the cart UI after Protection items are removed
      await this.refreshUI("#CartDrawer");
      await this.refreshUI(".cart-count-bubble");
    }

    async refreshUI(selector) {
      const response = await fetch(location.href);
      if (!response.ok) throw new Error("Failed to refresh UI");
      const html = await response.text();
      const tempDoc = document.createElement("div");
      tempDoc.innerHTML = html;
      const newContent = tempDoc.querySelector(selector);
      if (newContent) {
        document.querySelector(selector).innerHTML = newContent.innerHTML;
      }
    }

    async getCart() {
      const response = await fetch("/cart.json");
      if (!response.ok) throw new Error("Failed to fetch cart data");
      return response.json();
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}
