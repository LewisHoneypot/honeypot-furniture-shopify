class CursorMove extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.isStuck = false;
    this.mouse = {
      x: -100,
      y: -100,
    };

    this.cursor = this.querySelector(".cursor-move");
    this.cursorOuterOriginalState = {
      width: this.cursor.getBoundingClientRect().width,
      height: this.cursor.getBoundingClientRect().height,
    };

    this.target = this.querySelector("[data-cursor-target]")
      ? this.querySelector("[data-cursor-target]")
      : this;

    this.target.addEventListener("pointerenter", () => {
      gsap.to(this.cursor, 0.8, {
        scale: 2,
        ease: Bounce.easeOut,
        opacity: 1,
      });
    });
    this.target.addEventListener("mouseleave", () => {
      gsap.killTweensOf(this.cursor);
      gsap.to(this.cursor, {
        scale: 0,
        opacity: 0,
      });
    });

    this.target.addEventListener("pointermove", this.updatePosition.bind(this));
  }

  updatePosition(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    gsap.to(this.cursor, 0.5, {
      x: this.mouse.x - this.cursorOuterOriginalState.width / 2,
      y: this.mouse.y - this.cursorOuterOriginalState.height / 2,
      ease: Power4.easeOut,
    });
  }
}
customElements.define("cursor-move", CursorMove);
