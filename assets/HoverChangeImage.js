class HoverChangeImage extends HTMLElement {
  constructor() {
    super();
    this.links = [...this.querySelectorAll(".names .name")];
    this.images = [...this.querySelectorAll(".images .image")];

    this.callEvent(this.images, this.links);
    this.callClick(this.images, this.links);
  }

  callEvent(images, links) {
    let current = 0;
    const onMouseEnter = (ev) => {
      const position = links.indexOf(ev.target);
      if (position === current) {
        return false;
      }
      const currentImage = images[current];
      const nextImage = images[position];
      current = position;
      gsap.killTweensOf([currentImage, nextImage]);
      this.hide(currentImage);
      this.show(nextImage);
      links.forEach((link) => {
        link.classList.remove("active");
        link.classList.add("inactive");
      });
      ev.target.classList.add("active");
      ev.target.classList.remove("inactive");
    };

    const onMouseLeave = (ev) => {
      links.forEach((link) => {
        link.classList.remove("inactive");
      });
    };

    links.forEach((link) => {
      if (window.innerWidth >= 1025) {
        link.addEventListener("mouseenter", onMouseEnter);
        link.addEventListener("mouseleave", onMouseLeave);
      }
    });
  }

  callClick(images, links) {
    let current = 0;

    links.forEach((link, index) => {
      if (window.innerWidth <= 1024) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const position = index;
          const href = link.querySelector(".link").getAttribute("href");
          if (position === current) {
            window.location.href = href;
            return false;
          }
          const currentImage = images[current];
          const nextImage = images[position];
          current = position;
          this.hide(currentImage);
          this.show(nextImage);
          setTimeout(() => {
            window.location.href = href;
          }, 400);
        });
      }
    });
  }

  show(image) {
    gsap
      .timeline()
      .set(image, {
        opacity: 1,
        zIndex: 1,
      })
      .to(image.querySelector(".image__full"), 1.4, {
        ease: "Power4.easeOut",
        startAt: {
          scale: 1.1,
          rotation: 4,
        },
        scale: 1,
        rotation: 0,
      });
  }

  hide(image) {
    gsap
      .timeline()
      .set(image, {
        zIndex: 2,
      })
      .to(image, 0.8, {
        ease: "Power4.easeOut",
        opacity: 0,
        onComplete: () =>
          gsap.set(image, {
            zIndex: 1,
          }),
      });
  }
}
customElements.define("hover-collection", HoverChangeImage);
