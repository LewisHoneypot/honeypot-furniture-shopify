class SplittingAnimate extends HTMLElement {
  constructor() {
    super();

    this.target = this.querySelectorAll("[data-splitting-element]");

    this.chars = this.querySelectorAll(
      "[data-splitting-element][data-splitting-animate]"
    );

    this.split();

    this.animate(this.chars, ".char");
  }

  split() {
    Splitting({
      target: this.target,
      by: "chars",
      key: null,
    });
  }

  animate(els, className) {
    els.forEach((el) => {
      if (el.getAttribute("data-splitting-element") == "chars") {
        gsap.fromTo(
          el.querySelectorAll(className),
          0.4,
          {
            yPercent: 100,
          },
          {
            scrollTrigger: {
              trigger: els,
            },
            yPercent: 0,
            stagger: 0.05,
            delay: 0.2,
          }
        );
      } else {
        gsap.fromTo(
          el.querySelectorAll(className),
          0.2,
          {
            yPercent: 100,
            rotation: 30,
          },
          {
            scrollTrigger: {
              trigger: els,
            },
            yPercent: 0,
            rotation: 0,
            stagger: 0.02,
            delay: 0.2,
          }
        );
      }
    });
  }
}
customElements.define("splitting-animate", SplittingAnimate);
