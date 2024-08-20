class CursorBlur extends HTMLElement {
  constructor() {
    super();

    this.pos = { x: 0, y: 0 };
    this.ratio = 0.65;

    this.isStuck = false;
    this.mouse = {
      x: -100,
      y: -100,
    };

    this.cursorBlur = this.querySelector(".cursor--blur");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    document.addEventListener(
      "pointermove",
      this.updateCursorPosition.bind(this)
    );
  }

  getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
  }

  updateCursorPosition(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    this.pos.x += (this.mouse.x - this.pos.x) * this.ratio;
    this.pos.y += (this.mouse.y - this.pos.y) * this.ratio;

    gsap.to(this.cursorBlur, {
      duration: 0.15,
      x: this.pos.x,
      y: this.pos.y,
      xPercent: -50,
      yPercent: -50,
    });
  }
}

customElements.define("cursor-blur", CursorBlur);