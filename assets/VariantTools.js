class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();

    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }

    this.updateOthers();
  }

  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value
    );
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateOthers() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    if (this.nodeName == "VARIANT-RADIOS") {
      this.other = Array.from(
        this.closest("[id^=MainProduct-]").querySelectorAll("variant-radios")
      ).filter((selector) => {
        return selector != this;
      });
    } else {
      this.other = Array.from(
        this.closest("[id^=MainProduct-]").querySelectorAll("variant-selects")
      ).filter((selector) => {
        return selector != this;
      });
    }

    if (this.other.length) {
      const options = Array.from(this.querySelectorAll(".product-form__input"));
      const alterOptions = Array.from(
        this.other[0].querySelectorAll(".product-form__input")
      );

      if (options && alterOptions) {
        let selectedOption1;
        let selectedOption2;
        let selectedOption3;

        if (options[0]) {
          if (this.nodeName == "VARIANT-RADIOS") {
            selectedOption1 = Array.from(
              options[0].querySelectorAll("input")
            ).find((radio) => radio.checked).value;
            alterOptions[0].querySelector(
              `input[value="${selectedOption1}"]`
            ).checked = true;
          } else {
            selectedOption1 = options[0].querySelector("select").value;
            alterOptions[0].querySelector("select").value = selectedOption1;
          }

          alterOptions[0].querySelector("[data-header-option]").textContent =
            selectedOption1;
        }

        if (options[1]) {
          if (this.nodeName == "VARIANT-RADIOS") {
            selectedOption2 = Array.from(
              options[1].querySelectorAll("input")
            ).find((radio) => radio.checked).value;
            alterOptions[1].querySelector(
              `input[value="${selectedOption2}"]`
            ).checked = true;
          } else {
            selectedOption2 = options[1].querySelector("select").value;
            alterOptions[1].querySelector("select").value = selectedOption2;
          }

          alterOptions[1].querySelector("[data-header-option]").textContent =
            selectedOption2;
        }

        if (options[2]) {
          if (this.nodeName == "VARIANT-RADIOS") {
            selectedOption3 = Array.from(
              options[2].querySelectorAll("input")
            ).find((radio) => radio.checked).value;
            alterOptions[2].querySelector(
              `input[value="${selectedOption3}"]`
            ).checked = true;
          } else {
            selectedOption3 = options[2].querySelector("select").value;
            alterOptions[2].querySelector("select").value = selectedOption3;
          }

          alterOptions[2].querySelector("[data-header-option]").textContent =
            selectedOption3;
        }
      }
    }
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(
      `[id^="MediaGallery-${this.dataset.section}"]`
    );
    const mediaStickyGallery = document.getElementById(
      `MediaStickyAddToCart-${this.dataset.section}`
    );
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(
        `${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        true,
        this.currentVariant
      )
    );

    if (mediaStickyGallery) {
      mediaStickyGallery
        .querySelector("img")
        .setAttribute("src", this.currentVariant?.featured_image.src);
      mediaStickyGallery
        .querySelector("img")
        .setAttribute("srcset", this.currentVariant?.featured_image.src);
      mediaStickyGallery
        .querySelector("img")
        .setAttribute("alt", this.currentVariant?.featured_image.alt);
    }

    const modalContent = document.querySelector(
      `#ProductModal-${this.dataset.section} .product-media-modal__content`
    );
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(
      `[data-media-id="${this.currentVariant.featured_media.id}"]`
    );
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateShareUrl() {
    const shareButton = document.getElementById(
      `Share-${this.dataset.section}`
    );
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(
      `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-${this.dataset.section}-duplicate, #product-form-installment-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__input")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.innerText = input.getAttribute("value");
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace(
          "[value]",
          input.getAttribute("value")
        );
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  removeErrorMessage() {
    const section = this.closest("section");
    if (!section) return;

    const productForm = section.querySelector("product-form");
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    fetch(
      `${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection
        ? this.dataset.originalSection
        : this.dataset.section
      }`
    )
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections
        if (this.currentVariant.id !== requestedVariantId) return;

        const html = new DOMParser().parseFromString(responseText, "text/html");
        const destination = document.getElementById(
          `price-${this.dataset.section}`
        );
        const destinationSticky = document.getElementById(
          `price-sticky-${this.dataset.section}`
        );
        const source = html.getElementById(
          `price-${this.dataset.originalSection
            ? this.dataset.originalSection
            : this.dataset.section
          }`
        );
        const sourceSticky = html.getElementById(
          `price-sticky-${this.dataset.originalSection
            ? this.dataset.originalSection
            : this.dataset.section
          }`
        );
        const skuSource = html.getElementById(
          `Sku-${this.dataset.originalSection
            ? this.dataset.originalSection
            : this.dataset.section
          }`
        );
        const skuDestination = document.getElementById(
          `Sku-${this.dataset.section}`
        );
        const inventorySource = html.getElementById(
          `Inventory-${this.dataset.originalSection
            ? this.dataset.originalSection
            : this.dataset.section
          }`
        );
        const inventoryDestination = document.getElementById(
          `Inventory-${this.dataset.section}`
        );
        const options = Array.from(
          this.querySelectorAll(".product-form__input")
        );

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (sourceSticky && destinationSticky)
          destinationSticky.innerHTML = sourceSticky.innerHTML;
        if (inventorySource && inventoryDestination)
          inventoryDestination.innerHTML = inventorySource.innerHTML;
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle(
            "visibility-hidden",
            skuSource.classList.contains("visibility-hidden")
          );
        }

        const price = document.getElementById(`price-${this.dataset.section}`);
        const priceSticky = document.getElementById(
          `price-sticky-${this.dataset.section}`
        );

        if (price) price.classList.remove("visibility-hidden");
        if (priceSticky) priceSticky.classList.remove("visibility-hidden");

        if (inventoryDestination)
          inventoryDestination.classList.toggle(
            "visibility-hidden",
            inventorySource.innerText === ""
          );

        if (options) {
          let selectedOption1;
          let selectedOption2;
          let selectedOption3;

          if (options[0]) {
            if (this.nodeName == "VARIANT-RADIOS") {
              selectedOption1 = Array.from(
                options[0].querySelectorAll("input")
              ).find((radio) => radio.checked).value;
            } else {
              selectedOption1 = options[0].querySelector("select").value;
            }

            options[0].querySelector("[data-header-option]").textContent =
              selectedOption1;
          }

          if (options[1]) {
            if (this.nodeName == "VARIANT-RADIOS") {
              selectedOption2 = Array.from(
                options[1].querySelectorAll("input")
              ).find((radio) => radio.checked).value;
            } else {
              selectedOption2 = options[1].querySelector("select").value;
            }

            options[1].querySelector("[data-header-option]").textContent =
              selectedOption2;
          }

          if (options[2]) {
            if (this.nodeName == "VARIANT-RADIOS") {
              selectedOption3 = Array.from(
                options[2].querySelectorAll("input")
              ).find((radio) => radio.checked).value;
            } else {
              selectedOption3 = options[2].querySelector("select").value;
            }

            options[2].querySelector("[data-header-option]").textContent =
              selectedOption3;
          }
        }

        const addButtonUpdated = html.getElementById(
          `ProductSubmitButton-${sectionId}`
        );
        this.toggleAddButton(
          addButtonUpdated ? addButtonUpdated.hasAttribute("disabled") : true,
          window.variantStrings.soldOut
        );

        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant,
          },
        });
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForms = document.querySelectorAll(
      `[id^="product-form-${this.dataset.section}"]`
    );

    if (productForms.length > 0) {
      productForms.forEach((productForm) => {
        const addButton = productForm.querySelector('[name="add"]');
        const addButtonText = productForm.querySelector('[name="add"] > span');
        if (!addButton) return;

        if (disable) {
          addButton.setAttribute("disabled", "disabled");
          if (text) addButtonText.textContent = text;
        } else {
          addButton.removeAttribute("disabled");
          addButtonText.textContent = window.variantStrings.addToCart;
        }
      });
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    const productForms = document.querySelectorAll(
      `[id^="product-form-${this.dataset.section}"]`
    );

    if (productForms.length > 0) {
      productForms.forEach((productForm) => {
        const addButton = productForm.querySelector('[name="add"]');
        const addButtonText = productForm.querySelector('[name="add"] > span');
        if (!addButton) return;

        addButtonText.textContent = window.variantStrings.unavailable;
      });
    }

    if (price) price.classList.add("visibility-hidden");
    if (inventory) inventory.classList.add("visibility-hidden");
    if (sku) sku.classList.add("visibility-hidden");
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.classList.remove("disabled");
      } else {
        input.classList.add("disabled");
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked
      ).value;
    });
  }
}
customElements.define("variant-radios", VariantRadios);
