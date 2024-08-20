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
