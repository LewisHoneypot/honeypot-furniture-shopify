class BeforeAfterCursor extends HTMLElement {
  connectedCallback() {
    this.parentSection = this.closest(".shopify-section");
    this.dragging = false;
    this.offsetX = this.currentX = 0;
    this.parentSection.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this)
    );
    this.parentSection.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this)
    );
    this.parentSection.addEventListener(
      "pointerup",
      this.onPointerUp.bind(this)
    );
    window.addEventListener("resize", this.recalculateOffset.bind(this));
  }

  get minOffset() {
    if (window.innerWidth >= 1200) {
      return -this.offsetLeft + 26;
    } else {
      return -this.offsetLeft + 16;
    }
  }

  get maxOffset() {
    if (window.innerWidth >= 1200) {
      return this.offsetParent.clientWidth + this.minOffset - 52;
    } else {
      return this.offsetParent.clientWidth + this.minOffset - 32;
    }
  }

  onPointerDown(event) {
    if (event.target === this || this.contains(event.target)) {
      this.initialX = event.clientX - this.offsetX;
      this.dragging = true;

      if (
        document.querySelector(`.section-b-a-image animate-element[loaded]`)
      ) {
        document
          .querySelector(".before-after__after-image")
          .style.setProperty("transition", "0s");
      }
    }
  }

  onPointerMove(event) {
    if (!this.dragging) {
      return;
    }
    this.currentX = Math.min(
      Math.max(event.clientX - this.initialX, this.minOffset),
      this.maxOffset
    );
    this.offsetX = this.currentX;
    this.parentSection.style.setProperty(
      "--clip-path-offset",
      `${this.currentX.toFixed(1)}px`
    );
  }

  onPointerUp() {
    this.dragging = false;
  }

  recalculateOffset() {
    this.parentSection.style.setProperty(
      "--clip-path-offset",
      `${Math.min(
        Math.max(this.minOffset, this.currentX.toFixed(1)),
        this.maxOffset
      )}px`
    );
  }
}
customElements.define("split-cursor", BeforeAfterCursor);
