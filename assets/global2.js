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

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.typePagination;
    this.value;
    this.carousel = this.querySelector(".swiper");

    if (this.carousel) this.initCarousel(this.carousel);

    document.addEventListener("page:loaded", () => {
      this.mediaHover = this.querySelectorAll(".banner__media-hover");
      if (!window.matchMedia("(max-width: 749px)").matches) {
        this.mediaHover?.forEach((e) => {
          if (e.querySelector(".data__media-hover")) {
            this.maskHover = e.querySelectorAll(".data__media-hover");
            this.maskHover?.forEach((mask) => {
              mask?.addEventListener("mouseenter", (event) => {
                e.classList.add("mask-hover");
              });

              mask?.addEventListener("mouseleave", (event) => {
                e.classList.remove("mask-hover");
              });
            });
          } else {
            e.classList.remove("banner__media-hover");
          }
        });
      }
    });
  }

  setClickable() {
    this.type == "dots" || this.type == "dashed"
      ? (this.value = true)
      : (this.value = false);
    return this.value;
  }

  setTypePanigation() {
    if (this.type == "fraction" || this.type == "progressbar") {
      this.value = this.type;
    } else if (this.type == "dots" || this.type == "dashed") {
      this.value = "bullets";
      if (this.type == "dashed")
        this.querySelector(".swiper-pagination").classList.add(
          "swiper-pagination-dashed"
        );
    } else if (this.type == "progressbar_vertical") {
      this.value = "progressbar";
    } else {
      this.value = "custom";
    }
    return this.value;
  }

  setAutoPlay(swiper) {
    if (this.dataset.sliderAutoplay) {
      this.carousel.addEventListener("mouseenter", (event) => {
        swiper.autoplay.stop();
      });

      this.carousel.addEventListener("mouseleave", (event) => {
        swiper.autoplay.start();
      });
    } else {
      swiper.autoplay.stop();
    }
  }

  initCarousel(carousel) {
    var setClickable = this.setClickable(),
      setTypePanigation = this.setTypePanigation(),
      setInfiniteScroll = this.classList.contains("infinite-scroll"),
      setspaceBetween = this.dataset.spaceBetween;

    if (this.classList.contains("vertical")) {
      var swiperOptions = {
        direction: this.dataset.directionMobile
          ? this.dataset.directionMobile
          : "horizontal",
        slidesPerView: this.dataset.itemToShowMobile,
        spaceBetween: setspaceBetween,
        loop: this.dataset.loop ? this.dataset.loop : false,
        mousewheel: this.dataset.mousewheel ? this.dataset.mousewheel : true,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".swiper-pagination",
          type: setTypePanigation,
          clickable: setClickable,
        },
        breakpoints: {
          750: {
            direction: this.dataset.directionMobile
              ? this.dataset.directionMobile
              : "horizontal",
            slidesPerView: this.dataset.itemToShowTablet,
            spaceBetween: this.dataset.spaceBetweenTablet
              ? this.dataset.spaceBetweenTablet
              : setspaceBetween,
          },
          1200: {
            direction: this.dataset.directionDesktop,
            slidesPerView: this.dataset.itemToShowDesktop,
            spaceBetween: this.dataset.spaceBetweenDesktop
              ? this.dataset.spaceBetweenDesktop
              : setspaceBetween,
          },
        },
      };

      const swiper = new Swiper(carousel, swiperOptions);
      this.setAutoPlay(swiper);
    } else if (this.classList.contains("cover-flow")) {
      var swiperOptions = {
        effect: "coverflow",
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        loopAdditionalSlides: 1,
        speed: this.dataset.swiperSpeed ? this.dataset.swiperSpeed : 1200,
        centeredSlides: true,
        grabCursor: true,
        coverflowEffect: {
          rotate: 0,
          slideShadows: false,
          depth: 0,
          scale: 0.8,
          stretch: 0,
        },
        pagination: {
          el: carousel.querySelector(".swiper-pagination"),
          clickable: setClickable,
          type: setTypePanigation,
        },
        navigation: {
          nextEl: this.querySelector(".swiper-button-next"),
          prevEl: this.querySelector(".swiper-button-prev"),
        },
        breakpoints: {
          500: {
            coverflowEffect: {
              stretch: 20,
            },
          },
          768: {
            coverflowEffect: {
              stretch: 20,
              scale: 0.69,
            },
          },
          992: {
            slidesPerView: 1,
            coverflowEffect: {
              stretch: 0,
            },
          },
        },
      };
      const swiper = new Swiper(carousel, swiperOptions);
    } else {
      if (!this.classList.contains("swiper-more-item")) {
        var swiperOptions = {
          slidesPerView: this.dataset.itemToShowMobileXs
            ? this.dataset.itemToShowMobileXs
            : 1,
          spaceBetween: setspaceBetween,
          loop: setInfiniteScroll,
          speed: this.dataset.swiperSpeed ? this.dataset.swiperSpeed : 600,
          parallax: this.dataset.sliderParallax ? true : false,
          centeredSlides: this.dataset.centeredSlides ? true : false,
          pagination: {
            el: carousel.querySelector(".swiper-pagination"),
            clickable: setClickable,
            type: setTypePanigation,
          },
          navigation: {
            nextEl: carousel.querySelector(".swiper-button-next"),
            prevEl: carousel.querySelector(".swiper-button-prev"),
          },
          breakpoints: {
            551: {
              slidesPerView: this.dataset.itemToShowMobile,
              spaceBetween: setspaceBetween,
            },
            750: {
              slidesPerView: this.dataset.itemToShowTablet,
              spaceBetween: this.dataset.spaceBetweenTablet
                ? this.dataset.spaceBetweenTablet
                : setspaceBetween,
            },
            990: {
              slidesPerView: this.dataset.itemToShowDesktop,
              spaceBetween: this.dataset.spaceBetweenDesktop
                ? this.dataset.spaceBetweenDesktop
                : setspaceBetween,
            },
          },
        };
      } else {
        var swiperOptions = {
          slidesPerView: this.dataset.itemXs,
          spaceBetween: setspaceBetween,
          loop: setInfiniteScroll,
          speed: this.dataset.swiperSpeed ? this.dataset.swiperSpeed : 2000,
          parallax: this.dataset.sliderParallax ? true : false,
          centeredSlides: this.dataset.centeredSlides ? true : false,
          speed: 600,
          watchSlidesProgress: true,
          grabCursor: this.dataset.grabCursor ? true : false,
          pagination: {
            el: carousel.querySelector(".swiper-pagination"),
            clickable: setClickable,
            type: setTypePanigation,
          },
          navigation: {
            nextEl: carousel.querySelector(".swiper-button-next"),
            prevEl: carousel.querySelector(".swiper-button-prev"),
          },
          breakpoints: {
            551: {
              slidesPerView: this.dataset.itemSm,
              spaceBetween: setspaceBetween,
            },
            750: {
              slidesPerView: this.dataset.itemMd,
              spaceBetween: this.dataset.spaceBetweenTablet
                ? this.dataset.spaceBetweenTablet
                : setspaceBetween,
            },
            990: {
              slidesPerView: this.dataset.itemLg,
              spaceBetween: this.dataset.spaceBetweenTablet
                ? this.dataset.spaceBetweenTablet
                : setspaceBetween,
            },
            1200: {
              slidesPerView: this.dataset.itemXl,
              spaceBetween: this.dataset.spaceBetweenDesktop
                ? this.dataset.spaceBetweenDesktop
                : setspaceBetween,
            },
            1400: {
              slidesPerView: this.dataset.itemXxl,
              spaceBetween: this.dataset.spaceBetweenDesktop
                ? this.dataset.spaceBetweenDesktop
                : setspaceBetween,
            },
          },
          on: {
            init: function () {
              if (carousel.getAttribute("data-slide-to-1")) {
                if (!carousel.classList.contains("infinite-scroll")) {
                  this.slideTo(1);
                }
              }
            },
          },
        };
      }
      const swiper = new Swiper(carousel, swiperOptions);
    }
  }
}
customElements.define("slider-component", SliderComponent);

class SliderComponentProduct extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.typePagination;
    this.value;

    this.carousel_thumb = this.querySelector(".carousel-thumb.swiper");
    this.carousel_product = this.querySelector(
      ".carousel-thumb-product.swiper"
    );

    if (this.carousel_product && this.carousel_thumb)
      this.initCarousel(this.carousel_product, this.carousel_thumb);
  }

  setClickable() {
    this.type == "dots" || this.type == "dashed"
      ? (this.value = true)
      : (this.value = false);
    return this.value;
  }

  setTypePanigation() {
    if (this.type == "fraction" || this.type == "progressbar") {
      this.value = this.type;
    } else if (this.type == "dots" || this.type == "dashed") {
      this.value = "bullets";
      if (this.type == "dashed")
        this.querySelector(".swiper-pagination").classList.add(
          "swiper-pagination-dashed"
        );
    } else if (this.type == "progressbar_vertical") {
      this.value = "progressbar";
    } else {
      this.value = "custom";
    }
    return this.value;
  }

  initCarousel(carousel_product, carousel_thumb) {
    let setTypePanigation = this.setTypePanigation(),
      setspaceBetween = carousel_thumb.dataset.spaceBetween,
      spaceBetweenDesktop = carousel_thumb.dataset.spaceBetweenDesktop,
      spaceBetweenTablet = carousel_thumb.dataset.spaceBetweenTablet,
      directionDesktop = carousel_thumb.dataset.directionDesktop;
    const swiperThumbnail = new Swiper(carousel_thumb, {
      direction: "horizontal",
      spaceBetween: setspaceBetween,
      slidesPerView: 4,
      watchSlidesProgress: true,
      speed: 800,
      breakpoints: {
        551: {
          spaceBetween: setspaceBetween,
        },
        750: {
          direction: "horizontal",
          spaceBetween: spaceBetweenTablet
            ? spaceBetweenTablet
            : setspaceBetween,
        },
        1200: {
          direction: directionDesktop ? directionDesktop : "horizontal",
          spaceBetween: spaceBetweenDesktop
            ? spaceBetweenDesktop
            : setspaceBetween,
        },
      },
    });

    const swiperProduct = new Swiper(carousel_product, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      speed: 800,
      pagination: {
        el: this.querySelector(".swiper-pagination"),
        type: setTypePanigation,
        clickable: false,
      },
      navigation: {
        nextEl: this.querySelector(".swiper-button-next"),
        prevEl: this.querySelector(".swiper-button-prev"),
      },
      thumbs: {
        swiper: swiperThumbnail,
      },
    });
  }
}
customElements.define("slider-product-component", SliderComponentProduct);

class CategorySlide extends HTMLElement {
  constructor() {
    super();
    this.value;
    this.carousel = this.querySelector(".swiper");
    if (this.carousel) this.initCarousel(this.carousel);
  }

  initCarousel(carousel) {
    const cateThumbs = this.querySelector(".cate-slide__pagi .swiper");
    const cateImage = this.querySelector(".cate-slide__image .swiper");
    const bpoint = "(min-width: 1200px)";

    const swiperCateThumbs = new Swiper(cateThumbs, {
      spaceBetween: 0,
      slidesPerView: cateThumbs.dataset.itemPerviewMobile,
      watchSlidesProgress: true,
      breakpoints: {
        750: {
          slidesPerView: cateThumbs.dataset.itemPerviewTablet,
        },
        1200: {
          slidesPerView: cateThumbs.dataset.itemPerviewDesktop,
        },
      },
    });

    const swiperCateMain = new Swiper(cateImage, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      effect: "fade",
      navigation: {
        nextEl: this.querySelector(".section__cate-slide .swiper-button-next"),
        prevEl: this.querySelector(".section__cate-slide .swiper-button-prev"),
      },
      thumbs: {
        swiper: swiperCateThumbs,
      },
    });

    if (window.matchMedia(bpoint).matches) {
      swiperCateThumbs.slides.forEach((slide, index) => {
        slide.addEventListener("mouseenter", () => {
          swiperCateMain.slideTo(index);
        });
      });
    }
  }
}
customElements.define("category-slide", CategorySlide);

class AnchorTarget extends HTMLElement {
  constructor() {
    super();

    const buttons = document.querySelectorAll("[data-anchor]");

    if (!buttons) return;
    buttons.forEach((button) => {
      const section = button.closest("[data-anchor-container]"),
        sectionHeight = section.offsetHeight;

      button.addEventListener("click", () => {
        window.scrollTo({
          top: sectionHeight,
          behavior: "smooth",
        });
      });
    });
  }
}
customElements.define("anchor-target", AnchorTarget);

class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.typePagination;
    this.value;
    this.carousel = this.querySelector(".swiper");

    if (this.carousel) this.initCarousel(this.carousel);

    document.addEventListener("page:loaded", () => {
      this.mediaHover = this.querySelectorAll(".banner__media-hover");
      if (!window.matchMedia("(max-width: 749px)").matches) {
        this.mediaHover?.forEach((e) => {
          if (e.querySelector(".data__media-hover")) {
            this.maskHover = e.querySelectorAll(".data__media-hover");
            this.maskHover?.forEach((mask) => {
              mask?.addEventListener("mouseenter", (event) => {
                e.classList.add("mask-hover");
              });

              mask?.addEventListener("mouseleave", (event) => {
                e.classList.remove("mask-hover");
              });
            });
          } else {
            e.classList.remove("banner__media-hover");
          }
        });
      }
    });
  }

  setClickable() {
    this.type == "dots" || this.type == "dashed" || this.type == "number"
      ? (this.value = true)
      : (this.value = false);
    if (this.type == "number")
      this.querySelector(".swiper-pagination")?.classList.add(
        "swiper-pagination-number"
      );
    return this.value;
  }

  setTypePanigation() {
    if (this.type == "fraction" || this.type == "progressbar") {
      this.value = this.type;
    } else if (this.type == "dots" || this.type == "dashed") {
      this.value = "bullets";
      if (this.type == "dashed")
        this.querySelector(".swiper-pagination").classList.add(
          "swiper-pagination-dashed"
        );
    } else if (this.type == "progressbar_vertical") {
      this.value = "progressbar";
    } else {
      this.value = "custom";
    }
    return this.value;
  }

  setAutoPlay(swiper) {
    this.sliderAutoplayButton =
      this.querySelector(".button-slider__autoplay") ||
      this.querySelector(".autoplay-progress");
    this.enable_autoplay = this.classList.contains("enable--autoplay");

    if (this.sliderAutoplayButton) {
      if (
        this.querySelector(".button-slider__autoplay") ||
        this.querySelector(".autoplay-progress")
      ) {
        this.sliderAutoplayButton.addEventListener("click", (event) => {
          this.sliderAutoplayButton.classList.toggle("paused");
          this.sliderAutoplayButton.classList.contains("paused")
            ? swiper.autoplay.stop()
            : swiper.autoplay.start();
        });

        this.carousel.addEventListener("mouseenter", (event) => {
          const focusedOnAutoplayButton =
            event.target === this.sliderAutoplayButton ||
            this.sliderAutoplayButton.contains(event.target);
          if (
            !this.sliderAutoplayButton.classList.contains("paused") ||
            focusedOnAutoplayButton
          )
            swiper.autoplay.stop();
        });

        this.carousel.addEventListener("mouseleave", (event) => {
          const focusedOnAutoplayButton =
            event.target === this.sliderAutoplayButton ||
            this.sliderAutoplayButton.contains(event.target);
          if (
            !this.sliderAutoplayButton.classList.contains("paused") ||
            focusedOnAutoplayButton
          )
            swiper.autoplay.start();
        });
      } else {
        swiper.autoplay.start();
      }
    } else {
      if (this.enable_autoplay) {
        swiper.autoplay.start();

        this.carousel.addEventListener("mouseenter", (event) => {
          swiper.autoplay.stop();
        });

        this.carousel.addEventListener("mouseleave", (event) => {
          swiper.autoplay.start();
        });

        this.carousel.addEventListener("focusin", (event) => {
          swiper.autoplay.stop();
        });

        this.carousel.addEventListener("focusout", (event) => {
          swiper.autoplay.start();
        });
      } else {
        swiper.autoplay.stop();
      }
    }
  }

  initCarousel(carousel) {
    var setClickable = this.setClickable(),
      setTypePanigation = this.setTypePanigation(),
      setInfiniteScroll = this.classList.contains("infinite-scroll"),
      setAutoplaySpeed = this.dataset.speed * 1000;

    if (this.type == "number") {
      var swiperOptions = {
        slidesPerView: 1,
        loop: setInfiniteScroll,
        speed: this.dataset.duration ? this.dataset.duration : 800,
        parallax: true,
        autoplay: {
          delay: setAutoplaySpeed,
          disableOnInteraction: false,
        },
        pagination: {
          el: carousel.querySelector(".swiper-pagination"),
          clickable: setClickable,
          renderBullet: function (index, className) {
            return (
              '<div class="cus-bullet ' +
              className +
              '"><span class="dot-stt">' +
              (index + 1) +
              "</span></div>"
            );
          },
        },
        navigation: {
          nextEl: carousel.querySelector(".swiper-button-next"),
          prevEl: carousel.querySelector(".swiper-button-prev"),
        },
        on: {
          autoplayTimeLeft(s, time, progress) {
            carousel.querySelectorAll(`.autoplay-progress`)?.forEach((e) => {
              e.style.setProperty("--progress", 1 - progress);
            });
          },
        },
      };
    } else {
      var swiperOptions = {
        slidesPerView: 1,
        loop: setInfiniteScroll,
        speed: this.dataset.duration ? this.dataset.duration : 800,
        parallax: true,
        autoplay: {
          delay: setAutoplaySpeed,
          disableOnInteraction: false,
        },
        pagination: {
          el: carousel.querySelector(".swiper-pagination"),
          clickable: setClickable,
          type: setTypePanigation,
        },
        navigation: {
          nextEl: carousel.querySelector(".swiper-button-next"),
          prevEl: carousel.querySelector(".swiper-button-prev"),
        },
        on: {
          autoplayTimeLeft(s, time, progress) {
            carousel.querySelectorAll(`.autoplay-progress`)?.forEach((e) => {
              e.style.setProperty("--progress", 1 - progress);
            });
          },
        },
      };
    }

    var swiper = new Swiper(carousel, swiperOptions);
    this.setAutoPlay(swiper);
  }
}
customElements.define("slideshow-component", SlideshowComponent);

class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector(".section-header");
    this.logoSpecial = this.querySelector(`.header--logo-special`);
    this.headerBounds = {};
    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector("predictive-search");

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => (this.preventReveal = true);

    this.addEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp);
    window.addEventListener("scroll", this.onScrollHandler, false);

    this.createObserver();

    if (
      this.classList.contains("transparent") &&
      document.querySelector(".section__slideshow")
    ) {
      document
        .querySelector(".section__slideshow")
        .style.setProperty(
          "--has-header-transparent",
          `${this.offsetHeight}px`
        );
      window.addEventListener("resize", () => {
        document
          .querySelector(".section__slideshow")
          .style.setProperty(
            "--has-header-transparent",
            `${this.offsetHeight}px`
          );
      });
    }

    if (this.logoSpecial) {
      this.header.classList.add("pos-sticky", "top-0", "animate");
      this.onScrollHandlerLogo = this.onScrollLogo.bind(this);
      window.addEventListener("scroll", this.onScrollHandlerLogo, false);

      this.resize();
      window.addEventListener("resize", () => {
        this.resize(true);
      });
    }

    this.checkTransparent();
  }

  resize(setAuto) {
    if (setAuto) this.logoSpecial.style.height = `auto`;
    this.onScrollHandlerLogo();

    this.logoSpecial.addEventListener("transitionstart", () => {
      this.header.classList.add("animating");
    });

    this.logoSpecial.addEventListener("transitionend", () => {
      this.header.classList.remove("animating");
    });
  }

  disconnectedCallback() {
    this.removeEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp);
    window.removeEventListener("scroll", this.onScrollHandler);
    if (this.logoSpecial)
      window.removeEventListener("scroll", this.onScrollHandlerLogo);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  onScrollLogo() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.header.matches(".animating")) return;
    scrollTop <= 0 && scrollTop < this.logoSpecial.scrollHeight
      ? requestAnimationFrame(this.enableLogoSpecial.bind(this))
      : requestAnimationFrame(this.disableLogoSpecial.bind(this));
  }

  hide() {
    this.header.classList.add("pos-sticky", "top-0");
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.add("sticky-hidden");
    document.body.classList.add("scroll-down");
    document.body.classList.remove("scroll-up");
  }

  reveal() {
    this.header.classList.add("pos-sticky", "top-0", "animate");
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.remove("sticky-hidden");
    document.body.classList.add("scroll-up");
    document.body.classList.remove("scroll-down");
  }

  reset() {
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.remove(
        "sticky-hidden",
        "pos-sticky",
        "top-0",
        "animate"
      );
    document.body.classList.remove("scroll-down", "scroll-up");
  }

  enableLogoSpecial() {
    this.header.classList.add(
      "disable--logo-small",
      "pos-sticky",
      "top-0",
      "animate"
    );
    this.header.classList.remove("enable--logo-small");
    this.logoSpecial.style.height = `${this.logoSpecial.scrollHeight}px`;
  }

  disableLogoSpecial() {
    this.header.classList.add("enable--logo-small");
    this.header.classList.remove("disable--logo-small");
    this.logoSpecial.style.height = `0px`;
  }

  checkTransparent() {
    const sectionHeaderGroup = document.querySelectorAll(
      ".shopify-section-group-header-group"
    );
    if (
      !this.matches(".transparent") ||
      sectionHeaderGroup.length == 1 ||
      sectionHeaderGroup[sectionHeaderGroup.length - 1].matches(
        ".section-header"
      )
    )
      return;
    this.classList.remove("transparent", "pos-absolute");
  }
}
customElements.define("sticky-header", StickyHeader);

class ThemeSwiper extends HTMLElement {
  constructor() {
    super();

    this.component = this.querySelectorAll("slider-component");
    this.slider = this.querySelectorAll(".carousel__items");
    this.items = this.querySelectorAll(".carousel__item");
    this.breakpoints = this.dataset.breakpoint.split(",");

    this.init();
  }

  init() {
    let bpoint;
    let _component = this.dataset.classComponent.split(" ");
    let _slider = this.dataset.classSlider.split(" ");
    let _items = this.dataset.classItems.split(" ");

    this.breakpoints.forEach((breakpoint) => {
      switch (breakpoint) {
        case "all":
          bpoint = "all";
          break;
        case "xs":
          bpoint = "(max-width: 550px)";
          break;
        case "sm":
          bpoint = "(max-width: 749px)";
          break;
        case "md":
          bpoint = "(max-width: 989px)";
          break;
        case "lg":
          bpoint = "(max-width: 1199px)";
          break;
        case "u-sm":
          bpoint = "(min-width: 750px)";
          break;
        case "u-md":
          bpoint = "(min-width: 990px)";
          break;
        case "u-lg":
          bpoint = "(min-width: 1200px)";
          break;
      }
    });

    if (bpoint == "all") {
      this.toggleClass(this.component, _component, true);
      this.toggleClass(this.slider, _slider, true);
      this.toggleClass(this.items, _items, true);
    } else {
      if (window.matchMedia(bpoint).matches) {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.slider, _slider, true);
        this.toggleClass(this.items, _items, true);
      } else {
        this.toggleClass(this.component, _component, false);
        this.toggleClass(this.slider, _slider, false);
        this.toggleClass(this.items, _items, false);
      }
    }

    new ResizeObserver((entries) => {
      if (bpoint == "all") {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.slider, _slider, true);
        this.toggleClass(this.items, _items, true);
      } else {
        if (window.matchMedia(bpoint).matches) {
          this.toggleClass(this.component, _component, true);
          this.toggleClass(this.slider, _slider, true);
          this.toggleClass(this.items, _items, true);
        } else {
          this.toggleClass(this.component, _component, false);
          this.toggleClass(this.slider, _slider, false);
          this.toggleClass(this.items, _items, false);
        }
      }
    }).observe(document.body);
  }

  toggleClass(elements, c, check) {
    switch (check) {
      case true:
        elements.forEach((element) => {
          element.classList.add(...c);
        });
        break;
      case false:
        elements.forEach((element) => {
          element.classList.remove(...c);
        });
        break;
    }
  }
}
customElements.define("theme-swiper", ThemeSwiper);

class ThemeTab extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const _targetTab = this.querySelectorAll(".tab-in-mobile");
    _targetTab.forEach((tabEl) => {
      if (tabEl.classList.contains("active")) {
        setTimeout(() => {
          tabEl.style.setProperty("--max-height", `${tabEl.scrollHeight}px`);
        }, 500);
      }
    });
  }

  open(button, tab) {
    const _target = button.closest("li");

    if (_target.classList.contains("active")) return;

    const _active = this.querySelector(`li.active`);
    const _activeTab = this.querySelectorAll(`.tab__content-item.active`);
    const _targetTab = this.querySelectorAll(`[data-tab-id="${tab}"]`);

    _active.classList.remove("active");
    _target.classList.add("active");

    _activeTab.forEach((el) => el.classList.remove("active"));
    _targetTab.forEach((el) => el.classList.add("active"));

    this.load(_targetTab);
  }

  load(tab) {
    tab.forEach((tabEl) => {
      if (!tabEl.getAttribute("loaded")) {
        const content = tabEl.querySelector("template").content.cloneNode(true);
        tabEl.appendChild(content);
        tabEl.setAttribute("loaded", true);
        buttonRippleHover();
      }

      if (tabEl.classList.contains("tab-in-mobile")) {
        setTimeout(() => {
          tabEl.style.setProperty("--max-height", `${tabEl.scrollHeight}px`);
        }, 500);
      }
    });
  }
}
customElements.define("theme-tab", ThemeTab);

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

class VideoTemplate extends HTMLElement {
  constructor() {
    super();

    this.video = this.querySelector("iframe");
    this.video_tag = this.querySelector("video");
    this.isMouseenter = false;
  }

  loadVideo() {
    if (!this.video && !this.video_tag) return;

    if (this.video) {
      this.dispatchEvent(
        new CustomEvent("loadingStart", {
          detail: { element: this.video, parent: this },
        })
      );
      this.video.setAttribute("src", this.video.getAttribute("data-src"));
      this.video.addEventListener(
        "load",
        function () {
          this.dispatchEvent(
            new CustomEvent("loadingEnd", {
              detail: { element: this.video, parent: this },
            })
          );
          this.dataVideoType == "youtube" &&
            this.video.contentWindow.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              "*"
            );
        }.bind(this)
      );

      this.isLoaded(true);
    }

    if (this.video_tag) {
      this.video_tag.play();
    }
  }

  init() {
    if (this.dataset.autoplay === "true") {
      if (Shopify.designMode) {
        this.loadVideo();
      } else {
        ["mouseenter", "touchstart"].forEach(
          function (e) {
            document.body.addEventListener(
              e,
              function () {
                this.isMouseenter || this.loadVideo();
                this.isMouseenter = true;
              }.bind(this)
            );
          }.bind(this)
        );

        window.addEventListener(
          "scroll",
          function () {
            this.isMouseenter || this.loadVideo();
            this.isMouseenter = true;
          }.bind(this),
          false
        );
      }
    } else {
      this.isMouseenter = true;
    }
  }

  isLoaded(load) {
    if (load) {
      this.setAttribute("loaded", true);
      this.querySelectorAll("img, svg").forEach((element) => element.remove());
    } else {
      this.removeAttribute("loaded");
    }
  }

  static get observedAttributes() {
    return ["data-video-type", "data-video-id"];
  }

  set dataVideoType(type) {
    this.setAttribute("data-video-type", type);
  }

  get dataVideoType() {
    return this.getAttribute("data-video-type");
  }

  set dataVideoId(id) {
    this.setAttribute("data-video-id", id);
  }

  get dataVideoId() {
    return this.getAttribute("data-video-id");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    oldValue !== newValue && this.init();
  }

  connectedCallback() {
    this.init();
  }
}
customElements.define("video-template", VideoTemplate);

class VideoTemplateOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const video = document.querySelector(this.getAttribute("data-video"));
      if (video) video.loadVideo();
      button.parentElement.classList.add("hidden");
    });
  }
}
customElements.define("video-template-opener", VideoTemplateOpener);

class ProductCustomerViewing extends HTMLElement {
  constructor() {
    super();

    const wrapper = document.querySelector(".product__quickview-inner");

    if (wrapper) {
      const numbersViewer = wrapper.getAttribute("data-customer-view"),
        numbersViewerList = JSON.parse("[" + numbersViewer + "]"),
        numbersViewerTime = wrapper.getAttribute("data-customer-view-time"),
        timeViewer = parseInt(numbersViewerTime) * 1000;

      setInterval(function () {
        const numbersViewerItem = Math.floor(
          Math.random() * numbersViewerList.length
        );

        wrapper.querySelector(".text").innerHTML =
          window.customer_view.text.replace(
            "[number]",
            numbersViewerList[numbersViewerItem]
          );
      }, timeViewer);
    }
  }
}
customElements.define("customer-viewing", ProductCustomerViewing);

class WriteComment extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      document.body.classList.contains("w-c") ? this.hide() : this.show();
    });
  }

  show() {
    document.body.classList.add("w-c");
  }

  hide() {
    document.body.classList.remove("w-c");
  }
}
customElements.define("write-comment", WriteComment);

class Parallax extends HTMLElement {
  constructor() {
    super();

    this.parallax = this.querySelector("[data-parallax]");

    this.init(this.parallax);
  }

  init(item) {
    let event = item,
      ctn = event.closest("[data-parallax-container]");

    event.style.transition = "0s";
    gsap.set(event, { yPercent: 0 });
    gsap.to(event, {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: ctn,
        start: "top 0%",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }
}

customElements.define("parallax-container", Parallax);

class CollapseCollection extends HTMLElement {
  constructor() {
    super();
    this.accordions = this.querySelectorAll(".item");

    this.init();
  }

  init() {
    this.openAccordion(this.accordions[0]);
    this.accordions.forEach((accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.addEventListener("click", () => {
        if (content.style.maxHeight) {
          this.closeAccordion(accordion);
        } else {
          this.accordions.forEach((accordion) =>
            this.closeAccordion(accordion)
          );
          this.openAccordion(accordion);
        }
      });

      this.resize(accordion);
    });
  }

  openAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion__content");
    accordion.classList.add("accordion__active");
    content.style.maxHeight = content.scrollHeight + "px";
  };

  closeAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion__content");
    accordion.classList.remove("accordion__active");
    content.style.maxHeight = null;
  };

  resize = (accordion) => {
    const content = accordion.querySelector(".accordion__content");

    window.addEventListener("resize", () => {
      if (accordion.classList.contains("accordion__active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  };
}

customElements.define("collapse-collection", CollapseCollection);
