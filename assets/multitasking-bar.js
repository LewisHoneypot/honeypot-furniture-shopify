function setCookie(cname, cvalue, exdays){
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  const name = cname + '=';
  const ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
}

function deleteCookie(name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

Shopify.Products = (() => {
  var cookie = {
    read: (name) => {
      var list = [], data = getCookie(name);
      if (data !== null && data !== undefined && data !== '') list = data.split(' ');
      return list;
    },
    set: (params, list) => {
      if (params.element.dataset.handle !== '') {
        let handle = params.element.dataset.handle, position = list.indexOf(handle);
        if (position === -1) {
          list.unshift(handle);
          list = list.splice(0, params.max);
        } else {
          list.splice(position, 1);
          list.unshift(handle);
        }
        cookie.write(params.name, params.expire, list);
      }
    },
    write: (name, day, list) => {
      setCookie(name, list.join(' '), { expires: day, path: '/', domain: window.location.hostname });
    },
    destroy: (name, day) => {
      setCookie(name, null, { expires: day, path: '/', domain: window.location.hostname });
    }
  }

  return {
    show: (params) => {
      var list = cookie.read(params.name);
      return list;
    },
    record: (params) => {
      var list = cookie.read(params.name);
      cookie.set(params, list);
    }
  }
})();

class MultitaskingBar extends HTMLElement {
  constructor() {
    super();

    this.breakpoint = this.getAttribute('data-breakpoint');

    this.querySelectorAll('.multi-t__button[data-target]')?.forEach((button, index) => {
      button.addEventListener('click', this.open.bind(this));
      button.closest('side-drawer-opener') ? button.closest('side-drawer-opener').setAttribute('data-index', index+1) : button.setAttribute('data-index', index+1);
    });

    document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
  }

  show() {
    this.classList.remove('d-none');
    this.classList.add('d-block');
    setTimeout(() => { document.body.classList.add('multitasking__show') });
    this.querySelector('#multitasking-tab-links')?.style.setProperty('--top', `${(Number(this.querySelector('[data-target="multitasking-tab-links"]').dataset.index)-1)*100/this.querySelectorAll('.multi-t__button[data-target]').length}%`);
    if (this.matches('.multitasking-bar-collapse')) this.setAutoHeight();
  }

  close(){
    this.querySelector('#multitasking-tab-links')?.classList.remove('active');
    this.querySelector(".multitasking-bar--style-modern .multi-t__button.active")?.classList.remove("active");
  }

  open(event){
    const _target = event.currentTarget.dataset.target;

    this.querySelectorAll('button[data-target]').forEach((button) => {
      if(button != event.currentTarget) {
        button.classList.remove('active');
        button.closest('side-drawer-opener')?.classList.remove('active');
        this.querySelector(`[id="${button.dataset.target}"]`)?.classList.remove('active');
      } else {
        this.activeMain = this.querySelector(`.multitasking-bar--style-classic .multi-t__button:first-child`);
        button.classList.contains('active') ? this.activeMain?.classList.add('active-main') : this.activeMain?.classList.remove('active-main');
      }
    });

    switch (_target) {
      case 'back-to-top':
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
        event.currentTarget.classList.toggle('active');
        break;
      case 'multitasking-tab-products':
        if (window.matchMedia(this.breakpoint).matches) {
          const drawerDesktop = document.querySelector(event.currentTarget.getAttribute('data-side-drawer-desktop'));
          if (drawerDesktop) drawerDesktop.open(event.currentTarget);
        } else {
          const drawer = document.querySelector(event.currentTarget.getAttribute('data-side-drawer'));
          if (drawer) drawer.open(event.currentTarget);
        }
        event.currentTarget.classList.toggle('active');
        break;
      case 'multitasking-tab-links':
        event.currentTarget.classList.toggle('active');
        this.querySelector(`[id="${_target}"]`).classList.toggle('active');
        break;
      case 'collapse':
        event.currentTarget.classList.toggle('active');
        if (this.matches('.multitasking-bar-collapse')) {
          this.removeAutoHeight();
          setTimeout(() => {
            this.classList.remove('multitasking-bar-collapse');
            this.querySelector(`.multi-t__button-collapse.active`)?.classList.remove('active');
            this.querySelector(`.multi-t__button:first-child`).classList.add('active');
          }, 501);
        }
        else {
          this.classList.add('multitasking-bar-collapse');
          setTimeout(() => {this.setAutoHeight()}, 501);
        }
        break;
      default: 
        event.currentTarget.closest('side-drawer-opener').classList.toggle('active');
        break;
  }
  }

  onBodyClickEvent(event){
    if (!this.contains(event.target)) this.close();
  }

  setAutoHeight() {
    this.style.transform  = `translate3d(0, 0, 0)`;
    setTimeout(() => {
      this.style.height = `${this.offsetWidth}px`;
      this.classList.add('o-h');
    }, 501);
  }

  removeAutoHeight() {
    this.style.removeProperty('height');
    this.classList.remove('o-h');
    this.style.removeProperty('transform');
  }
}

customElements.define('multitasking-bar', MultitaskingBar);

class RecentlyViewedProducts extends HTMLElement {
	constructor() {
		super();

    this.breakpoint = this.getAttribute('data-breakpoint');
    this.template = this.dataset.template;
    this.isMouseenter = false;

    this.blockRecently = this.querySelector('.recently__list-product');
    if (this.blockRecently) {
      this.imageRatio = this.dataset.imageRatio;
      this.secondaryImage = this.dataset.secondaryImage;
      this.vendor = this.dataset.vendor;
      this.vendorMobile = this.dataset.vendorMobile;
      this.rating = this.dataset.rating;
      this.ratingMobile = this.dataset.ratingMobile;
      this.quickAdd = this.dataset.quickAdd;
      this.quickAddMobile = this.dataset.quickAddMobile;
      this.swatch = this.dataset.swatch;
      this.swatchMobile = this.dataset.swatchMobile;
      this.sectionId = this.dataset.sectionId;
    }
	}

  init() {
    if(Shopify.designMode){
      this.load();
    } else {
      ['mouseenter', 'touchstart'].forEach(function(e) {
        document.body.addEventListener(e, function() {
          this.isMouseenter || this.load();
          this.isMouseenter = true;
        }.bind(this));
      }.bind(this));

      window.addEventListener('scroll', function() {
        this.isMouseenter || this.load();
        this.isMouseenter = true;
      }.bind(this), false);
    }
  }

  load() {
    Shopify.Products.record({
      element: this,
      name: 'shopify_recently_viewed_products',
      expire: '30',
      max: 10
    });

    this.list = Shopify.Products.show({
      name: 'shopify_recently_viewed_products'
    });

    this.execute();

    new ResizeObserver(entries => {
      this.execute();
    }).observe(document.body);
  }

  execute() {
    if(window.matchMedia(this.breakpoint).matches || this.blockRecently != null) {
      if (this.getAttribute('loaded')) return;
      this.setAttribute('loaded', true);

      var item = this;
      var list = this.list;
      var shownSection = 0;

      var template = this.template; 
      var blockRecently = this.blockRecently;
      if (blockRecently) {
        var imageRatio = this.imageRatio,
          secondaryImage = this.secondaryImage,
          vendor = this.vendor,
          vendorMobile = this.vendorMobile,
          rating = this.rating,
          ratingMobile = this.ratingMobile,
          quickAdd = this.quickAdd,
          quickAddMobile = this.quickAddMobile,
          swatch = this.swatch,
          swatchMobile = this.swatchMobile,
          sectionId = this.sectionId;
      }

      var doAlong = function () {
        if (list.length == 0){
          item.closest('multitasking-bar')?.show();

          if (template == 'card') {
            document.querySelector(`.multi-t__products .multi-t__drawer-inner`).style.setProperty('--h-none', 'auto')
          }
        } else {
          let listHandle = encodeURIComponent(list);
          var productHandleQueue = list;

          if (blockRecently != null) {
            var urlFetch = encodeURIComponent(`template=${template}+length=${list.length}+limit=10+list_handle=${listHandle}+sectionId=recently-viewed-products-${sectionId}+image_ratio=${imageRatio}+secondary_image=${secondaryImage}+vendor=${vendor}+rating=${rating}+quick_add=${quickAdd}+swatch=${swatch}+vendorMobile=${vendorMobile}+ratingMobile=${ratingMobile}+quick_addMobile=${quickAddMobile}+swatchMobile=${swatchMobile}`);
          } else {
            var urlFetch = encodeURIComponent(`template=${template}+length=${list.length}+limit=10+list_handle=${listHandle}`);
          }

          if (template == 'card') {
            if (shownSection < productHandleQueue.length) {
              fetch(`/products/${productHandleQueue[shownSection]}?view=recently_viewed_products&constraint=${urlFetch}`)
                .then((response) => {
                  if (!response.ok) {
                    var error = new Error(response.status);
                    throw error;
                  }

                  return response.text();
                })
                .then((response) => {
                  shownSection++;
                  doAlong();

                  item.querySelector('.multi-t__list-empty')?.remove();
                  const html = new DOMParser().parseFromString(response, 'text/html');
                  item.total = html.querySelector('#RecentlyViewedProducts').childNodes.length;
                  html.querySelector('#RecentlyViewedProducts').childNodes.forEach(element =>{
                    item.querySelector('.multi-t__list-product')?.appendChild(element.cloneNode(true));
                  });
                })
            } else {
              item.closest('multitasking-bar')?.show();
            }
          } else if (template == 'product') {
            if (shownSection < productHandleQueue.length) {
              fetch(`/products/${productHandleQueue[shownSection]}?view=section_recently_viewed_products&constraint=${urlFetch}`)
                .then((response) => {
                  if (!response.ok) {
                    var error = new Error(response.status);
                    throw error;
                  }

                  return response.text();
                })
                .then((response) => {
                  shownSection++;
                  doAlong();

                  item.querySelector('.multi-t__list-empty')?.remove();
                  const html = new DOMParser().parseFromString(response, 'text/html');
                  item.total = html.querySelector('#SectionRecentlyViewedProducts').childNodes.length;
                  html.querySelector('#SectionRecentlyViewedProducts').childNodes.forEach(element =>{
                    item.querySelector('.recently__list-product')?.appendChild(element.cloneNode(true));
                  });
                })
            } else {
              if (shownSection < 1 && blockRecently != null){
                item.querySelector('.recently__list-product')?.classList.add('d-none');
              } else if (shownSection < 3 && blockRecently != null){
                item.querySelector('.recently__list-product')?.classList.add('j-c-center');
                setTimeout(() => {item.querySelector(`.recently__list-product .recently__item:last-child`)?.classList.add('m-0-i')});
              }
            }
          }
        }
      }
      doAlong();
    } else {
      this.closest('multitasking-bar')?.show();
    }
  }

  onClickButtons(event) {
    event.currentTarget.focus();

    let number = parseInt(this.dataset.number);

    switch (event.currentTarget.getAttribute('name')) {
      case 'previous':
        if(number > 0) {
          this.currentIndex = number - 2 * this.step;
          if (this.currentIndex <= 0) {
            this.currentIndex = 0;
            this.prevButton.disabled = true;
          }
          this.slide(this.nextButton);
        }
        break;
      case 'next':
        if(number < this.total - 1) {
          this.currentIndex = number + this.step * 2;
          if (this.currentIndex >= this.total - 1) {
            this.currentIndex = this.total - 1;
            this.nextButton.disabled = true;
          }
          this.slide(this.prevButton);
        }
        break;
    }
  }

  slide(button) {
    this.setAttribute('data-number', this.currentIndex);
    this.querySelector(`[data-index="${this.currentIndex}"]`).scrollIntoView({ block: "nearest", behavior: "smooth" });
    button.disabled = false;
  }

  connectedCallback() {
    this.init();
  }
}

customElements.define('recently-viewed-products', RecentlyViewedProducts);