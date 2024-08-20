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
