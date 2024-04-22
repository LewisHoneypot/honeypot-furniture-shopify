class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    document.querySelector('.product-filter-sorting').removeAttribute('open');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
        FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;

    document.getElementById('ProductGridContainer').querySelectorAll('.scroll-trigger').forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
    });
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'))
      this.onSubmitForm(searchParams, event)
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            const noJsElements = document.querySelectorAll('.no-js-list');
            noJsElements.forEach((el) => el.remove());
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event)
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
    this.setPriceSlider();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }

  setPriceSlider() {
    const rangeInput = this.querySelectorAll('input[type=range]');
    const priceInput = this.querySelectorAll('input[type=number]');
    const progress = this.querySelector('.progress');

    let priceGap = 0, left, right;

    if(!rangeInput.length) return;

    priceInput.forEach((element) => {
      element.oninput = (event) => {
        let minPrice = parseInt(priceInput[0].value),
          maxPrice = parseInt(priceInput[1].value);

        if((maxPrice - minPrice >= priceGap) && maxPrice <= rangeInput[1].max){
          if(event.target.name == 'min'){
            rangeInput[0].value = minPrice;
            left = (minPrice / rangeInput[0].max) * 100;
            progress.style.setProperty('--left', `${left}%`);
          } else{
            rangeInput[1].value = maxPrice;
            right = 100 - (maxPrice / rangeInput[1].max) * 100;
            progress.style.setProperty('--right', `${right}%`);
          }
        }
      }
    });

    if(rangeInput.length) {
      rangeInput.forEach((element) => {
        let defaultMin = parseInt(rangeInput[0].value),
          defaultMax = parseInt(rangeInput[1].value);

        left = (defaultMin / rangeInput[0].max) * 100;
        right = 100 - (defaultMax / rangeInput[1].max) * 100;

        progress.style.setProperty('--left', `${left}%`);
        progress.style.setProperty('--left', `${left}%`);

        element.oninput = (event) => {
          let minVal = parseInt(rangeInput[0].value),
            maxVal = parseInt(rangeInput[1].value);

          if((maxVal - minVal) < priceGap){
            if(event.target.name == 'min'){
              rangeInput[0].value = maxVal - priceGap
            } else{
              rangeInput[1].value = minVal + priceGap;
            }
          } else {
            priceInput[0].value = minVal;
            priceInput[1].value = maxVal;

            left = (minVal / rangeInput[0].max) * 100;
            right = 100 - (maxVal / rangeInput[1].max) * 100;

            progress.style.setProperty('--left', `${left}%`);
            progress.style.setProperty('--left', `${left}%`);
          }
        }
      });
    }
  }
}

customElements.define('price-range', PriceRange);

class LayoutSwitcher extends HTMLElement {
  constructor() {
    super();
    this.storageName = 'collection-page';
    this.initColGrid();
    this.querySelectorAll('.list-switcher__item').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
	}

  onButtonClick(event) {
    const target = event.currentTarget ? event.currentTarget : event;
    this.changeColGrid(target, target.dataset.colGrid);
  }

  initColGrid() {
    if (storageCookie('storageLocal')) {
      const colGrid = window.localStorage.getItem(this.storageName);

      if (colGrid !== null) {
        const target = this.querySelector(`.list-switcher__item[data-col-grid="${colGrid}"]`);

        if (target) {
          this.changeColGrid(target, colGrid);
        }
      }
    }
  }

  changeColGrid(target, colGrid) {
    const listProductGrid = document.getElementById('product-grid');

    if (listProductGrid.classList.contains('collection--empty')) {
      return;
    }

    const removeClass = ['list', 'grid--column-1-tablet', 'grid--column-2-tablet', 'grid--column-3-tablet', 'grid--column-1-desktop', 'grid--column-2-desktop', 'grid--column-3-desktop', 'grid--column-4-desktop', 'grid--column-5-desktop'];
    removeClass.forEach((removed) => {
      listProductGrid.classList.remove(removed);
    });

    let addClass = [];
    switch (colGrid) {
      case 'list':
        addClass = ['grid--column-1-tablet', 'grid--column-1-desktop', 'list'];
        break;

      case 'grid-2':
        addClass = ['grid--column-2-tablet', 'grid--column-2-desktop'];
        break;

      case 'grid-3':
        addClass = ['grid--column-3-tablet', 'grid--column-3-desktop'];
        break;

      case 'grid-4':
        addClass = ['grid--column-3-tablet', 'grid--column-4-desktop'];
        break;

      case 'grid-5':
        addClass = ['grid--column-3-tablet', 'grid--column-5-desktop'];
        break;
    }
    addClass.forEach((added) => {
      listProductGrid.classList.add(added);
    });

    this.querySelectorAll('.list-switcher__item').forEach(
      (button) => button.classList.remove('list-switcher__item--active')
    );
    target.classList.add('list-switcher__item--active');

    if(storageCookie('storageLocal')) {
      window.localStorage.setItem(this.storageName, colGrid);
    }
  }
}
customElements.define('layout-switcher', LayoutSwitcher);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);
