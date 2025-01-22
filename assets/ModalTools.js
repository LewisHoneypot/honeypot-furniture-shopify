class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      "click",
      this.hide.bind(this, false)
    );
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", (event) => {
        if (
          event.pointerType === "mouse" &&
          !event.target.closest("deferred-media, product-model")
        )
          this.hide();
      });
    } else {
      this.addEventListener("click", (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;

    this.checkMoved = Array.from(document.body.children).filter(
      (element) => element.id == this.getAttribute("id")
    );

    if (this.checkMoved.length > 0) {
      this.remove();
    } else {
      document.body.appendChild(this);
    }
  }

  show(opener) {
    this.openedBy = opener;
    document.body.classList.add("o-h");
    this.setAttribute("open", "");
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove("o-h");
    document.body.dispatchEvent(new CustomEvent("modalClosed"));
    this.classList.remove("quick-add--open");
    this.removeAttribute("open");
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  
    // Explicitly blur the active element and clear selection
    if (document.activeElement) {
      document.activeElement.blur(); // Removes focus from the currently active element
    }
  }
}
customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}
customElements.define("modal-opener", ModalOpener);
