class ThemeTab extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const _targetTab = this.querySelectorAll(".tab-in-mobile");
    _targetTab.forEach((tabEl) => {
      if (tabEl.classList.contains("active")) {
        setTimeout(() => {
          tabEl.style.setProperty("--max-height", `${tabEl.scrollHeight}px`);
        }, 500);
      }
    });
  }

  open(button, tab) {
    const _target = button.closest("li");

    if (_target.classList.contains("active")) return;

    const _active = this.querySelector(`li.active`);
    const _activeTab = this.querySelectorAll(`.tab__content-item.active`);
    const _targetTab = this.querySelectorAll(`[data-tab-id="${tab}"]`);

    _active.classList.remove("active");
    _target.classList.add("active");

    _activeTab.forEach((el) => el.classList.remove("active"));
    _targetTab.forEach((el) => el.classList.add("active"));

    this.load(_targetTab);
  }

  load(tab) {
    tab.forEach((tabEl) => {
      if (!tabEl.getAttribute("loaded")) {
        const content = tabEl.querySelector("template").content.cloneNode(true);
        tabEl.appendChild(content);
        tabEl.setAttribute("loaded", true);
        buttonRippleHover();
      }

      if (tabEl.classList.contains("tab-in-mobile")) {
        setTimeout(() => {
          tabEl.style.setProperty("--max-height", `${tabEl.scrollHeight}px`);
        }, 500);
      }
    });
  }
}
customElements.define("theme-tab", ThemeTab);
