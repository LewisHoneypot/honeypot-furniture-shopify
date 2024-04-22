class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
    if(document.querySelector("body").classList.contains("cursor-fixed__show")){
      window.shareFunctionAnimation.onEnterButton();
      window.shareFunctionAnimation.onLeaveButton();
    }
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  onCartUpdate() {
    fetch('/cart?section_id=main-cart-items')
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const sourceQty = html.querySelector('cart-items');
        this.innerHTML = sourceQty.innerHTML;
      })
      .catch(e => {
        console.error(e);
      });

      if(document.querySelector("body").classList.contains("cursor-fixed__show")){
        window.shareFunctionAnimation.onEnterButton();
        window.shareFunctionAnimation.onLeaveButton();
      }
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '#cart-content'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-totals',
        section: document.getElementById('main-cart-totals').dataset.id,
        selector: '#cart-totals'
      }
    ];
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          if (section.id != 'cart-icon-bubble') {
            const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
          } else {
            const elementToReplace = document.querySelectorAll(`.${section.id}`);
            elementToReplace.forEach(element => {
              element.innerHTML = this.getSectionInnerHTML(
                parsedState.sections[section.section],
                section.selector
              );
            })
          }
        }));
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem = document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
        }
        publish(PUB_SUB_EVENTS.cartUpdate, {source: 'cart-items'});
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').innerHTML = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled', 'e-none');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled', 'e-none');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      }
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

class CartNote extends HTMLElement {
  constructor() {
    super();
    
    this.querySelector('[data-update-note]').addEventListener('click', (event) => {
      this.val = this.querySelector('.text-area').value;
      const body = JSON.stringify({ note: this.val });
      fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }});
      document.querySelector('.popup-toolDown.show').classList.remove('show');
      document.querySelector('.previewCart').classList.remove('active-tool');
    })
  }
}

customElements.define('cart-note-popup', CartNote);

class CartDrawer extends SideDrawer {
  constructor() {
    super();
  }

  open(triggeredBy) {
    let checkLoad = true;
    if (checkLoad) {
      checkLoad = false;
      const $thisData = this;
      const urlStyle = $thisData.dataset.urlStyleSheet;

      this.buildStyleSheet(urlStyle, $thisData);
    }

    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {this.classList.add('animate', 'active')});
    if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
      this.addEventListener('transitionstart', () => {
        document.body.classList.add('drawer--opening');
        document.body.classList.remove('drawer--open','drawer--closing');
      }, { once: true });
    }

    this.addEventListener('transitionend', () => {
      if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
        document.body.classList.remove('drawer--opening','drawer--closing');
        document.body.classList.add('drawer--open');
      }
      const containerToTrapFocusOn = this;
      const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
      trapFocus(containerToTrapFocusOn, focusElement);
    }, { once: true });
    document.body.classList.add('o-h');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if(cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') && this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section => {
      if (section.id != 'cart-icon-bubble') {
        const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
        sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      } else {
        const sectionElement = section.selector ? document.querySelectorAll(`.${section.selector}`) : document.querySelectorAll(`.${section.id}`);
        sectionElement.forEach(element => {
          element.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        })
      }
    }));

    setTimeout(() => {
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  buildStyleSheet(name, $this) {
    if (name == '') return;
    const loadStyleSheet = document.createElement("link");
    loadStyleSheet.rel = 'stylesheet';
    loadStyleSheet.type = 'text/css';
    loadStyleSheet.href = name;
    $this.parentNode.insertBefore(loadStyleSheet, $this);
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector);
  }
}

customElements.define('cart-drawer', CartDrawer);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, ON_CHANGE_DEBOUNCE_TIMER))
    }
  });
};

if (!customElements.get('cart-message')) {
  customElements.define('cart-message', class CartMessage extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.init();
      this.calculator();
    }

    init() {
      let rate = Shopify.currency.rate || 1;
      this.price = parseInt(this.dataset.price) * rate;
      this.total = parseInt(this.dataset.total);
      this.symbol = this.dataset.symbol;
      this.firstText = this.dataset.firstText;
      this.secondText = this.dataset.secondText;
      this.thirdText = this.dataset.thirdText;
    }

    calculator() {
      let freeshipText,
        percent,
        freeshipClass = 'none';

      percent = ((this.total/this.price) * 100).toFixed(2);

      if(this.total == 0) {
        freeshipText = this.firstText.replace('{{ price }}', this.price);
      } else if (this.total > this.price) {
        freeshipText = this.secondText;
        freeshipClass = 'progress-free';
        percent = 100;
      } else {
        let extraPrice;

        if(this.symbol.includes('{{amount}}')) {
          extraPrice = this.symbol.replace('{{amount}}', Math.round(Math.abs(this.total - this.price)));
        } else {
          extraPrice = this.symbol.replace('{{amount_with_comma_separator}}', Math.round(Math.abs(this.total - this.price)));
        }

        freeshipText = this.thirdText.replace('{{ price }}', extraPrice);

        if(percent <= 30) {
          freeshipClass = 'progress-30';
        } else if(percent <= 60) {
          freeshipClass = 'progress-60';
        } else if(percent <= 100) {
          freeshipClass = 'progress-99';
        }
      }

      this.querySelector('.progress')?.classList.add(freeshipClass);
      this.querySelector('.message').innerText = freeshipText;
      this.querySelector('.progress__shipping')?.setAttribute('aria-label', freeshipText);
      this.querySelector('.progress__meter')?.style.setProperty('--percent', `${percent}%`);
    }
  });
}
