class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.carousel = this.querySelector(".swiper");

    if (this.carousel) this.initCarousel(this.carousel);

    if (document.querySelector(`.section-header ~ .section-announcement-bar`))
      this.closest(`.section-announcement-bar`).classList.remove("z-index-4");
  }

  setAutoPlay(swiper) {
    this.sliderAutoplayButton = this.classList.contains(
      "announcementbar-slider__autoplay"
    );

    if (this.sliderAutoplayButton) {
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
    var setInfiniteScroll = this.classList.contains("infinite-scroll"),
      setAutoplaySpeed = this.dataset.speed * 1000;

    var swiperOptions = {
      slidesPerView: 1,
      loop: setInfiniteScroll,
      speed: 800,
      parallax: true,
      simulateTouch: false,
      autoplay: {
        delay: setAutoplaySpeed,
        disableOnInteraction: false,
      },
      pagination: {
        el: carousel.querySelector(".swiper-pagination"),
        clickable: false,
        type: "custom",
      },
      navigation: {
        nextEl: carousel.querySelector(".swiper-button-next"),
        prevEl: carousel.querySelector(".swiper-button-prev"),
      },
    };

    var swiper = new Swiper(carousel, swiperOptions);
    this.setAutoPlay(swiper);
  }
}
customElements.define("announcement-bar", AnnouncementBar);
