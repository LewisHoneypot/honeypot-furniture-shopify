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
