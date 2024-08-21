class AnimateElement extends HTMLElement {
  constructor() {
    super();

    document.addEventListener("page:loaded", () => {
      this.parallaxScroll();
      this.scaleBannerOnScroll();
    });
  }

  connectedCallback() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setAttribute("loaded", true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: `0px 0px 0px 0px` }
    );

    observer.observe(this);
  }

  parallaxScroll() {
    this.querySelectorAll(".animate--prl-scroll img").forEach((img) => {
      let speed = 300;
      let amount = 30;
      let scroll = 0;
      let smooth = 0;
      let diff = 0;

      document.addEventListener("scroll", (event) => {
        scroll = window.scrollY;
      });

      let oldTime = null;
      let delta = 0;

      const animate = (t) => {
        if (oldTime) delta = t - oldTime;
        smooth += ((scroll - smooth) * delta) / speed;
        diff = scroll - smooth;
        let translateCenter = (diff * -2) / amount;

        img.style.transform = `translateY(${translateCenter}px)`;
        oldTime = t;
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    });

    this.querySelectorAll(".animate--prl-scroll.ani--sec img").forEach(
      (img) => {
        let speed = 300;
        let amount = 30;
        let scroll = 0;
        let smooth = 0;
        let diff = 0;

        document.addEventListener("scroll", (event) => {
          scroll = window.scrollY;
        });

        let oldTime = null;
        let delta = 0;

        const animate = (t) => {
          if (oldTime) delta = t - oldTime;
          smooth += ((scroll - smooth) * delta) / speed;
          diff = scroll - smooth;
          let translateCenter = (-diff * -2) / amount;

          img.style.transform = `translateY(${translateCenter}px)`;
          oldTime = t;
          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      }
    );
  }

  scaleBannerOnScroll() {
    const prl = document.querySelectorAll(".prlBg img");
    if (prl.length > 0) {
      prl.forEach((e) => {
        gsap.fromTo(
          e,
          { scale: 1.5 },
          {
            scrollTrigger: {
              start: "top bottom",
              end: "center+=10% center",
              trigger: e.parentElement,
              scrub: 1,
              invalidateOnRefresh: true,
            },
            scale: 1,
          }
        );
      });
    }
  }
}
customElements.define("animate-element", AnimateElement);
