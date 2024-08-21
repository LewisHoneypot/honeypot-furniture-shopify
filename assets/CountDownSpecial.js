class CountDownSpecial extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!window.matchMedia("(max-width: 1024px)").matches)
      requestAnimationFrame(this.bannerOnScroll.bind(this));
    if (
      this.querySelector(".block-logo")?.closest(
        `.shopify-section-group-header-group`
      ) &&
      !window.matchMedia("(max-width: 749px)").matches
    )
      requestAnimationFrame(this.logoOnScroll.bind(this));

    if (!this.closest(`.shopify-section-group-header-group`))
      this.classList.add("section--body");

    if (
      document.body.classList.contains("page-index") &&
      this.closest(`.shopify-section-group-header-group`) &&
      !window.matchMedia("(max-width: 749px)").matches
    ) {
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("opacity", "0");
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("transition", `opacity 0.3s ease`);
      this.onScrollHandler = this.onScroll.bind(this);
      window.addEventListener("scroll", this.onScrollHandler, false);
    }
  }

  disconnectedCallback() {
    if (
      document.body.classList.contains("page-index") &&
      this.closest(`.shopify-section-group-header-group`) &&
      !window.matchMedia("(max-width: 749px)").matches
    )
      window.removeEventListener("scroll", this.onScrollHandler);
  }

  onScroll() {
    if (this && this.check(this, this.offsetHeight)) {
      // Run
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("opacity", "0");
      if (
        this.querySelector(".block-logo")?.closest(
          `.shopify-section-group-header-group`
        )
      )
        this.querySelector(".block-logo").style.setProperty("opacity", "1");
    } else {
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("opacity", "1");
      if (
        this.querySelector(".block-logo")?.closest(
          `.shopify-section-group-header-group`
        )
      )
        this.querySelector(".block-logo").style.setProperty("opacity", "0");
    }
  }

  check(element, threshold) {
    let rect = element.getBoundingClientRect().y;
    threshold = threshold ? threshold : 0;
    return rect + threshold > 0;
  }

  bannerOnScroll() {
    const logoScroll = gsap.utils.toArray(".p-w__media");
    logoScroll.forEach((item) => {
      let event = item,
        ctn = event.closest(".section__countdown-s-hero"),
        hItem = event.offsetHeight,
        hCtn = ctn.offsetHeight - event.offsetHeight / 3,
        n = hItem - hCtn;

      event.style.transition = "0s";
      gsap.fromTo(
        event,
        {
          y: -n * 1.2,
          scale: item.closest(
            `.shopify-section-group-header-group.countdown-s-hero`
          )
            ? 1 - 0.1
            : 1,
        },
        {
          scrollTrigger: {
            scrub: !0,
            trigger: ctn,
            invalidateOnRefresh: !0,
          },
          y: n * 1.2,
          scale: item.closest(
            `.shopify-section-group-header-group.countdown-s-hero`
          )
            ? 1.1
            : 1,
          ease: "none",
        }
      );
    });
  }

  logoOnScroll() {
    let event = this.closest(
      ".shopify-section-group-header-group"
    ).querySelector(".block-logo"),
      ctn = event.closest(".section__countdown-s-hero"),
      hItem = event.offsetHeight,
      hCtn = ctn.offsetHeight,
      n = hItem - hCtn;

    event.style.transition = "0s";
    gsap.fromTo(
      event,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      }
    );

    /* block-logo animation */
    let logoTl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 0,
        end: () => window.innerHeight * 0.8,
        scrub: 0.6,
      },
    });
    logoTl.fromTo(
      event,
      {
        scale: 1,
        y: hCtn - hItem - 126,
        yPercent: 0,
      },
      {
        scale: 0.1,
        duration: 0.8,
        y: n * -0.2 + 30,
        yPercent: 0,
      }
    );

    // blocks-content animation
    if (this.querySelector(".banner__logo")) {
      let event = this.closest(
        ".shopify-section-group-header-group"
      ).querySelector(".blocks-content"),
        spacingLogo = hCtn - (hItem + 126),
        hcontent = hCtn + (spacingLogo + hItem + 32) * -1,
        contentTl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 0,
            end: () => window.innerHeight * 1.2,
            scrub: 0.6,
          },
        });
      contentTl.fromTo(
        event,
        {
          top: hCtn / 2 + (hcontent + hItem - 26) * -1,
          y: 0,
        },
        {
          top: hItem - 126 - 32,
          y: n * 0.5,
        }
      );
    }
  }
}
customElements.define("countdown-special", CountDownSpecial);
