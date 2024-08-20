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
