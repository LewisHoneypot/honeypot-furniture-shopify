class CustomTab extends HTMLElement {
  constructor() {
    super();

    this.tabLink = this.querySelectorAll("[data-tabs-title]");
    this.showContent = this.querySelectorAll(`.custom__tab-text.active`);

    this.showContent.forEach(
      (showContent) =>
        (showContent.style.maxHeight = `${showContent.scrollHeight}px`)
    );
    this.tabLink.forEach((tabList) =>
      tabList.addEventListener("click", this.tabEvent.bind(this))
    );
  }

  tabEvent(event) {
    event.preventDefault();
    event.stopPropagation();

    const curTab = event.currentTarget;
    const curTabContent = this.querySelector(curTab.getAttribute("data-tab"));
    const _target = curTab.closest("li");

    // Check if the clicked tab is currently active
    if (_target.classList.contains("active")) {
      // If the clicked tab is already active, deactivate it
      _target.classList.remove("active");
      curTabContent.classList.remove("active");
      curTabContent.style.maxHeight = null;
    } else {
      // If the clicked tab is not active, activate it
      const _active = this.querySelector(`li.active`);
      const _activeTab = this.querySelector(`.custom__tab-text.active`);

      if (_active) {
        _active.classList.remove("active");
      }
      if (_activeTab) {
        _activeTab.classList.remove("active");
        _activeTab.style.maxHeight = null;
      }

      _target.classList.add("active");
      curTabContent.classList.add("active");
      curTabContent.style.maxHeight = `${curTabContent.scrollHeight}px`;
    }

    // Ensure that all tabs with the same data-tab attribute are in sync
    this.querySelectorAll(`[data-tabs-title]`).forEach((iconTab) => {
      const _targetMobile = iconTab.closest("li");
      if (
        curTab.getAttribute("data-tab") === iconTab.getAttribute("data-tab")
      ) {
        if (_target.classList.contains("active")) {
          _targetMobile.classList.add("active");
        } else {
          _targetMobile.classList.remove("active");
        }
      } else {
        _targetMobile.classList.remove("active");
      }
    });
  }
}

customElements.define("custom-tab", CustomTab);
