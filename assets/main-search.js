class MainSearch extends SearchForm {
  constructor() {
    super();
    this.allSearchInputs = document.querySelectorAll('input[type="search"]');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.querySelector('[id^="Popup-Overlay-"]')?.addEventListener('click', this.close.bind(this));
    this.allSearchInputs.forEach(input =>
      input.addEventListener('click', this.open.bind(this))
    );

    let allSearchForms = [];
    this.allSearchInputs.forEach(input => allSearchForms.push(input.form))
    this.input.addEventListener('focus', this.onInputFocus.bind(this));
    if (allSearchForms.length < 2) return;
    allSearchForms.forEach(form =>
      form.addEventListener('reset', this.onFormReset.bind(this))
    );
    this.allSearchInputs.forEach(input =>
      input.addEventListener('input', this.onInput.bind(this))
    );

    
    this.allSearchInputs.forEach(input =>
      input.addEventListener('click', this.onInput.bind(this))
    );
  }

  onFormReset(event) {
    super.onFormReset(event);
    if (super.shouldResetForm()) {
      this.keepInSync('', this.input);
    }
  }

  onInput(event) {
    const target = event.target;
    this.keepInSync(target.value, target);
  }

  onInputFocus() {
    const isSmallScreen = window.innerWidth < 750;
    if (isSmallScreen) {
      this.scrollIntoView({behavior: 'smooth'});
    }
  }

  keepInSync(value, target) {
    this.allSearchInputs.forEach(input => {
      if (input !== target) {
        input.value = value;
      }
    });
  }

  open() {
    setTimeout(() => {this.classList.add('animate', 'active')});
    this.querySelector('.field').classList.add('z-index-8');
  }

  close() {
    this.classList.remove('active');
    this.querySelector('.field').classList.remove('z-index-8');
  }
}

customElements.define('main-search', MainSearch);
