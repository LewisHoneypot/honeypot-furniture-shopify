class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector(".section-header");
    this.logoSpecial = this.querySelector(`.header--logo-special`);
    this.headerBounds = {};
    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector("predictive-search");

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => (this.preventReveal = true);

    this.addEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp);
    window.addEventListener("scroll", this.onScrollHandler, false);

    this.createObserver();

    if (
      this.classList.contains("transparent") &&
      document.querySelector(".section__slideshow")
    ) {
      document
        .querySelector(".section__slideshow")
        .style.setProperty(
          "--has-header-transparent",
          `${this.offsetHeight}px`
        );
      window.addEventListener("resize", () => {
        document
          .querySelector(".section__slideshow")
          .style.setProperty(
            "--has-header-transparent",
            `${this.offsetHeight}px`
          );
      });
    }

    if (this.logoSpecial) {
      this.header.classList.add("pos-sticky", "top-0", "animate");
      this.onScrollHandlerLogo = this.onScrollLogo.bind(this);
      window.addEventListener("scroll", this.onScrollHandlerLogo, false);

      this.resize();
      window.addEventListener("resize", () => {
        this.resize(true);
      });
    }

    this.checkTransparent();
  }

  resize(setAuto) {
    if (setAuto) this.logoSpecial.style.height = `auto`;
    this.onScrollHandlerLogo();

    this.logoSpecial.addEventListener("transitionstart", () => {
      this.header.classList.add("animating");
    });

    this.logoSpecial.addEventListener("transitionend", () => {
      this.header.classList.remove("animating");
    });
  }

  disconnectedCallback() {
    this.removeEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp);
    window.removeEventListener("scroll", this.onScrollHandler);
    if (this.logoSpecial)
      window.removeEventListener("scroll", this.onScrollHandlerLogo);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  onScrollLogo() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.header.matches(".animating")) return;
    scrollTop <= 0 && scrollTop < this.logoSpecial.scrollHeight
      ? requestAnimationFrame(this.enableLogoSpecial.bind(this))
      : requestAnimationFrame(this.disableLogoSpecial.bind(this));
  }

  hide() {
    this.header.classList.add("pos-sticky", "top-0");
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.add("sticky-hidden");
    document.body.classList.add("scroll-down");
    document.body.classList.remove("scroll-up");
  }

  reveal() {
    this.header.classList.add("pos-sticky", "top-0", "animate");
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.remove("sticky-hidden");
    document.body.classList.add("scroll-up");
    document.body.classList.remove("scroll-down");
  }

  reset() {
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.remove(
        "sticky-hidden",
        "pos-sticky",
        "top-0",
        "animate"
      );
    document.body.classList.remove("scroll-down", "scroll-up");
  }

  enableLogoSpecial() {
    this.header.classList.add(
      "disable--logo-small",
      "pos-sticky",
      "top-0",
      "animate"
    );
    this.header.classList.remove("enable--logo-small");
    this.logoSpecial.style.height = `${this.logoSpecial.scrollHeight}px`;
  }

  disableLogoSpecial() {
    this.header.classList.add("enable--logo-small");
    this.header.classList.remove("disable--logo-small");
    this.logoSpecial.style.height = `0px`;
  }

  checkTransparent() {
    const sectionHeaderGroup = document.querySelectorAll(
      ".shopify-section-group-header-group"
    );
    if (
      !this.matches(".transparent") ||
      sectionHeaderGroup.length == 1 ||
      sectionHeaderGroup[sectionHeaderGroup.length - 1].matches(
        ".section-header"
      )
    )
      return;
    this.classList.remove("transparent", "pos-absolute");
  }
}
customElements.define("sticky-header", StickyHeader);
