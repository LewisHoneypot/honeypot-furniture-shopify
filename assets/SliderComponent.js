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
