(() => {
  // Trigger events when going between breakpoints
  const mqList = [
    {
      name: "Mobile",
      screen: "(max-width: 749px)",
    },
    {
      name: "ExtraLarge",
      screen: "(max-width: 1199px)",
    },
  ];

  mqList.forEach((breakpoint) => {
    window.matchMedia(breakpoint.screen).onchange = (event) => {
      if (event.matches) {
        document.dispatchEvent(new CustomEvent(`match${breakpoint.name}`));
      } else {
        document.dispatchEvent(new CustomEvent(`unmatch${breakpoint.name}`));
      }
    };
  });

  // Detect events when page has loaded
  window.addEventListener("beforeunload", () => {
    document.body.classList.add("u-p-load");
  });

  window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("p-load");

    document.dispatchEvent(new CustomEvent("page:loaded"));
  });

  window.addEventListener("pageshow", (event) => {
    // Removes unload class when the page was cached by the browser
    if (event.persisted) {
      document.body.classList.remove("u-p-load");
    }
  });
})();

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe, span[focus-visible]"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute("role", "button");
  summary.setAttribute(
    "aria-expanded",
    summary.parentNode.hasAttribute("open")
  );

  if (summary.nextElementSibling.getAttribute("id")) {
    summary.setAttribute("aria-controls", summary.nextElementSibling.id);
  }

  summary.addEventListener("click", (event) => {
    event.currentTarget.setAttribute(
      "aria-expanded",
      !event.currentTarget.closest("details").hasAttribute("open")
    );

    if (
      summary.closest("details").querySelector(".details_smooth") &&
      window.matchMedia("(max-width: 990px)")
    ) {
      summary.closest("details").querySelector(".details_smooth").style[
        "overflow"
      ] = "hidden";
      if (event.currentTarget.closest("details").hasAttribute("open")) {
        event.preventDefault();

        setTimeout(function () {
          summary.closest("details").removeAttribute("open");
        }, 500);
        summary.closest("details").querySelector(".details_smooth").style[
          "max-height"
        ] = "0rem";
        summary.closest("details").querySelector(".details_smooth").style[
          "transition"
        ] = "max-height 0.5s ease";
      } else {
        summary.closest("details").querySelector(".details_smooth").style[
          "max-height"
        ] = "100vh";
        summary.closest("details").querySelector(".details_smooth").style[
          "transition"
        ] = "max-height 1s ease";
      }
    }
  });

  if (summary.closest("header-drawer")) return;
  summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === "INPUT" &&
    ["search", "text", "email", "url"].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

function getScrollbarWidth() {
  const width = window.innerWidth - document.documentElement.clientWidth;

  if (width > 18) return;
  document.documentElement.style.setProperty("--scrollbar-width", `${width}px`);
}

getScrollbarWidth();

function buildStyleSheet(name, $this) {
  if (name == "") return;
  const loadStyleSheet = document.createElement("link");
  loadStyleSheet.rel = "stylesheet";
  loadStyleSheet.type = "text/css";
  loadStyleSheet.href = name;
  $this
    .querySelector(".url__data")
    .parentNode.insertBefore(loadStyleSheet, $this.querySelector(".url__data"));
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    "ARROWUP",
    "ARROWDOWN",
    "ARROWLEFT",
    "ARROWRIGHT",
    "TAB",
    "ENTER",
    "SPACE",
    "ESCAPE",
    "HOME",
    "END",
    "PAGEUP",
    "PAGEDOWN",
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener("keydown", (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener("mousedown", (event) => {
    mouseClick = true;
  });

  window.addEventListener(
    "focus",
    () => {
      if (currentFocusedElement)
        currentFocusedElement.classList.remove("focused");

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add("focused");
    },
    true
  );
}

function pauseAllMedia() {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
      "*"
    );
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("product-model").forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function storageCookie(type) {
  if (window.self !== window.top) {
    return false;
  }

  const nimo = "nimo:test";
  let storage;
  if (type === "storageLocal") {
    storage = window.localStorage;
  }
  if (type === "storageSession") {
    storage = window.sessionStorage;
  }

  try {
    storage.setItem(nimo, "1");
    storage.removeItem(nimo);
    return true;
  } catch (error) {
    return false;
  }
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;

  const openDetailsElement = event.target.closest("details[open]");
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector("summary");
  openDetailsElement.removeAttribute("open");
  summaryElement.setAttribute("aria-expanded", false);
  summaryElement.focus();
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

/*
 * Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options["hideElement"] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

function splittingText() {
  Splitting({
    target: "[data-splitting = 'chars']",
    by: "chars",
    key: null,
  });
  Splitting({
    target: "[data-splitting = 'words']",
    by: "words",
    key: null,
  });
}

splittingText();

class AnimateElement extends HTMLElement {
  constructor() {
    super();

    document.addEventListener("page:loaded", () => {
      this.parallaxScroll();
      this.scaleBannerOnScroll();
    });
  }

  connectedCallback() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setAttribute("loaded", true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: `0px 0px 0px 0px` }
    );

    observer.observe(this);
  }

  parallaxScroll() {
    this.querySelectorAll(".animate--prl-scroll img").forEach((img) => {
      let speed = 300;
      let amount = 30;
      let scroll = 0;
      let smooth = 0;
      let diff = 0;

      document.addEventListener("scroll", (event) => {
        scroll = window.scrollY;
      });

      let oldTime = null;
      let delta = 0;

      const animate = (t) => {
        if (oldTime) delta = t - oldTime;
        smooth += ((scroll - smooth) * delta) / speed;
        diff = scroll - smooth;
        let translateCenter = (diff * -2) / amount;

        img.style.transform = `translateY(${translateCenter}px)`;
        oldTime = t;
        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    });

    this.querySelectorAll(".animate--prl-scroll.ani--sec img").forEach(
      (img) => {
        let speed = 300;
        let amount = 30;
        let scroll = 0;
        let smooth = 0;
        let diff = 0;

        document.addEventListener("scroll", (event) => {
          scroll = window.scrollY;
        });

        let oldTime = null;
        let delta = 0;

        const animate = (t) => {
          if (oldTime) delta = t - oldTime;
          smooth += ((scroll - smooth) * delta) / speed;
          diff = scroll - smooth;
          let translateCenter = (-diff * -2) / amount;

          img.style.transform = `translateY(${translateCenter}px)`;
          oldTime = t;
          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
      }
    );
  }

  scaleBannerOnScroll() {
    const prl = document.querySelectorAll(".prlBg img");
    if (prl.length > 0) {
      prl.forEach((e) => {
        gsap.fromTo(
          e,
          { scale: 1.5 },
          {
            scrollTrigger: {
              start: "top bottom",
              end: "center+=10% center",
              trigger: e.parentElement,
              scrub: 1,
              invalidateOnRefresh: true,
            },
            scale: 1,
          }
        );
      });
    }
  }
}
customElements.define("animate-element", AnimateElement);

class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.carousel = this.querySelector(".swiper");

    if (this.carousel) this.initCarousel(this.carousel);

    if (document.querySelector(`.section-header ~ .section-announcement-bar`))
      this.closest(`.section-announcement-bar`).classList.remove("z-index-4");
  }

  setAutoPlay(swiper) {
    this.sliderAutoplayButton = this.classList.contains(
      "announcementbar-slider__autoplay"
    );

    if (this.sliderAutoplayButton) {
      this.carousel.addEventListener("mouseenter", (event) => {
        swiper.autoplay.stop();
      });

      this.carousel.addEventListener("mouseleave", (event) => {
        swiper.autoplay.start();
      });
    } else {
      swiper.autoplay.stop();
    }
  }

  initCarousel(carousel) {
    var setInfiniteScroll = this.classList.contains("infinite-scroll"),
      setAutoplaySpeed = this.dataset.speed * 1000;

    var swiperOptions = {
      slidesPerView: 1,
      loop: setInfiniteScroll,
      speed: 800,
      parallax: true,
      simulateTouch: false,
      autoplay: {
        delay: setAutoplaySpeed,
        disableOnInteraction: false,
      },
      pagination: {
        el: carousel.querySelector(".swiper-pagination"),
        clickable: false,
        type: "custom",
      },
      navigation: {
        nextEl: carousel.querySelector(".swiper-button-next"),
        prevEl: carousel.querySelector(".swiper-button-prev"),
      },
    };

    var swiper = new Swiper(carousel, swiperOptions);
    this.setAutoPlay(swiper);
  }
}
customElements.define("announcement-bar", AnnouncementBar);

class AZBrands extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.createObserver();
  }

  init() {
    this.wrapper = document.querySelector('[id^="AZWrapper-"]');
    this.navigation = document.querySelector('[id^="AZTable-"]');

    let list = this.getAttribute("data-brand");

    this.getAllBrands(list);
  }

  getAllBrands(list) {
    JSON.parse(list).forEach((vendor) => {
      let letter = vendor.letter,
        handle = vendor.handle,
        name = vendor.name,
        brand = `<a href="${handle}" class="d-block link link--text u-none">${name}</a>`,
        item = document.createElement("li"),
        brandGroup;

      item.classList.add("brand", "o-h", "center", "gradient");
      item.setAttribute("data-az-letter", letter);
      item.innerHTML = brand;

      if (this.isNumber(letter)) {
        brandGroup = this.wrapper.querySelector(
          `.az-group[data-letter="0-9"] ul`
        );
      } else {
        brandGroup = this.wrapper.querySelector(
          `.az-group[data-letter="${letter}"] ul`
        );
      }

      brandGroup.appendChild(item);
    });

    this.parseListBrand();
  }

  parseListBrand() {
    this.wrapper.querySelectorAll(".az-group").forEach((element) => {
      let letter = element.dataset.letter;

      if (element.querySelector(".az-group__list")?.childNodes.length > 0) {
        this.navigation
          .querySelector(`[data-letter="${letter}"]`)
          .classList.remove("disable");
        this.navigation
          .querySelector(`[data-letter="${letter}"]`)
          .classList.add("has-letter");

        if (this.wrapper.classList.contains("hide-no__brand")) {
          element.classList.add("d-block");
          element.classList.remove("d-none");
        }
      }
    });
  }

  isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0);
  }

  createObserver() {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(this);
            this.init();
          }
        });
      },
      { rootMargin: "0px 0px -200px 0px" }
    );

    observer.observe(this);
  }
}
customElements.define("az-brands", AZBrands);

class AZLayout extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.wrapper = document.querySelector('[id^="AZWrapper-"]');
    this.navigation = document.querySelector('[id^="AZTable-"]');

    if (!this.wrapper || !this.navigation) return;

    if (this.navigation.querySelector("button")) {
      this.navigation.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", this.onClickHandler.bind(this));
      });
    }
  }

  onClickHandler(event) {
    let letter = event.target.dataset.id;

    this.navigation.querySelectorAll("li").forEach((element) => {
      if (element == event.target.closest("li")) {
        event.target.closest("li").classList.add("active");
      } else {
        element.classList.remove("active");
      }
    });

    this.wrapper.querySelectorAll(".az-group").forEach((element) => {
      element.classList.remove("d-block");
      element.classList.add("d-none");
    });

    if (letter != undefined && letter != null) {
      this.wrapper.classList.remove("active-all");
      this.wrapper
        .querySelector(`[data-letter="${letter}"]`)
        .classList.remove("d-none");
      this.wrapper
        .querySelector(`[data-letter="${letter}"]`)
        .classList.add("d-block");
    } else {
      if (this.wrapper.classList.contains("hide-no__brand")) {
        this.wrapper.querySelectorAll(".az-group").forEach((element) => {
          if (element.querySelector(".az-group__list")?.childNodes.length > 0) {
            element.classList.add("d-block");
            element.classList.remove("d-none");
          }
        });
      } else {
        this.wrapper.classList.add("active-all");
      }
    }
  }
}
customElements.define("az-layout", AZLayout);

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

class CountDown extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.d = new Date(this.dataset.countdown).getTime();
    this.t = this.dataset.type;

    this.createObserver();
  }

  init(time, type) {
    var countdown = setInterval(() => {
      let now = new Date().getTime();
      let distance = time - now;

      if (distance < 0) {
        clearInterval(countdown);
        this.remove();
      } else {
        let day = Math.floor(distance / (1000 * 60 * 60 * 24)),
          hour = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          second = Math.floor((distance % (1000 * 60)) / 1000),
          content;

        if (type == "banner") {
          content = `<span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${day}</span><span class="d-block text uppercase">${window.countdown.day}</span></span>\
              <span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${hour}</span><span class="d-block text uppercase">${window.countdown.hour}</span></span>\
              <span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${minute}</span><span class="d-block text uppercase">${window.countdown.min}</span></span>\
              <span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${second}</span><span class="d-block text uppercase">${window.countdown.sec}</span></span>`;

          this.querySelector(".countdown").innerHTML = content;
          this.parentElement.classList.remove("hidden");
        } else if (type == "dots") {
          content = `<span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${day}</span><span class="d-block text uppercase f-normal">${window.countdown.day}s</span></span><span class="devide">:</span>\
            <span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${hour}</span><span class="d-block text uppercase f-normal">${window.countdown.hour}s</span></span><span class="devide">:</span>\
            <span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${minute}</span><span class="d-block text uppercase f-normal">${window.countdown.min}utes</span></span><span class="devide">:</span>\
            <span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${second}</span><span class="d-block text uppercase f-normal">${window.countdown.sec}conds</span></span>`;
          this.querySelector(".countdown").innerHTML = content;
          this.parentElement.classList.remove("hidden");
        } else {
          content = `<span class="num">${day}</span><span class="text">${window.countdown.day},</span>\
              <span class="num">${hour}</span><span class="text"> : </span>\
              <span class="num">${minute}</span><span class="text"> : </span>\
              <span class="num">${second}`;

          this.querySelector(".countdown").innerHTML = content;
          this.parentElement.classList.remove("hidden");
        }
      }
    }, 1000);
  }

  createObserver() {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          this.init(this.d, this.t);
          observer.unobserve(this);
        });
      },
      { rootMargin: "0px 0px -200px 0px" }
    );

    observer.observe(this);
  }
}
customElements.define("count-down", CountDown);

class CountDownSpecial extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!window.matchMedia("(max-width: 1024px)").matches)
      requestAnimationFrame(this.bannerOnScroll.bind(this));
    if (
      this.querySelector(".block-logo")?.closest(
        `.shopify-section-group-header-group`
      ) &&
      !window.matchMedia("(max-width: 749px)").matches
    )
      requestAnimationFrame(this.logoOnScroll.bind(this));

    if (!this.closest(`.shopify-section-group-header-group`))
      this.classList.add("section--body");

    if (
      document.body.classList.contains("page-index") &&
      this.closest(`.shopify-section-group-header-group`) &&
      !window.matchMedia("(max-width: 749px)").matches
    ) {
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("opacity", "0");
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("transition", `opacity 0.3s ease`);
      this.onScrollHandler = this.onScroll.bind(this);
      window.addEventListener("scroll", this.onScrollHandler, false);
    }
  }

  disconnectedCallback() {
    if (
      document.body.classList.contains("page-index") &&
      this.closest(`.shopify-section-group-header-group`) &&
      !window.matchMedia("(max-width: 749px)").matches
    )
      window.removeEventListener("scroll", this.onScrollHandler);
  }

  onScroll() {
    if (this && this.check(this, this.offsetHeight)) {
      // Run
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("opacity", "0");
      if (
        this.querySelector(".block-logo")?.closest(
          `.shopify-section-group-header-group`
        )
      )
        this.querySelector(".block-logo").style.setProperty("opacity", "1");
    } else {
      document
        .querySelector(".header__heading-logo")
        .style.setProperty("opacity", "1");
      if (
        this.querySelector(".block-logo")?.closest(
          `.shopify-section-group-header-group`
        )
      )
        this.querySelector(".block-logo").style.setProperty("opacity", "0");
    }
  }

  check(element, threshold) {
    let rect = element.getBoundingClientRect().y;
    threshold = threshold ? threshold : 0;
    return rect + threshold > 0;
  }

  bannerOnScroll() {
    const logoScroll = gsap.utils.toArray(".p-w__media");
    logoScroll.forEach((item) => {
      let event = item,
        ctn = event.closest(".section__countdown-s-hero"),
        hItem = event.offsetHeight,
        hCtn = ctn.offsetHeight - event.offsetHeight / 3,
        n = hItem - hCtn;

      event.style.transition = "0s";
      gsap.fromTo(
        event,
        {
          y: -n * 1.2,
          scale: item.closest(
            `.shopify-section-group-header-group.countdown-s-hero`
          )
            ? 1 - 0.1
            : 1,
        },
        {
          scrollTrigger: {
            scrub: !0,
            trigger: ctn,
            invalidateOnRefresh: !0,
          },
          y: n * 1.2,
          scale: item.closest(
            `.shopify-section-group-header-group.countdown-s-hero`
          )
            ? 1.1
            : 1,
          ease: "none",
        }
      );
    });
  }

  logoOnScroll() {
    let event = this.closest(
      ".shopify-section-group-header-group"
    ).querySelector(".block-logo"),
      ctn = event.closest(".section__countdown-s-hero"),
      hItem = event.offsetHeight,
      hCtn = ctn.offsetHeight,
      n = hItem - hCtn;

    event.style.transition = "0s";
    gsap.fromTo(
      event,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      }
    );

    /* block-logo animation */
    let logoTl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 0,
        end: () => window.innerHeight * 0.8,
        scrub: 0.6,
      },
    });
    logoTl.fromTo(
      event,
      {
        scale: 1,
        y: hCtn - hItem - 126,
        yPercent: 0,
      },
      {
        scale: 0.1,
        duration: 0.8,
        y: n * -0.2 + 30,
        yPercent: 0,
      }
    );

    // blocks-content animation
    if (this.querySelector(".banner__logo")) {
      let event = this.closest(
        ".shopify-section-group-header-group"
      ).querySelector(".blocks-content"),
        spacingLogo = hCtn - (hItem + 126),
        hcontent = hCtn + (spacingLogo + hItem + 32) * -1,
        contentTl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 0,
            end: () => window.innerHeight * 1.2,
            scrub: 0.6,
          },
        });
      contentTl.fromTo(
        event,
        {
          top: hCtn / 2 + (hcontent + hItem - 26) * -1,
          y: 0,
        },
        {
          top: hItem - 126 - 32,
          y: n * 0.5,
        }
      );
    }
  }
}
customElements.define("countdown-special", CountDownSpecial);

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

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener("click", this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      const deferredElement = this.appendChild(
        content.querySelector("video, model-viewer, iframe")
      );
      if (focus) deferredElement.focus();
    }
  }
}
customElements.define("deferred-media", DeferredMedia);

class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector("details");
    this.content =
      this.mainDetailsToggle.querySelector("summary").nextElementSibling;

    this.mainDetailsToggle.addEventListener(
      "focusout",
      this.onFocusOut.bind(this)
    );
    this.mainDetailsToggle.addEventListener("toggle", this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute("open")) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute("open");
    this.mainDetailsToggle
      .querySelector("summary")
      .setAttribute("aria-expanded", false);
  }
}
customElements.define("details-disclosure", DetailsDisclosure);
