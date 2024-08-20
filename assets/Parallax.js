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
