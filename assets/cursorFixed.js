class CursorFixed extends HTMLElement {
  constructor() {
    super();

    this.pos = { x: 0, y: 0 };
    this.ratio = 0.65;

    this.isStuck = false;
    this.mouse = {
      x: -100,
      y: -100,
    };

    this.cursorOuter = this.querySelector(".cursor--large");
    this.cursorInner = this.querySelector(".cursor--small");

    this.cursorOuterOriginalState = {
      width: this.cursorOuter.getBoundingClientRect().width,
      height: this.cursorOuter.getBoundingClientRect().height,
    };
  }

  connectedCallback() {
    window.shareFunctionAnimation = {
      onEnterButton: this.onEnterButton.bind(this),
      onLeaveButton: this.onLeaveButton.bind(this),
    };

    if (window.matchMedia("(min-width: 1200px)").matches) {
      this.init();
      this.onEnterButton();
      this.onLeaveButton();
      this.onEnterMedia();
      this.onLeaveMedia();
      this.parallaxTargetMove();
      this.parallaxTargetEnter();
      this.parallaxTargetLeave();
      this.onEnterDrawerOverlay();
      this.onLeaveDrawerOverlay();
      this.onHideCursor();
      this.onLeaveHideCursor();
    }

    window.matchMedia("(min-width: 1200px)").onchange = (event) => {
      if (event.matches) {
        this.init();
        this.onEnterButton();
        this.onLeaveButton();
        this.onEnterMedia();
        this.onLeaveMedia();
        this.parallaxTargetMove();
        this.parallaxTargetEnter();
        this.parallaxTargetLeave();
        this.onEnterDrawerOverlay();
        this.onLeaveDrawerOverlay();
        this.onHideCursor();
        this.onLeaveHideCursor();
      }
    };
  }

  init() {
    document.addEventListener("pointermove", this.moveOnSite.bind(this));
    document.addEventListener("pointerenter", this.moveOnSite.bind(this));
    document.addEventListener("pointerleave", this.moveOutSite.bind(this));
    document.addEventListener("pointerout", this.moveOutSite.bind(this));

    document.addEventListener(
      "pointermove",
      this.updateCursorPosition.bind(this)
    );
    document.addEventListener("pointerdown", this.pointerDown.bind(this));
    document.addEventListener("pointerup", this.pointerUp.bind(this));
  }

  moveOutSite() {
    gsap.to(this, 0.15, {
      opacity: 0,
    });
  }

  moveOnSite() {
    gsap.to(this, 0.15, {
      opacity: 1,
    });
  }

  pointerDown() {
    if (!this.classList.contains("on-overlay")) {
      gsap.to(this.cursorInner, 0.15, {
        scale: 2,
      });

      gsap.to(this.cursorOuter, 0.15, {
        scale: 2,
      });
    }
  }

  pointerUp() {
    gsap.to(this.cursorInner, 0.15, {
      scale: 1,
    });

    gsap.to(this.cursorOuter, 0.15, {
      scale: 1,
    });

    if (this.classList.contains("on-overlay"))
      this.classList.remove("on-overlay");
  }

  parallaxTargetMove() {
    const parallaxItems = document.querySelectorAll(
      ".cursor-fixed__parallax-target"
    );

    parallaxItems.forEach((item) => {
      item.addEventListener("pointermove", (e) => {
        this.callParallax(e, item, item);
      });
    });

    const dots = document.querySelectorAll(
      ".swiper-pagination-bullets:not(.swiper-pagination-dashed) .swiper-pagination-bullet"
    );

    dots.forEach((item) => {
      item.addEventListener("pointermove", (e) => {
        this.callParallax(e, item, item);
        gsap.to(this.cursorInner, 0.15, {
          opacity: 0,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 2,
        });
      });
    });

    const nextPrevButtons = document.querySelectorAll(".button-slider");

    nextPrevButtons.forEach((button) => {
      button.addEventListener("pointermove", (e) => {
        if (!button.classList.contains("preventParallax"))
          this.callParallax(e, button, button);
        gsap.to(this.cursorInner, 0.15, {
          opacity: 0,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 2,
        });
      });
    });
  }

  parallaxTargetEnter() {
    const parallaxItems = document.querySelectorAll(
      ".cursor-fixed__parallax-target"
    );

    parallaxItems.forEach((item) => {
      item.addEventListener("pointerenter", (e) => {
        const a_link = item.querySelector("a.button");
        if (a_link) item.classList.add("has-link");

        item.classList.add("on-hover");
        gsap.to(this.cursorInner, 0.15, {
          opacity: 0,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 2,
        });
      });
    });

    const nextPrevButtons = document.querySelectorAll(".button-slider");

    nextPrevButtons.forEach((button) => {
      button.addEventListener("pointerenter", (e) => {
        button.classList.add("on-hover");
        gsap.to(this.cursorInner, 0.15, {
          opacity: 0,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 2,
        });
      });
    });
  }

  parallaxTargetLeave() {
    const parallaxItems = document.querySelectorAll(
      ".cursor-fixed__parallax-target"
    );

    parallaxItems.forEach((item) => {
      item.addEventListener("pointerleave", (e) => {
        const a_link = item.querySelector("a.button");
        if (a_link) item.classList.remove("has-link");

        item.classList.remove("on-hover");

        gsap.to(item, { duration: 0.3, x: 0, y: 0 });

        gsap.to(this.cursorInner, 0.15, {
          opacity: 1,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 1,
        });
      });
    });

    const dots = document.querySelectorAll(".swiper-pagination-bullet");

    dots.forEach((item) => {
      item.addEventListener("pointerleave", (e) => {
        item.classList.remove("on-hover");

        gsap.to(item, { duration: 0.3, x: 0, y: 0 });

        gsap.to(this.cursorInner, 0.15, {
          opacity: 1,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 1,
        });
      });
    });

    const nextPrevButtons = document.querySelectorAll(".button-slider");

    nextPrevButtons.forEach((button) => {
      button.addEventListener("pointerleave", (e) => {
        button.classList.remove("on-hover");

        gsap.to(button, { duration: 0.3, x: 0, y: 0 });

        gsap.to(this.cursorInner, 0.15, {
          opacity: 1,
        });

        gsap.to(this.cursorOuter, 0.15, {
          scale: 1,
        });
      });
    });
  }

  onHideCursor() {
    const hideCs = document.querySelectorAll(".hide-cursor");
    hideCs.forEach((e) => {
      e.addEventListener("pointerenter", () => {
        gsap.to(this.querySelector(".cursor-fixed__wrap"), 0.15, {
          opacity: 0,
        });
      });
      e.addEventListener("pointermove", () => {
        gsap.to(this.querySelector(".cursor-fixed__wrap"), 0.15, {
          opacity: 0,
        });
      });
    });
  }

  onLeaveHideCursor() {
    const hideCs = document.querySelectorAll(".hide-cursor");
    hideCs.forEach((e) => {
      e.addEventListener("pointerout", () => {
        gsap.to(this.querySelector(".cursor-fixed__wrap"), 0.15, {
          opacity: 1,
        });
      });
    });
  }

  onEnterDefault() {
    gsap.to(this.cursorInner, 0.15, {
      opacity: 0,
    });

    gsap.to(this.cursorOuter, 0.15, {
      scale: 2,
    });
  }

  onLeaveDefault() {
    gsap.to(this.cursorInner, 0.15, {
      opacity: 1,
    });

    gsap.to(this.cursorOuter, 0.15, {
      scale: 1,
    });
  }

  onEnterMedia() {
    const media = document.querySelectorAll("a.media");

    media.forEach((item) => {
      item.addEventListener("pointerenter", (e) => {
        this.onEnterDefault();
      });
    });
  }

  onLeaveMedia() {
    const media = document.querySelectorAll("a.media");

    media.forEach((item) => {
      item.addEventListener("pointerout", (e) => {
        this.onLeaveDefault();
      });
    });
  }

  onEnterButton() {
    const buttons = document.querySelectorAll(".button, .button *");

    buttons.forEach((btn) => {
      btn.addEventListener("pointerenter", (e) => {
        if (
          !btn.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onEnterDefault();
        }
      });
    });

    const buttonsTag = document.querySelectorAll("button");

    buttonsTag.forEach((btn) => {
      btn.addEventListener("pointerenter", (e) => {
        if (
          !btn.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onEnterDefault();
        }
      });
    });

    const tButtons = document.querySelectorAll(".t-button, .t-button *");

    tButtons.forEach((btn) => {
      btn.addEventListener("pointerenter", (e) => {
        if (
          !btn.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onEnterDefault();
        }
      });
    });

    const linksTag = document.querySelectorAll("a");

    linksTag.forEach((link) => {
      link.addEventListener("pointerenter", (e) => {
        if (
          !link.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onEnterDefault();
        }
      });
    });

    const selectsTag = document.querySelectorAll("select");
    selectsTag.forEach((select) => {
      select.addEventListener("pointerenter", (e) => {
        if (
          !select.parentElement.classList.contains(
            "cursor-fixed__parallax-inner"
          )
        ) {
          this.onEnterDefault();
        }
      });
    });

    const links = document.querySelectorAll(".link, .link *");

    links.forEach((link) => {
      link.addEventListener("pointerenter", (e) => {
        this.onEnterDefault();
      });
    });

    const openers = document.querySelectorAll(
      "side-drawer-opener, side-drawer-opener *"
    );

    openers.forEach((open) => {
      open.addEventListener("pointerenter", (e) => {
        this.onEnterDefault();
      });
    });

    const linkCovers = document.querySelectorAll(
      "a.link-cover, a.link-cover *"
    );

    linkCovers.forEach((open) => {
      open.addEventListener("pointerenter", (e) => {
        this.onEnterDefault();
      });
    });

    const btnRipple = document.querySelectorAll(".button--style-ripple");
    btnRipple.forEach((btn) => {
      btn.addEventListener("pointerenter", () => {
        gsap.to(this.cursorInner, 0.15, { opacity: 0 });

        gsap.to(this.cursorOuter, 0.15, { opacity: 0 });
      });
    });
  }

  onLeaveButton() {
    const buttons = document.querySelectorAll(".button");

    buttons.forEach((btn) => {
      btn.addEventListener("pointerout", (e) => {
        if (
          !btn.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onLeaveDefault();
        }
      });
    });

    const buttonsTag = document.querySelectorAll("button");

    buttonsTag.forEach((btn) => {
      btn.addEventListener("pointerout", (e) => {
        if (
          !btn.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onLeaveDefault();
        }
      });
    });

    const tButtons = document.querySelectorAll(".t-button, .t-button *");

    tButtons.forEach((btn) => {
      btn.addEventListener("pointerout", (e) => {
        if (
          !btn.parentElement.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onLeaveDefault();
        }
      });
    });

    const linksTag = document.querySelectorAll("a");

    linksTag.forEach((link) => {
      link.addEventListener("pointerout", (e) => {
        if (
          !link.parentElement.classList.contains(
            "cursor-fixed__parallax-inner"
          ) &&
          !link.classList.contains("cursor-fixed__parallax-target")
        ) {
          this.onLeaveDefault();
        }
      });
    });

    const selectsTag = document.querySelectorAll("select");
    selectsTag.forEach((select) => {
      select.addEventListener("pointerout", (e) => {
        if (
          !select.parentElement.classList.contains(
            "cursor-fixed__parallax-inner"
          ) &&
          !select.classList.contains("cursor-fixed__parallax-inner")
        ) {
          this.onLeaveDefault();
        }
      });
    });

    const links = document.querySelectorAll(".link, .link *");

    links.forEach((link) => {
      link.addEventListener("pointerout", (e) => {
        this.onLeaveDefault();
      });
    });

    const openers = document.querySelectorAll(
      "side-drawer-opener, side-drawer-opener *"
    );

    openers.forEach((link) => {
      link.addEventListener("pointerout", (e) => {
        this.onLeaveDefault();
      });
    });

    const linkCovers = document.querySelectorAll(
      "a.link-cover, a.link-cover *"
    );

    linkCovers.forEach((link) => {
      link.addEventListener("pointerout", (e) => {
        this.onLeaveDefault();
      });
    });

    const btnRipple = document.querySelectorAll(".button--style-ripple");
    btnRipple.forEach((btn) => {
      btn.addEventListener("pointerout", () => {
        gsap.to(this.cursorInner, 0.15, { opacity: 1 });

        gsap.to(this.cursorOuter, 0.15, { opacity: 1 });
      });
    });
  }

  onEnterDrawerOverlay() {
    const overlays = document.querySelectorAll(".drawer__overlay:empty");

    overlays.forEach((ovl) => {
      ovl.addEventListener("pointermove", () => {
        this.classList.add("on-overlay");

        gsap.to(this.cursorOuter, 0.15, {
          scale: 2,
        });
      });
    });
  }

  onLeaveDrawerOverlay() {
    const overlays = document.querySelectorAll(".drawer__overlay:empty");

    overlays.forEach((ovl) => {
      ovl.addEventListener("pointerout", () => {
        this.classList.remove("on-overlay");

        gsap.to(this.cursorOuter, 0.15, {
          scale: 1,
        });
      });
    });
  }

  callParallax(e, parent) {
    this.parallaxIt(e, parent, 20);
  }

  parallaxIt(e, parent, movement) {
    const rect = parent.getBoundingClientRect();

    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;

    gsap.to(parent, 0.3, {
      x: ((this.mouse.x - rect.width / 2) / rect.width) * movement,
      y: ((this.mouse.y - rect.height / 2) / rect.height) * movement,
      ease: "Power2.easeOut",
    });
  }

  updateCursorPosition(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    this.pos.x += (this.mouse.x - this.pos.x) * this.ratio;
    this.pos.y += (this.mouse.y - this.pos.y) * this.ratio;

    gsap.to(this.cursorInner, {
      duration: 0.1,
      x: this.pos.x,
      y: this.pos.y,
      xPercent: -50,
      yPercent: -50,
      ease: "Power2.easeOut",
    });

    gsap.to(this.cursorOuter, {
      duration: 0.4,
      x: this.pos.x,
      y: this.pos.y,
      xPercent: -50,
      yPercent: -50,
    });
  }
}

customElements.define("cursor-fixed", CursorFixed);
