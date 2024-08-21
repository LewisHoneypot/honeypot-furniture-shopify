class ImageReveal extends HTMLElement {
  constructor() {
    super();
    this.imageCtn = this.querySelector(".coll-cate__images");
    this.images = [...this.querySelectorAll(".coll-cate__images img")];
    this.links = [...this.querySelectorAll(".coll-cate__menu .item")];

    this.ctn = this;
    this.callEvent(this.links);
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.mouse = {
      x: -100,
      y: -100,
    };

    this.target = this;

    this.target.addEventListener("pointermove", this.updatePosition.bind(this));
  }

  callEvent(links) {
    links.forEach((link) => {
      let { label } = link.dataset;

      link.addEventListener("mouseenter", () => {
        link.classList.add("active");
        gsap.to(`img[data-image=${label}]`, { opacity: 1, scale: 1 });
        gsap.set(`img[data-image=${label}]`, { zIndex: 1 });
      });
      link.addEventListener("mouseleave", () => {
        gsap.to(`img[data-image=${label}]`, {
          opacity: 0,
          zIndex: -1,
          scale: 0.5,
        });
        link.classList.remove("active");
      });
    });
  }

  updatePosition(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    gsap.to(this.imageCtn.querySelectorAll("img"), {
      x: this.mouse.x,
      y: this.mouse.y,
      ease: Power4.easeOut,
      xPercent: -50,
      yPercent: -50,
      stagger: 0.05,
    });
  }
}
customElements.define("image-reveal", ImageReveal);
