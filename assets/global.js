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

class HeaderMenu extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");

    document.addEventListener("page:loaded", () => {
      this.mediaHover = this.querySelectorAll(".banner__media-hover");
      if (!window.matchMedia("(max-width: 749px)").matches) {
        this.mediaHover?.forEach((e) => {
          if (e.querySelector(".data__media-hover")) {
            this.maskHover = e.querySelectorAll(".data__media-hover");
            this.maskHover?.forEach((mask) => {
              mask?.addEventListener("mouseenter", (event) => {
                e.classList.add("mask-hover");
              });

              mask?.addEventListener("mouseleave", (event) => {
                e.classList.remove("mask-hover");
              });
            });
          } else {
            e.classList.remove("banner__media-hover");
          }
        });
      }
    });
  }

  onToggle() {
    if (!this.header) return;
    if (this.header.classList.contains("transparent"))
      this.header.classList.toggle("transparent-hidden");

    if (
      document.documentElement.style.getPropertyValue(
        "--header-bottom-position-desktop"
      ) !== ""
    )
      return;
    document.documentElement.style.setProperty(
      "--header-bottom-position-desktop",
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }
}
customElements.define("header-menu", HeaderMenu);

class HeaderSubMenu extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");
  }
}
customElements.define("header-submenu", HeaderSubMenu);

class FooterCollapse extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.details = this.querySelector("details");
    this.summary = this.querySelector("summary");

    this.details.addEventListener(
      "keyup",
      (event) => event.code.toUpperCase() === "ESCAPE" && this.close()
    );
    this.summary.addEventListener("click", this.toggle.bind(this));
    document.addEventListener("matchMobile", this.close.bind(this));
    document.addEventListener("unmatchMobile", this.open.bind(this));

    if (!window.matchMedia("(max-width: 749px)").matches) {
      this.details.setAttribute("open", true);
    } else {
      if (this.dataset.open == undefined) this.details.removeAttribute("open");
    }
  }

  toggle(event) {
    event.preventDefault();
    event.target.closest("details").hasAttribute("open")
      ? this.close()
      : this.open();
  }

  open() {
    this.details.setAttribute("open", true);
  }

  close() {
    window.matchMedia("(max-width: 749px)").matches &&
      this.details.removeAttribute("open");
  }
}
customElements.define("footer-collapse", FooterCollapse);

class LocalizationForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.elements = {
      input: this.querySelector(
        'input[name="locale_code"], input[name="country_code"]'
      ),
      button: this.querySelector("button"),
      panel: this.querySelector(".disclosure__list-wrapper"),
    };
    this.elements.button.addEventListener(
      "click",
      this.openSelector.bind(this)
    );
    this.elements.button.addEventListener(
      "focusout",
      this.closeSelector.bind(this)
    );
    this.addEventListener("keyup", this.onContainerKeyUp.bind(this));

    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", this.onItemClick.bind(this))
    );
  }

  hidePanel() {
    this.elements.button.setAttribute("aria-expanded", "false");
    this.elements.panel.setAttribute("hidden", true);
  }

  onContainerKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    this.hidePanel();
    this.elements.button.focus();
  }

  onItemClick(event) {
    event.preventDefault();
    const form = this.querySelector("form");
    this.elements.input.value = event.currentTarget.dataset.value;
    if (form) form.submit();
  }

  openSelector() {
    this.elements.button.focus();
    this.elements.panel.toggleAttribute("hidden");
    this.elements.button.setAttribute(
      "aria-expanded",
      (
        this.elements.button.getAttribute("aria-expanded") === "false"
      ).toString()
    );
  }

  closeSelector(event) {
    const shouldClose =
      event.relatedTarget && event.relatedTarget.nodeName === "BUTTON";
    if (event.relatedTarget === null || shouldClose) {
      this.hidePanel();
    }
  }
}
customElements.define("localization-form", LocalizationForm);

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector("details");

    this.addEventListener("keyup", this.onKeyUp.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll("summary").forEach((summary) =>
      summary.addEventListener("click", this.onSummaryClick.bind(this))
    );
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onCloseButtonClick.bind(this))
    );
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    const openDetailsElement = event.target.closest("details[open]");
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(
          event,
          this.mainDetailsToggle.querySelector("summary")
        )
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest(".has-submenu");
    const isOpen = detailsElement.hasAttribute("open");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(
        summaryElement.nextElementSibling,
        detailsElement.querySelector("button")
      );
      summaryElement.nextElementSibling.removeEventListener(
        "transitionend",
        addTrapFocus
      );
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen
        ? this.closeMenuDrawer(event, summaryElement)
        : this.openMenuDrawer(summaryElement);

      if (window.matchMedia("(max-width: 990px)")) {
        document.documentElement.style.setProperty(
          "--viewport-height",
          `${window.innerHeight}px`
        );
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add("menu-opening");
        document.body.classList.add(`filter-show`);
        summaryElement.setAttribute("aria-expanded", true);
        parentMenuElement && parentMenuElement.classList.add("submenu-open");
        !reducedMotion || reducedMotion.matches
          ? addTrapFocus()
          : summaryElement.nextElementSibling.addEventListener(
              "transitionend",
              addTrapFocus
            );
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
      document.body.classList.add(`filter-show`);
      if (document.body.matches(".scroll-up"))
        document
          .querySelector(".section-header")
          .classList.add("sticky-hidden");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`o-h-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove("menu-opening");
    if (document.body.classList.contains("menu-mobile-show")) {
      document.body.classList.remove(`filter-show`);
    } else {
      setTimeout(() => {
        document.body.classList.remove(`filter-show`);
      }, 400);
    }

    this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
      details.removeAttribute("open");
      details.classList.remove("menu-opening");
      if (document.body.classList.contains("menu-mobile-show")) {
        document.body.classList.remove(`filter-show`);
      } else {
        setTimeout(() => {
          document.body.classList.remove(`filter-show`);
        }, 400);
      }
    });
    this.mainDetailsToggle
      .querySelectorAll(".submenu-open")
      .forEach((submenu) => {
        submenu.classList.remove("submenu-open");
      });
    document.body.classList.remove(`o-h-${this.dataset.breakpoint}`);
    document.body.classList.remove(`menu-mobile-show`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (
        this.mainDetailsToggle.hasAttribute("open") &&
        !this.mainDetailsToggle.contains(document.activeElement)
      )
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest("details");
    if (event.currentTarget.classList.contains("disclosure__button")) {
      return;
    } else {
      this.closeSubmenu(detailsElement);
    }
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest(".submenu-open");
    parentMenuElement && parentMenuElement.classList.remove("submenu-open");
    detailsElement.classList.remove("menu-opening");
    detailsElement
      .querySelector("summary")
      .setAttribute("aria-expanded", false);
    removeTrapFocus(detailsElement.querySelector("summary"));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute("open");
        if (detailsElement.closest("details[open]")) {
          trapFocus(
            detailsElement.closest("details[open]"),
            detailsElement.querySelector("summary")
          );
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}
customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector(".section-header");
    this.headerWrapper = this.closest(".header-wrapper");
    this.borderOffset =
      this.borderOffset || this.headerWrapper.classList.contains("b-bottom")
        ? 1
        : 0;

    let headerBottomPosition;

    if (this.headerWrapper.classList.contains("transparent")) {
      headerBottomPosition = parseInt(
        this.headerWrapper.getBoundingClientRect().bottom - this.borderOffset
      );
    } else {
      headerBottomPosition = parseInt(
        this.header.getBoundingClientRect().bottom - this.borderOffset
      );
    }

    document.documentElement.style.setProperty(
      "--header-bottom-position",
      `${headerBottomPosition}px`
    );

    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });

    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`o-h-${this.dataset.breakpoint}`);
    document.body.classList.add(`menu-mobile-show`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
  }
}
customElements.define("header-drawer", HeaderDrawer);

class HoverShow extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.button = this.querySelectorAll("[data-target]");
    this.data = this.querySelectorAll(".data-show");

    this.button.forEach((button) =>
      button.addEventListener("mouseenter", this.openEvent.bind(this))
    );
  }

  openEvent(event) {
    var checkButton = event.target.getAttribute("data-target");

    this.data.forEach((data) =>
      checkButton === data.id
        ? data.classList.add("active")
        : data.classList.remove("active")
    );
  }
}
customElements.define("hover-show", HoverShow);

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

class ImageReveal extends HTMLElement {
  constructor() {
    super();
    this.imageCtn = this.querySelector(".coll-cate__images");
    this.images = [...this.querySelectorAll(".coll-cate__images img")];
    this.links = [...this.querySelectorAll(".coll-cate__menu .item")];

    this.ctn = this;
    this.callEvent(this.links);
  }

  connectedCallback() {
    this.init();
  }

  init() {
    this.mouse = {
      x: -100,
      y: -100,
    };

    this.target = this;

    this.target.addEventListener("pointermove", this.updatePosition.bind(this));
  }

  callEvent(links) {
    links.forEach((link) => {
      let { label } = link.dataset;

      link.addEventListener("mouseenter", () => {
        link.classList.add("active");
        gsap.to(`img[data-image=${label}]`, { opacity: 1, scale: 1 });
        gsap.set(`img[data-image=${label}]`, { zIndex: 1 });
      });
      link.addEventListener("mouseleave", () => {
        gsap.to(`img[data-image=${label}]`, {
          opacity: 0,
          zIndex: -1,
          scale: 0.5,
        });
        link.classList.remove("active");
      });
    });
  }

  updatePosition(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    gsap.to(this.imageCtn.querySelectorAll("img"), {
      x: this.mouse.x,
      y: this.mouse.y,
      ease: Power4.easeOut,
      xPercent: -50,
      yPercent: -50,
      stagger: 0.05,
    });
  }
}
customElements.define("image-reveal", ImageReveal);

class HoverChangeImage extends HTMLElement {
  constructor() {
    super();
    this.links = [...this.querySelectorAll(".names .name")];
    this.images = [...this.querySelectorAll(".images .image")];

    this.callEvent(this.images, this.links);
    this.callClick(this.images, this.links);
  }

  callEvent(images, links) {
    let current = 0;
    const onMouseEnter = (ev) => {
      const position = links.indexOf(ev.target);
      if (position === current) {
        return false;
      }
      const currentImage = images[current];
      const nextImage = images[position];
      current = position;
      gsap.killTweensOf([currentImage, nextImage]);
      this.hide(currentImage);
      this.show(nextImage);
      links.forEach((link) => {
        link.classList.remove("active");
        link.classList.add("inactive");
      });
      ev.target.classList.add("active");
      ev.target.classList.remove("inactive");
    };

    const onMouseLeave = (ev) => {
      links.forEach((link) => {
        link.classList.remove("inactive");
      });
    };

    links.forEach((link) => {
      if (window.innerWidth >= 1025) {
        link.addEventListener("mouseenter", onMouseEnter);
        link.addEventListener("mouseleave", onMouseLeave);
      }
    });
  }

  callClick(images, links) {
    let current = 0;

    links.forEach((link, index) => {
      if (window.innerWidth <= 1024) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const position = index;
          const href = link.querySelector(".link").getAttribute("href");
          if (position === current) {
            window.location.href = href;
            return false;
          }
          const currentImage = images[current];
          const nextImage = images[position];
          current = position;
          this.hide(currentImage);
          this.show(nextImage);
          setTimeout(() => {
            window.location.href = href;
          }, 400);
        });
      }
    });
  }

  show(image) {
    gsap
      .timeline()
      .set(image, {
        opacity: 1,
        zIndex: 1,
      })
      .to(image.querySelector(".image__full"), 1.4, {
        ease: "Power4.easeOut",
        startAt: {
          scale: 1.1,
          rotation: 4,
        },
        scale: 1,
        rotation: 0,
      });
  }

  hide(image) {
    gsap
      .timeline()
      .set(image, {
        zIndex: 2,
      })
      .to(image, 0.8, {
        ease: "Power4.easeOut",
        opacity: 0,
        onComplete: () =>
          gsap.set(image, {
            zIndex: 1,
          }),
      });
  }
}
customElements.define("hover-collection", HoverChangeImage);

class LookbookPoint extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.button = this.querySelector("button");
    this.button.addEventListener("mouseover", this.onMouseover.bind(this));
    this.onMouseLeave();
    this.button.addEventListener("click", this.onClickButtons.bind(this));
    this.createObserver();

    document.body.addEventListener("click", this.onBodyClick.bind(this));
    document.addEventListener("matchExtraLarge", this.close.bind(this));
    document.addEventListener("unmatchExtraLarge", this.load.bind(this));
  }

  load() {
    if (
      !this.getAttribute("loaded") &&
      window.matchMedia("(min-width: 1200px)").matches &&
      this.querySelector("template")
    ) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      this.querySelector(".lookbook__point-popup").appendChild(
        content.firstElementChild
      );
    }
  }

  onClickButtons(event) {
    if (this.querySelector(`.point-button:not(.point-style--classic)`)) {
      if (window.matchMedia("(max-width: 1024px)").matches) {
        const drawer = document.querySelector(
          this.getAttribute("data-side-drawer")
        );
        if (drawer) drawer.open(this.button);
      }
    } else if (this.querySelector(`.point-button.point-style--classic`)) {
      if (window.matchMedia("(max-width: 749px)").matches) {
        const drawer = document.querySelector(
          this.getAttribute("data-side-drawer")
        );
        if (drawer) drawer.open(this.button);
      }
    } else {
      if (window.matchMedia("(max-width: 1199px)").matches) {
        const drawer = document.querySelector(
          this.getAttribute("data-side-drawer")
        );
        if (drawer) drawer.open(this.button);
      }
    }
  }

  onMouseover() {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      const items = document.querySelectorAll("lookbook-point");

      items.forEach((item) => item.classList.remove("active"));
      this.open();
    }
  }

  onMouseLeave() {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      const items = document.querySelectorAll(".lookbook__point-popup");

      items.forEach((item) => {
        item.addEventListener("mouseleave", () => {
          if (this.classList.contains("active")) {
            this.classList.remove("active");
          }
        });
      });
    }
  }

  open() {
    this.classList.add("active");
  }

  close() {
    this.classList.contains("active") && this.classList.remove("active");
  }

  onBodyClick(event) {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      !this.contains(event.target) && this.close();
      document.body && this.close();
    }
  }

  createObserver() {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(this);
            this.load();
          }
        });
      },
      { rootMargin: "0px 0px -200px 0px" }
    );

    observer.observe(this);
  }
}
customElements.define("lookbook-point", LookbookPoint);

class MapTemplate extends HTMLElement {
  constructor() {
    super();

    this.map = this.querySelector("iframe");
  }

  init() {
    this.map.addEventListener(
      "load",
      function () {
        this.dispatchEvent(
          new CustomEvent("loadingEnd", {
            detail: {
              element: this.map,
              parent: this,
            },
          })
        );

        this.setAttribute("loaded", true);
      }.bind(this)
    );
  }

  execute() {
    this.setIframeSrc();
  }

  setIframeSrc() {
    let map_src = `https://maps.google.com/maps?z=${this.dataZoom}&t=${
      this.dataType
    }&q=${this.dataLocation.replace(/"/g, "")}&ie=UTF8&&output=embed`;

    this.map.src = map_src;
    this.map.removeAttribute("srcdoc");
  }

  loadIframeSrc() {
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.dispatchEvent(
              new CustomEvent("loadingStart", {
                detail: {
                  element: this.map,
                  parent: this,
                },
              })
            );

            this.execute();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -100px 0px",
      }
    ).observe(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    oldValue !== newValue &&
      (Shopify.designMode ? this.execute() : this.loadIframeSrc());
  }

  connectedCallback() {
    this.init();
  }

  static get observedAttributes() {
    return ["data-zoom", "data-type", "data-location"];
  }

  get dataZoom() {
    return this.getAttribute("data-zoom");
  }

  get dataType() {
    return this.getAttribute("data-type");
  }

  get dataLocation() {
    return this.getAttribute("data-location");
  }

  set dataZoom(zoom) {
    this.setAttribute("data-zoom", zoom);
  }

  set dataType(type) {
    this.setAttribute("data-type", type);
  }

  set dataLocation(location) {
    this.setAttribute("data-location", location);
  }
}

customElements.define("map-template", MapTemplate);

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

class PageDrawer extends HTMLElement {
  constructor() {
    super();

    this.component = this;
    this.inner = this.querySelector('[id^="Drawer-Inner-"]');
    this.overlay = this.querySelector('[id^="Drawer-Overlay-"]');
    this.breakpoints = this.dataset.breakpoint.split(",");

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector('[id^="Drawer-Overlay-"]')?.addEventListener(
      "click",
      this.close.bind(this)
    );

    this.init();
  }

  init() {
    let bpoint;
    let _component = this.dataset.classComponent.split(" ");
    let _inner = this.dataset.classInner.split(" ");
    let _overlay = this.dataset.classOverlay.split(" ");
    let popup = this.dataset.sidebarType;

    this.breakpoints.forEach((breakpoint) => {
      switch (breakpoint) {
        case "xs":
          bpoint = "(max-width: 550px)";
          break;
        case "sm":
          bpoint = "(max-width: 749px)";
          break;
        case "md":
          bpoint = "(max-width: 989px)";
          break;
        case "lg":
          bpoint = "(max-width: 1199px)";
          break;
      }
    });

    if (popup == "true") {
      this.toggleClass(this.component, _component, true);
      this.toggleClass(this.inner, _inner, true);
      this.toggleClass(this.overlay, _overlay, true);
    } else if (window.matchMedia(bpoint).matches) {
      this.toggleClass(this.component, _component, true);
      this.toggleClass(this.inner, _inner, true);
      this.toggleClass(this.overlay, _overlay, true);
    } else {
      this.toggleClass(this.component, _component, false);
      this.toggleClass(this.inner, _inner, false);
      this.toggleClass(this.overlay, _overlay, false);
    }

    new ResizeObserver((entries) => {
      if (popup == "true") {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.inner, _inner, true);
        this.toggleClass(this.overlay, _overlay, true);
      } else if (window.matchMedia(bpoint).matches) {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.inner, _inner, true);
        this.toggleClass(this.overlay, _overlay, true);
      } else {
        this.toggleClass(this.component, _component, false);
        this.toggleClass(this.inner, _inner, false);
        this.toggleClass(this.overlay, _overlay, false);
      }
    }).observe(document.body);
  }

  toggleClass(element, c, check) {
    switch (check) {
      case true:
        element.classList.add(...c);
        break;
      case false:
        element.classList.remove(...c);
        break;
    }
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
    });
    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this;
        const focusElement =
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close");
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );
    document.body.classList.add("o-h");
  }

  close() {
    this.classList.remove("active");
    removeTrapFocus(this.activeElement);
    document.body.classList.remove("o-h");
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("page-drawer", PageDrawer);

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector("product-recommendations");

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          if (
            !this.querySelector("slider-component") &&
            this.classList.contains("complementary-products")
          ) {
            this.remove();
          }

          if (html.querySelector(".grid__item")) {
            this.classList.add("product-recommendations--loaded");
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}
customElements.define("product-recommendations", ProductRecommendations);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.input.addEventListener("change", this.onInputChange.bind(this));
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    if (event.target.name === "plus") {
      this.input.stepUp();
    } else {
      this.input.value == 1 ? (this.input.value = 0) : this.input.stepDown();
    }
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle("disabled", value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle("disabled", value >= max);
    }
  }
}
customElements.define("quantity-input", QuantityInput);

class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('button[type="reset"]');

    if (this.input) {
      this.input.form.addEventListener("reset", this.onFormReset.bind(this));
      this.input.addEventListener(
        "input",
        debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );
    }
  }

  toggleResetButton() {
    const resetIsHidden = this.resetButton.classList.contains("hidden");
    if (this.input.value.length > 0 && resetIsHidden) {
      this.resetButton.classList.remove("hidden");
    } else if (this.input.value.length === 0 && !resetIsHidden) {
      this.resetButton.classList.add("hidden");
    }
  }

  onChange() {
    this.toggleResetButton();
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm()) {
      this.input.value = "";
      this.input.focus();
      this.toggleResetButton();
    }
  }
}
customElements.define("search-form", SearchForm);

class ShowMoreButton extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector("button");
    button.addEventListener("click", (event) => {
      this.expandShowMore(event);
      const nextElementToFocus = event.target
        .closest(".parent-display")
        .querySelector(".show-more-item");
      if (
        nextElementToFocus &&
        !nextElementToFocus.classList.contains("hidden")
      ) {
        nextElementToFocus.querySelector("input").focus();
      }
    });
  }
  expandShowMore(event) {
    const parentDisplay = event.target
      .closest('[id^="Show-More-"]')
      .closest(".parent-display");
    const parentWrap = parentDisplay.querySelector(".parent-wrap");
    this.querySelectorAll(".label-text").forEach((element) =>
      element.classList.toggle("hidden")
    );
    parentDisplay
      .querySelectorAll(".show-more-item")
      .forEach((item) => item.classList.toggle("hidden"));
    this.classList.toggle("hidden");
  }
}
customElements.define("show-more-button", ShowMoreButton);

class SideDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelector('[id^="Drawer-Overlay-"]')?.addEventListener(
      "click",
      this.close.bind(this)
    );
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    if (!this.dataset.moved) document.body.appendChild(this);
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add("animate", "active");
    });

    if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
      this.addEventListener(
        "transitionstart",
        () => {
          document.body.classList.add("drawer--opening");
          document.body.classList.remove("drawer--open", "drawer--closing");
        },
        { once: true }
      );

      this.addEventListener(
        "transitionend",
        () => {
          document.body.classList.remove("drawer--opening", "drawer--closing");
          document.body.classList.add("drawer--open");
        },
        { once: true }
      );
    }

    this.addEventListener(
      "transitionend",
      () => {
        const containerToTrapFocusOn = this;
        const focusElement =
          this.querySelector(".search__input") ||
          this.querySelector(".drawer__inner") ||
          this.querySelector(".drawer__close") ||
          this.querySelector(".popup__input");
        trapFocus(containerToTrapFocusOn, focusElement);
        if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
          document.body.classList.remove("drawer--opening", "drawer--closing");
          document.body.classList.add("drawer--open");
        }
      },
      { once: true }
    );
    document.body.classList.add("o-h");
  }

  close() {
    this.classList.remove("active");
    if (this.activeElement && !this.activeElement.closest("sticky-add-to-cart"))
      removeTrapFocus(this.activeElement);
    document.body.classList.remove("o-h");

    if (this.querySelector(`.side-drawer:not(.no-animation--popup)`)) {
      this.addEventListener(
        "transitionstart",
        () => {
          document.body.classList.add("drawer--closing");
          document.body.classList.remove("drawer--opening", "drawer--open");
        },
        { once: true }
      );

      this.addEventListener(
        "transitionend",
        () => {
          document.body.classList.remove(
            "drawer--closing",
            "drawer--opening",
            "drawer--open"
          );
        },
        { once: true }
      );
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("side-drawer", SideDrawer);

class LookbookDrawer extends SideDrawer {
  constructor() {
    super();
  }

  load() {
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      this.querySelector(".side-drawer").appendChild(content.firstElementChild);
    }
  }

  open(triggeredBy) {
    this.load();
    super.open(triggeredBy);
  }
}
customElements.define("lookbook-drawer", LookbookDrawer);

class SideDrawerOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    let checkLoad = true;
    button.addEventListener("click", () => {
      const drawer = document.querySelector(
        this.getAttribute("data-side-drawer")
      );
      const drawerDesktop = document.querySelector(
        this.getAttribute("data-side-drawer-desktop")
      );
      if (checkLoad && drawer.querySelector(".url__data")) {
        checkLoad = false;
        const $thisData = drawer;
        const urlStyle =
          $thisData.querySelector(".url__data").dataset.urlStyleSheet;

        buildStyleSheet(urlStyle, $thisData);
      }
      if (drawer) drawer.open(button);
      if (drawerDesktop) drawerDesktop.open(button);
    });
  }
}
customElements.define("side-drawer-opener", SideDrawerOpener);

class ProtectionDrawerOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const drawer = document.querySelector(
        this.getAttribute("data-side-drawer")
      );
      drawer.classList.add("animate", "active");
    });
  }
  show() {
    this.section.classList.remove("d-none");
    document.body.classList.add("before-you-leave__show", "o-h");
    setTimeout(() => {
      this.drawer.classList.add("active");
    }, 100);
  }
}
customElements.define("protection-drawer-opener", ProtectionDrawerOpener);

class LookbookDrawerOpener extends SideDrawerOpener {
  constructor() {
    super();
  }
}
customElements.define("lookbook-drawer-opener", LookbookDrawerOpener);

class PageDrawerOpener extends SideDrawerOpener {
  constructor() {
    super();
  }
}
customElements.define("page-drawer-opener", PageDrawerOpener);

class PreloadScreen extends HTMLElement {
  constructor() {
    super();

    document.addEventListener("page:loaded", () => {
      setTimeout(() => {
        this.setAttribute("loaded", true);
      }, 300);
    });

    document.addEventListener(
      "pointermove",
      () => {
        document.body.classList.add("function__show");
      },
      { once: true }
    );
  }
}
customElements.define("preload-screen", PreloadScreen);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.typePagination;
    this.value;
    this.carousel = this.querySelector(".swiper");

    if (this.carousel) this.initCarousel(this.carousel);

    document.addEventListener("page:loaded", () => {
      this.mediaHover = this.querySelectorAll(".banner__media-hover");
      if (!window.matchMedia("(max-width: 749px)").matches) {
        this.mediaHover?.forEach((e) => {
          if (e.querySelector(".data__media-hover")) {
            this.maskHover = e.querySelectorAll(".data__media-hover");
            this.maskHover?.forEach((mask) => {
              mask?.addEventListener("mouseenter", (event) => {
                e.classList.add("mask-hover");
              });

              mask?.addEventListener("mouseleave", (event) => {
                e.classList.remove("mask-hover");
              });
            });
          } else {
            e.classList.remove("banner__media-hover");
          }
        });
      }
    });
  }

  setClickable() {
    this.type == "dots" || this.type == "dashed"
      ? (this.value = true)
      : (this.value = false);
    return this.value;
  }

  setTypePanigation() {
    if (this.type == "fraction" || this.type == "progressbar") {
      this.value = this.type;
    } else if (this.type == "dots" || this.type == "dashed") {
      this.value = "bullets";
      if (this.type == "dashed")
        this.querySelector(".swiper-pagination").classList.add(
          "swiper-pagination-dashed"
        );
    } else if (this.type == "progressbar_vertical") {
      this.value = "progressbar";
    } else {
      this.value = "custom";
    }
    return this.value;
  }

  setAutoPlay(swiper) {
    if (this.dataset.sliderAutoplay) {
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
    var setClickable = this.setClickable(),
      setTypePanigation = this.setTypePanigation(),
      setInfiniteScroll = this.classList.contains("infinite-scroll"),
      setspaceBetween = this.dataset.spaceBetween;

    if (this.classList.contains("vertical")) {
      var swiperOptions = {
        direction: this.dataset.directionMobile
          ? this.dataset.directionMobile
          : "horizontal",
        slidesPerView: this.dataset.itemToShowMobile,
        spaceBetween: setspaceBetween,
        loop: this.dataset.loop ? this.dataset.loop : false,
        mousewheel: this.dataset.mousewheel ? this.dataset.mousewheel : true,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".swiper-pagination",
          type: setTypePanigation,
          clickable: setClickable,
        },
        breakpoints: {
          750: {
            direction: this.dataset.directionMobile
              ? this.dataset.directionMobile
              : "horizontal",
            slidesPerView: this.dataset.itemToShowTablet,
            spaceBetween: this.dataset.spaceBetweenTablet
              ? this.dataset.spaceBetweenTablet
              : setspaceBetween,
          },
          1200: {
            direction: this.dataset.directionDesktop,
            slidesPerView: this.dataset.itemToShowDesktop,
            spaceBetween: this.dataset.spaceBetweenDesktop
              ? this.dataset.spaceBetweenDesktop
              : setspaceBetween,
          },
        },
      };

      const swiper = new Swiper(carousel, swiperOptions);
      this.setAutoPlay(swiper);
    } else if (this.classList.contains("cover-flow")) {
      var swiperOptions = {
        effect: "coverflow",
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        loopAdditionalSlides: 1,
        speed: this.dataset.swiperSpeed ? this.dataset.swiperSpeed : 1200,
        centeredSlides: true,
        grabCursor: true,
        coverflowEffect: {
          rotate: 0,
          slideShadows: false,
          depth: 0,
          scale: 0.8,
          stretch: 0,
        },
        pagination: {
          el: carousel.querySelector(".swiper-pagination"),
          clickable: setClickable,
          type: setTypePanigation,
        },
        navigation: {
          nextEl: this.querySelector(".swiper-button-next"),
          prevEl: this.querySelector(".swiper-button-prev"),
        },
        breakpoints: {
          500: {
            coverflowEffect: {
              stretch: 20,
            },
          },
          768: {
            coverflowEffect: {
              stretch: 20,
              scale: 0.69,
            },
          },
          992: {
            slidesPerView: 1,
            coverflowEffect: {
              stretch: 0,
            },
          },
        },
      };
      const swiper = new Swiper(carousel, swiperOptions);
    } else {
      if (!this.classList.contains("swiper-more-item")) {
        var swiperOptions = {
          slidesPerView: this.dataset.itemToShowMobileXs
            ? this.dataset.itemToShowMobileXs
            : 1,
          spaceBetween: setspaceBetween,
          loop: setInfiniteScroll,
          speed: this.dataset.swiperSpeed ? this.dataset.swiperSpeed : 600,
          parallax: this.dataset.sliderParallax ? true : false,
          centeredSlides: this.dataset.centeredSlides ? true : false,
          pagination: {
            el: carousel.querySelector(".swiper-pagination"),
            clickable: setClickable,
            type: setTypePanigation,
          },
          navigation: {
            nextEl: carousel.querySelector(".swiper-button-next"),
            prevEl: carousel.querySelector(".swiper-button-prev"),
          },
          breakpoints: {
            551: {
              slidesPerView: this.dataset.itemToShowMobile,
              spaceBetween: setspaceBetween,
            },
            750: {
              slidesPerView: this.dataset.itemToShowTablet,
              spaceBetween: this.dataset.spaceBetweenTablet
                ? this.dataset.spaceBetweenTablet
                : setspaceBetween,
            },
            990: {
              slidesPerView: this.dataset.itemToShowDesktop,
              spaceBetween: this.dataset.spaceBetweenDesktop
                ? this.dataset.spaceBetweenDesktop
                : setspaceBetween,
            },
          },
        };
      } else {
        var swiperOptions = {
          slidesPerView: this.dataset.itemXs,
          spaceBetween: setspaceBetween,
          loop: setInfiniteScroll,
          speed: this.dataset.swiperSpeed ? this.dataset.swiperSpeed : 2000,
          parallax: this.dataset.sliderParallax ? true : false,
          centeredSlides: this.dataset.centeredSlides ? true : false,
          speed: 600,
          watchSlidesProgress: true,
          grabCursor: this.dataset.grabCursor ? true : false,
          pagination: {
            el: carousel.querySelector(".swiper-pagination"),
            clickable: setClickable,
            type: setTypePanigation,
          },
          navigation: {
            nextEl: carousel.querySelector(".swiper-button-next"),
            prevEl: carousel.querySelector(".swiper-button-prev"),
          },
          breakpoints: {
            551: {
              slidesPerView: this.dataset.itemSm,
              spaceBetween: setspaceBetween,
            },
            750: {
              slidesPerView: this.dataset.itemMd,
              spaceBetween: this.dataset.spaceBetweenTablet
                ? this.dataset.spaceBetweenTablet
                : setspaceBetween,
            },
            990: {
              slidesPerView: this.dataset.itemLg,
              spaceBetween: this.dataset.spaceBetweenTablet
                ? this.dataset.spaceBetweenTablet
                : setspaceBetween,
            },
            1200: {
              slidesPerView: this.dataset.itemXl,
              spaceBetween: this.dataset.spaceBetweenDesktop
                ? this.dataset.spaceBetweenDesktop
                : setspaceBetween,
            },
            1400: {
              slidesPerView: this.dataset.itemXxl,
              spaceBetween: this.dataset.spaceBetweenDesktop
                ? this.dataset.spaceBetweenDesktop
                : setspaceBetween,
            },
          },
          on: {
            init: function () {
              if (carousel.getAttribute("data-slide-to-1")) {
                if (!carousel.classList.contains("infinite-scroll")) {
                  this.slideTo(1);
                }
              }
            },
          },
        };
      }
      const swiper = new Swiper(carousel, swiperOptions);
    }
  }
}
customElements.define("slider-component", SliderComponent);

class SliderComponentProduct extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.typePagination;
    this.value;

    this.carousel_thumb = this.querySelector(".carousel-thumb.swiper");
    this.carousel_product = this.querySelector(
      ".carousel-thumb-product.swiper"
    );

    if (this.carousel_product && this.carousel_thumb)
      this.initCarousel(this.carousel_product, this.carousel_thumb);
  }

  setClickable() {
    this.type == "dots" || this.type == "dashed"
      ? (this.value = true)
      : (this.value = false);
    return this.value;
  }

  setTypePanigation() {
    if (this.type == "fraction" || this.type == "progressbar") {
      this.value = this.type;
    } else if (this.type == "dots" || this.type == "dashed") {
      this.value = "bullets";
      if (this.type == "dashed")
        this.querySelector(".swiper-pagination").classList.add(
          "swiper-pagination-dashed"
        );
    } else if (this.type == "progressbar_vertical") {
      this.value = "progressbar";
    } else {
      this.value = "custom";
    }
    return this.value;
  }

  initCarousel(carousel_product, carousel_thumb) {
    let setTypePanigation = this.setTypePanigation(),
      setspaceBetween = carousel_thumb.dataset.spaceBetween,
      spaceBetweenDesktop = carousel_thumb.dataset.spaceBetweenDesktop,
      spaceBetweenTablet = carousel_thumb.dataset.spaceBetweenTablet,
      directionDesktop = carousel_thumb.dataset.directionDesktop;
    const swiperThumbnail = new Swiper(carousel_thumb, {
      direction: "horizontal",
      spaceBetween: setspaceBetween,
      slidesPerView: 4,
      watchSlidesProgress: true,
      speed: 800,
      breakpoints: {
        551: {
          spaceBetween: setspaceBetween,
        },
        750: {
          direction: "horizontal",
          spaceBetween: spaceBetweenTablet
            ? spaceBetweenTablet
            : setspaceBetween,
        },
        1200: {
          direction: directionDesktop ? directionDesktop : "horizontal",
          spaceBetween: spaceBetweenDesktop
            ? spaceBetweenDesktop
            : setspaceBetween,
        },
      },
    });

    const swiperProduct = new Swiper(carousel_product, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      speed: 800,
      pagination: {
        el: this.querySelector(".swiper-pagination"),
        type: setTypePanigation,
        clickable: false,
      },
      navigation: {
        nextEl: this.querySelector(".swiper-button-next"),
        prevEl: this.querySelector(".swiper-button-prev"),
      },
      thumbs: {
        swiper: swiperThumbnail,
      },
    });
  }
}
customElements.define("slider-product-component", SliderComponentProduct);

class CategorySlide extends HTMLElement {
  constructor() {
    super();
    this.value;
    this.carousel = this.querySelector(".swiper");
    if (this.carousel) this.initCarousel(this.carousel);
  }

  initCarousel(carousel) {
    const cateThumbs = this.querySelector(".cate-slide__pagi .swiper");
    const cateImage = this.querySelector(".cate-slide__image .swiper");
    const bpoint = "(min-width: 1200px)";

    const swiperCateThumbs = new Swiper(cateThumbs, {
      spaceBetween: 0,
      slidesPerView: cateThumbs.dataset.itemPerviewMobile,
      watchSlidesProgress: true,
      breakpoints: {
        750: {
          slidesPerView: cateThumbs.dataset.itemPerviewTablet,
        },
        1200: {
          slidesPerView: cateThumbs.dataset.itemPerviewDesktop,
        },
      },
    });

    const swiperCateMain = new Swiper(cateImage, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      effect: "fade",
      navigation: {
        nextEl: this.querySelector(".section__cate-slide .swiper-button-next"),
        prevEl: this.querySelector(".section__cate-slide .swiper-button-prev"),
      },
      thumbs: {
        swiper: swiperCateThumbs,
      },
    });

    if (window.matchMedia(bpoint).matches) {
      swiperCateThumbs.slides.forEach((slide, index) => {
        slide.addEventListener("mouseenter", () => {
          swiperCateMain.slideTo(index);
        });
      });
    }
  }
}
customElements.define("category-slide", CategorySlide);

class AnchorTarget extends HTMLElement {
  constructor() {
    super();

    const buttons = document.querySelectorAll("[data-anchor]");

    if (!buttons) return;
    buttons.forEach((button) => {
      const section = button.closest("[data-anchor-container]"),
        sectionHeight = section.offsetHeight;

      button.addEventListener("click", () => {
        window.scrollTo({
          top: sectionHeight,
          behavior: "smooth",
        });
      });
    });
  }
}
customElements.define("anchor-target", AnchorTarget);

class SlideshowComponent extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.typePagination;
    this.value;
    this.carousel = this.querySelector(".swiper");

    if (this.carousel) this.initCarousel(this.carousel);

    document.addEventListener("page:loaded", () => {
      this.mediaHover = this.querySelectorAll(".banner__media-hover");
      if (!window.matchMedia("(max-width: 749px)").matches) {
        this.mediaHover?.forEach((e) => {
          if (e.querySelector(".data__media-hover")) {
            this.maskHover = e.querySelectorAll(".data__media-hover");
            this.maskHover?.forEach((mask) => {
              mask?.addEventListener("mouseenter", (event) => {
                e.classList.add("mask-hover");
              });

              mask?.addEventListener("mouseleave", (event) => {
                e.classList.remove("mask-hover");
              });
            });
          } else {
            e.classList.remove("banner__media-hover");
          }
        });
      }
    });
  }

  setClickable() {
    this.type == "dots" || this.type == "dashed" || this.type == "number"
      ? (this.value = true)
      : (this.value = false);
    if (this.type == "number")
      this.querySelector(".swiper-pagination")?.classList.add(
        "swiper-pagination-number"
      );
    return this.value;
  }

  setTypePanigation() {
    if (this.type == "fraction" || this.type == "progressbar") {
      this.value = this.type;
    } else if (this.type == "dots" || this.type == "dashed") {
      this.value = "bullets";
      if (this.type == "dashed")
        this.querySelector(".swiper-pagination").classList.add(
          "swiper-pagination-dashed"
        );
    } else if (this.type == "progressbar_vertical") {
      this.value = "progressbar";
    } else {
      this.value = "custom";
    }
    return this.value;
  }

  setAutoPlay(swiper) {
    this.sliderAutoplayButton =
      this.querySelector(".button-slider__autoplay") ||
      this.querySelector(".autoplay-progress");
    this.enable_autoplay = this.classList.contains("enable--autoplay");

    if (this.sliderAutoplayButton) {
      if (
        this.querySelector(".button-slider__autoplay") ||
        this.querySelector(".autoplay-progress")
      ) {
        this.sliderAutoplayButton.addEventListener("click", (event) => {
          this.sliderAutoplayButton.classList.toggle("paused");
          this.sliderAutoplayButton.classList.contains("paused")
            ? swiper.autoplay.stop()
            : swiper.autoplay.start();
        });

        this.carousel.addEventListener("mouseenter", (event) => {
          const focusedOnAutoplayButton =
            event.target === this.sliderAutoplayButton ||
            this.sliderAutoplayButton.contains(event.target);
          if (
            !this.sliderAutoplayButton.classList.contains("paused") ||
            focusedOnAutoplayButton
          )
            swiper.autoplay.stop();
        });

        this.carousel.addEventListener("mouseleave", (event) => {
          const focusedOnAutoplayButton =
            event.target === this.sliderAutoplayButton ||
            this.sliderAutoplayButton.contains(event.target);
          if (
            !this.sliderAutoplayButton.classList.contains("paused") ||
            focusedOnAutoplayButton
          )
            swiper.autoplay.start();
        });
      } else {
        swiper.autoplay.start();
      }
    } else {
      if (this.enable_autoplay) {
        swiper.autoplay.start();

        this.carousel.addEventListener("mouseenter", (event) => {
          swiper.autoplay.stop();
        });

        this.carousel.addEventListener("mouseleave", (event) => {
          swiper.autoplay.start();
        });

        this.carousel.addEventListener("focusin", (event) => {
          swiper.autoplay.stop();
        });

        this.carousel.addEventListener("focusout", (event) => {
          swiper.autoplay.start();
        });
      } else {
        swiper.autoplay.stop();
      }
    }
  }

  initCarousel(carousel) {
    var setClickable = this.setClickable(),
      setTypePanigation = this.setTypePanigation(),
      setInfiniteScroll = this.classList.contains("infinite-scroll"),
      setAutoplaySpeed = this.dataset.speed * 1000;

    if (this.type == "number") {
      var swiperOptions = {
        slidesPerView: 1,
        loop: setInfiniteScroll,
        speed: this.dataset.duration ? this.dataset.duration : 800,
        parallax: true,
        autoplay: {
          delay: setAutoplaySpeed,
          disableOnInteraction: false,
        },
        pagination: {
          el: carousel.querySelector(".swiper-pagination"),
          clickable: setClickable,
          renderBullet: function (index, className) {
            return (
              '<div class="cus-bullet ' +
              className +
              '"><span class="dot-stt">' +
              (index + 1) +
              "</span></div>"
            );
          },
        },
        navigation: {
          nextEl: carousel.querySelector(".swiper-button-next"),
          prevEl: carousel.querySelector(".swiper-button-prev"),
        },
        on: {
          autoplayTimeLeft(s, time, progress) {
            carousel.querySelectorAll(`.autoplay-progress`)?.forEach((e) => {
              e.style.setProperty("--progress", 1 - progress);
            });
          },
        },
      };
    } else {
      var swiperOptions = {
        slidesPerView: 1,
        loop: setInfiniteScroll,
        speed: this.dataset.duration ? this.dataset.duration : 800,
        parallax: true,
        autoplay: {
          delay: setAutoplaySpeed,
          disableOnInteraction: false,
        },
        pagination: {
          el: carousel.querySelector(".swiper-pagination"),
          clickable: setClickable,
          type: setTypePanigation,
        },
        navigation: {
          nextEl: carousel.querySelector(".swiper-button-next"),
          prevEl: carousel.querySelector(".swiper-button-prev"),
        },
        on: {
          autoplayTimeLeft(s, time, progress) {
            carousel.querySelectorAll(`.autoplay-progress`)?.forEach((e) => {
              e.style.setProperty("--progress", 1 - progress);
            });
          },
        },
      };
    }

    var swiper = new Swiper(carousel, swiperOptions);
    this.setAutoPlay(swiper);
  }
}
customElements.define("slideshow-component", SlideshowComponent);

class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.querySelector(".section-header");
    this.logoSpecial = this.querySelector(`.header--logo-special`);
    this.headerBounds = {};
    this.currentScrollTop = 0;
    this.preventReveal = false;
    this.predictiveSearch = this.querySelector("predictive-search");

    this.onScrollHandler = this.onScroll.bind(this);
    this.hideHeaderOnScrollUp = () => (this.preventReveal = true);

    this.addEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp);
    window.addEventListener("scroll", this.onScrollHandler, false);

    this.createObserver();

    if (
      this.classList.contains("transparent") &&
      document.querySelector(".section__slideshow")
    ) {
      document
        .querySelector(".section__slideshow")
        .style.setProperty(
          "--has-header-transparent",
          `${this.offsetHeight}px`
        );
      window.addEventListener("resize", () => {
        document
          .querySelector(".section__slideshow")
          .style.setProperty(
            "--has-header-transparent",
            `${this.offsetHeight}px`
          );
      });
    }

    if (this.logoSpecial) {
      this.header.classList.add("pos-sticky", "top-0", "animate");
      this.onScrollHandlerLogo = this.onScrollLogo.bind(this);
      window.addEventListener("scroll", this.onScrollHandlerLogo, false);

      this.resize();
      window.addEventListener("resize", () => {
        this.resize(true);
      });
    }

    this.checkTransparent();
  }

  resize(setAuto) {
    if (setAuto) this.logoSpecial.style.height = `auto`;
    this.onScrollHandlerLogo();

    this.logoSpecial.addEventListener("transitionstart", () => {
      this.header.classList.add("animating");
    });

    this.logoSpecial.addEventListener("transitionend", () => {
      this.header.classList.remove("animating");
    });
  }

  disconnectedCallback() {
    this.removeEventListener("preventHeaderReveal", this.hideHeaderOnScrollUp);
    window.removeEventListener("scroll", this.onScrollHandler);
    if (this.logoSpecial)
      window.removeEventListener("scroll", this.onScrollHandlerLogo);
  }

  createObserver() {
    let observer = new IntersectionObserver((entries, observer) => {
      this.headerBounds = entries[0].intersectionRect;
      observer.disconnect();
    });

    observer.observe(this.header);
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.predictiveSearch && this.predictiveSearch.isOpen) return;

    if (
      scrollTop > this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      if (this.preventHide) return;
      requestAnimationFrame(this.hide.bind(this));
    } else if (
      scrollTop < this.currentScrollTop &&
      scrollTop > this.headerBounds.bottom
    ) {
      if (!this.preventReveal) {
        requestAnimationFrame(this.reveal.bind(this));
      } else {
        window.clearTimeout(this.isScrolling);

        this.isScrolling = setTimeout(() => {
          this.preventReveal = false;
        }, 66);

        requestAnimationFrame(this.hide.bind(this));
      }
    } else if (scrollTop <= this.headerBounds.top) {
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  onScrollLogo() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (this.header.matches(".animating")) return;
    scrollTop <= 0 && scrollTop < this.logoSpecial.scrollHeight
      ? requestAnimationFrame(this.enableLogoSpecial.bind(this))
      : requestAnimationFrame(this.disableLogoSpecial.bind(this));
  }

  hide() {
    this.header.classList.add("pos-sticky", "top-0");
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.add("sticky-hidden");
    document.body.classList.add("scroll-down");
    document.body.classList.remove("scroll-up");
  }

  reveal() {
    this.header.classList.add("pos-sticky", "top-0", "animate");
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.remove("sticky-hidden");
    document.body.classList.add("scroll-up");
    document.body.classList.remove("scroll-down");
  }

  reset() {
    if (!document.querySelector(".header-sticky__always"))
      this.header.classList.remove(
        "sticky-hidden",
        "pos-sticky",
        "top-0",
        "animate"
      );
    document.body.classList.remove("scroll-down", "scroll-up");
  }

  enableLogoSpecial() {
    this.header.classList.add(
      "disable--logo-small",
      "pos-sticky",
      "top-0",
      "animate"
    );
    this.header.classList.remove("enable--logo-small");
    this.logoSpecial.style.height = `${this.logoSpecial.scrollHeight}px`;
  }

  disableLogoSpecial() {
    this.header.classList.add("enable--logo-small");
    this.header.classList.remove("disable--logo-small");
    this.logoSpecial.style.height = `0px`;
  }

  checkTransparent() {
    const sectionHeaderGroup = document.querySelectorAll(
      ".shopify-section-group-header-group"
    );
    if (
      !this.matches(".transparent") ||
      sectionHeaderGroup.length == 1 ||
      sectionHeaderGroup[sectionHeaderGroup.length - 1].matches(
        ".section-header"
      )
    )
      return;
    this.classList.remove("transparent", "pos-absolute");
  }
}
customElements.define("sticky-header", StickyHeader);

class ThemeSwiper extends HTMLElement {
  constructor() {
    super();

    this.component = this.querySelectorAll("slider-component");
    this.slider = this.querySelectorAll(".carousel__items");
    this.items = this.querySelectorAll(".carousel__item");
    this.breakpoints = this.dataset.breakpoint.split(",");

    this.init();
  }

  init() {
    let bpoint;
    let _component = this.dataset.classComponent.split(" ");
    let _slider = this.dataset.classSlider.split(" ");
    let _items = this.dataset.classItems.split(" ");

    this.breakpoints.forEach((breakpoint) => {
      switch (breakpoint) {
        case "all":
          bpoint = "all";
          break;
        case "xs":
          bpoint = "(max-width: 550px)";
          break;
        case "sm":
          bpoint = "(max-width: 749px)";
          break;
        case "md":
          bpoint = "(max-width: 989px)";
          break;
        case "lg":
          bpoint = "(max-width: 1199px)";
          break;
        case "u-sm":
          bpoint = "(min-width: 750px)";
          break;
        case "u-md":
          bpoint = "(min-width: 990px)";
          break;
        case "u-lg":
          bpoint = "(min-width: 1200px)";
          break;
      }
    });

    if (bpoint == "all") {
      this.toggleClass(this.component, _component, true);
      this.toggleClass(this.slider, _slider, true);
      this.toggleClass(this.items, _items, true);
    } else {
      if (window.matchMedia(bpoint).matches) {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.slider, _slider, true);
        this.toggleClass(this.items, _items, true);
      } else {
        this.toggleClass(this.component, _component, false);
        this.toggleClass(this.slider, _slider, false);
        this.toggleClass(this.items, _items, false);
      }
    }

    new ResizeObserver((entries) => {
      if (bpoint == "all") {
        this.toggleClass(this.component, _component, true);
        this.toggleClass(this.slider, _slider, true);
        this.toggleClass(this.items, _items, true);
      } else {
        if (window.matchMedia(bpoint).matches) {
          this.toggleClass(this.component, _component, true);
          this.toggleClass(this.slider, _slider, true);
          this.toggleClass(this.items, _items, true);
        } else {
          this.toggleClass(this.component, _component, false);
          this.toggleClass(this.slider, _slider, false);
          this.toggleClass(this.items, _items, false);
        }
      }
    }).observe(document.body);
  }

  toggleClass(elements, c, check) {
    switch (check) {
      case true:
        elements.forEach((element) => {
          element.classList.add(...c);
        });
        break;
      case false:
        elements.forEach((element) => {
          element.classList.remove(...c);
        });
        break;
    }
  }
}
customElements.define("theme-swiper", ThemeSwiper);

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

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();

    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }

    this.updateOthers();
  }

  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll("select"),
      (select) => select.value
    );
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateOthers() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    if (this.nodeName == "VARIANT-RADIOS") {
      this.other = Array.from(
        this.closest("[id^=MainProduct-]").querySelectorAll("variant-radios")
      ).filter((selector) => {
        return selector != this;
      });
    } else {
      this.other = Array.from(
        this.closest("[id^=MainProduct-]").querySelectorAll("variant-selects")
      ).filter((selector) => {
        return selector != this;
      });
    }

    if (this.other.length) {
      const options = Array.from(this.querySelectorAll(".product-form__input"));
      const alterOptions = Array.from(
        this.other[0].querySelectorAll(".product-form__input")
      );

      if (options && alterOptions) {
        let selectedOption1;
        let selectedOption2;
        let selectedOption3;

        if (options[0]) {
          if (this.nodeName == "VARIANT-RADIOS") {
            selectedOption1 = Array.from(
              options[0].querySelectorAll("input")
            ).find((radio) => radio.checked).value;
            alterOptions[0].querySelector(
              `input[value="${selectedOption1}"]`
            ).checked = true;
          } else {
            selectedOption1 = options[0].querySelector("select").value;
            alterOptions[0].querySelector("select").value = selectedOption1;
          }

          alterOptions[0].querySelector("[data-header-option]").textContent =
            selectedOption1;
        }

        if (options[1]) {
          if (this.nodeName == "VARIANT-RADIOS") {
            selectedOption2 = Array.from(
              options[1].querySelectorAll("input")
            ).find((radio) => radio.checked).value;
            alterOptions[1].querySelector(
              `input[value="${selectedOption2}"]`
            ).checked = true;
          } else {
            selectedOption2 = options[1].querySelector("select").value;
            alterOptions[1].querySelector("select").value = selectedOption2;
          }

          alterOptions[1].querySelector("[data-header-option]").textContent =
            selectedOption2;
        }

        if (options[2]) {
          if (this.nodeName == "VARIANT-RADIOS") {
            selectedOption3 = Array.from(
              options[2].querySelectorAll("input")
            ).find((radio) => radio.checked).value;
            alterOptions[2].querySelector(
              `input[value="${selectedOption3}"]`
            ).checked = true;
          } else {
            selectedOption3 = options[2].querySelector("select").value;
            alterOptions[2].querySelector("select").value = selectedOption3;
          }

          alterOptions[2].querySelector("[data-header-option]").textContent =
            selectedOption3;
        }
      }
    }
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(
      `[id^="MediaGallery-${this.dataset.section}"]`
    );
    const mediaStickyGallery = document.getElementById(
      `MediaStickyAddToCart-${this.dataset.section}`
    );
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(
        `${this.dataset.section}-${this.currentVariant.featured_media.id}`,
        true,
        this.currentVariant
      )
    );

    if (mediaStickyGallery) {
      mediaStickyGallery
        .querySelector("img")
        .setAttribute("src", this.currentVariant?.featured_image.src);
      mediaStickyGallery
        .querySelector("img")
        .setAttribute("srcset", this.currentVariant?.featured_image.src);
      mediaStickyGallery
        .querySelector("img")
        .setAttribute("alt", this.currentVariant?.featured_image.alt);
    }

    const modalContent = document.querySelector(
      `#ProductModal-${this.dataset.section} .product-media-modal__content`
    );
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(
      `[data-media-id="${this.currentVariant.featured_media.id}"]`
    );
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateShareUrl() {
    const shareButton = document.getElementById(
      `Share-${this.dataset.section}`
    );
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(
      `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-${this.dataset.section}-duplicate, #product-form-installment-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__input")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.innerText = input.getAttribute("value");
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace(
          "[value]",
          input.getAttribute("value")
        );
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  removeErrorMessage() {
    const section = this.closest("section");
    if (!section) return;

    const productForm = section.querySelector("product-form");
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection
      ? this.dataset.originalSection
      : this.dataset.section;

    fetch(
      `${this.dataset.url}?variant=${requestedVariantId}&section_id=${
        this.dataset.originalSection
          ? this.dataset.originalSection
          : this.dataset.section
      }`
    )
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections
        if (this.currentVariant.id !== requestedVariantId) return;

        const html = new DOMParser().parseFromString(responseText, "text/html");
        const destination = document.getElementById(
          `price-${this.dataset.section}`
        );
        const destinationSticky = document.getElementById(
          `price-sticky-${this.dataset.section}`
        );
        const source = html.getElementById(
          `price-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const sourceSticky = html.getElementById(
          `price-sticky-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const skuSource = html.getElementById(
          `Sku-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const skuDestination = document.getElementById(
          `Sku-${this.dataset.section}`
        );
        const inventorySource = html.getElementById(
          `Inventory-${
            this.dataset.originalSection
              ? this.dataset.originalSection
              : this.dataset.section
          }`
        );
        const inventoryDestination = document.getElementById(
          `Inventory-${this.dataset.section}`
        );
        const options = Array.from(
          this.querySelectorAll(".product-form__input")
        );

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (sourceSticky && destinationSticky)
          destinationSticky.innerHTML = sourceSticky.innerHTML;
        if (inventorySource && inventoryDestination)
          inventoryDestination.innerHTML = inventorySource.innerHTML;
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle(
            "visibility-hidden",
            skuSource.classList.contains("visibility-hidden")
          );
        }

        const price = document.getElementById(`price-${this.dataset.section}`);
        const priceSticky = document.getElementById(
          `price-sticky-${this.dataset.section}`
        );

        if (price) price.classList.remove("visibility-hidden");
        if (priceSticky) priceSticky.classList.remove("visibility-hidden");

        if (inventoryDestination)
          inventoryDestination.classList.toggle(
            "visibility-hidden",
            inventorySource.innerText === ""
          );

        if (options) {
          let selectedOption1;
          let selectedOption2;
          let selectedOption3;

          if (options[0]) {
            if (this.nodeName == "VARIANT-RADIOS") {
              selectedOption1 = Array.from(
                options[0].querySelectorAll("input")
              ).find((radio) => radio.checked).value;
            } else {
              selectedOption1 = options[0].querySelector("select").value;
            }

            options[0].querySelector("[data-header-option]").textContent =
              selectedOption1;
          }

          if (options[1]) {
            if (this.nodeName == "VARIANT-RADIOS") {
              selectedOption2 = Array.from(
                options[1].querySelectorAll("input")
              ).find((radio) => radio.checked).value;
            } else {
              selectedOption2 = options[1].querySelector("select").value;
            }

            options[1].querySelector("[data-header-option]").textContent =
              selectedOption2;
          }

          if (options[2]) {
            if (this.nodeName == "VARIANT-RADIOS") {
              selectedOption3 = Array.from(
                options[2].querySelectorAll("input")
              ).find((radio) => radio.checked).value;
            } else {
              selectedOption3 = options[2].querySelector("select").value;
            }

            options[2].querySelector("[data-header-option]").textContent =
              selectedOption3;
          }
        }

        const addButtonUpdated = html.getElementById(
          `ProductSubmitButton-${sectionId}`
        );
        this.toggleAddButton(
          addButtonUpdated ? addButtonUpdated.hasAttribute("disabled") : true,
          window.variantStrings.soldOut
        );

        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant,
          },
        });
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForms = document.querySelectorAll(
      `[id^="product-form-${this.dataset.section}"]`
    );

    if (productForms.length > 0) {
      productForms.forEach((productForm) => {
        const addButton = productForm.querySelector('[name="add"]');
        const addButtonText = productForm.querySelector('[name="add"] > span');
        if (!addButton) return;

        if (disable) {
          addButton.setAttribute("disabled", "disabled");
          if (text) addButtonText.textContent = text;
        } else {
          addButton.removeAttribute("disabled");
          addButtonText.textContent = window.variantStrings.addToCart;
        }
      });
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);

    const productForms = document.querySelectorAll(
      `[id^="product-form-${this.dataset.section}"]`
    );

    if (productForms.length > 0) {
      productForms.forEach((productForm) => {
        const addButton = productForm.querySelector('[name="add"]');
        const addButtonText = productForm.querySelector('[name="add"] > span');
        if (!addButton) return;

        addButtonText.textContent = window.variantStrings.unavailable;
      });
    }

    if (price) price.classList.add("visibility-hidden");
    if (inventory) inventory.classList.add("visibility-hidden");
    if (sku) sku.classList.add("visibility-hidden");
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
        input.classList.remove("disabled");
      } else {
        input.classList.add("disabled");
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked
      ).value;
    });
  }
}
customElements.define("variant-radios", VariantRadios);

class VideoTemplate extends HTMLElement {
  constructor() {
    super();

    this.video = this.querySelector("iframe");
    this.video_tag = this.querySelector("video");
    this.isMouseenter = false;
  }

  loadVideo() {
    if (!this.video && !this.video_tag) return;

    if (this.video) {
      this.dispatchEvent(
        new CustomEvent("loadingStart", {
          detail: { element: this.video, parent: this },
        })
      );
      this.video.setAttribute("src", this.video.getAttribute("data-src"));
      this.video.addEventListener(
        "load",
        function () {
          this.dispatchEvent(
            new CustomEvent("loadingEnd", {
              detail: { element: this.video, parent: this },
            })
          );
          this.dataVideoType == "youtube" &&
            this.video.contentWindow.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              "*"
            );
        }.bind(this)
      );

      this.isLoaded(true);
    }

    if (this.video_tag) {
      this.video_tag.play();
    }
  }

  init() {
    if (this.dataset.autoplay === "true") {
      if (Shopify.designMode) {
        this.loadVideo();
      } else {
        ["mouseenter", "touchstart"].forEach(
          function (e) {
            document.body.addEventListener(
              e,
              function () {
                this.isMouseenter || this.loadVideo();
                this.isMouseenter = true;
              }.bind(this)
            );
          }.bind(this)
        );

        window.addEventListener(
          "scroll",
          function () {
            this.isMouseenter || this.loadVideo();
            this.isMouseenter = true;
          }.bind(this),
          false
        );
      }
    } else {
      this.isMouseenter = true;
    }
  }

  isLoaded(load) {
    if (load) {
      this.setAttribute("loaded", true);
      this.querySelectorAll("img, svg").forEach((element) => element.remove());
    } else {
      this.removeAttribute("loaded");
    }
  }

  static get observedAttributes() {
    return ["data-video-type", "data-video-id"];
  }

  set dataVideoType(type) {
    this.setAttribute("data-video-type", type);
  }

  get dataVideoType() {
    return this.getAttribute("data-video-type");
  }

  set dataVideoId(id) {
    this.setAttribute("data-video-id", id);
  }

  get dataVideoId() {
    return this.getAttribute("data-video-id");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    oldValue !== newValue && this.init();
  }

  connectedCallback() {
    this.init();
  }
}
customElements.define("video-template", VideoTemplate);

class VideoTemplateOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const video = document.querySelector(this.getAttribute("data-video"));
      if (video) video.loadVideo();
      button.parentElement.classList.add("hidden");
    });
  }
}
customElements.define("video-template-opener", VideoTemplateOpener);

class ProductCustomerViewing extends HTMLElement {
  constructor() {
    super();

    const wrapper = document.querySelector(".product__quickview-inner");

    if (wrapper) {
      const numbersViewer = wrapper.getAttribute("data-customer-view"),
        numbersViewerList = JSON.parse("[" + numbersViewer + "]"),
        numbersViewerTime = wrapper.getAttribute("data-customer-view-time"),
        timeViewer = parseInt(numbersViewerTime) * 1000;

      setInterval(function () {
        const numbersViewerItem = Math.floor(
          Math.random() * numbersViewerList.length
        );

        wrapper.querySelector(".text").innerHTML =
          window.customer_view.text.replace(
            "[number]",
            numbersViewerList[numbersViewerItem]
          );
      }, timeViewer);
    }
  }
}
customElements.define("customer-viewing", ProductCustomerViewing);

class WriteComment extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      document.body.classList.contains("w-c") ? this.hide() : this.show();
    });
  }

  show() {
    document.body.classList.add("w-c");
  }

  hide() {
    document.body.classList.remove("w-c");
  }
}
customElements.define("write-comment", WriteComment);

class Parallax extends HTMLElement {
  constructor() {
    super();

    this.parallax = this.querySelector("[data-parallax]");

    this.init(this.parallax);
  }

  init(item) {
    let event = item,
      ctn = event.closest("[data-parallax-container]");

    event.style.transition = "0s";
    gsap.set(event, { yPercent: 0 });
    gsap.to(event, {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: ctn,
        start: "top 0%",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  }
}

customElements.define("parallax-container", Parallax);

class CollapseCollection extends HTMLElement {
  constructor() {
    super();
    this.accordions = this.querySelectorAll(".item");

    this.init();
  }

  init() {
    this.openAccordion(this.accordions[0]);
    this.accordions.forEach((accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.addEventListener("click", () => {
        if (content.style.maxHeight) {
          this.closeAccordion(accordion);
        } else {
          this.accordions.forEach((accordion) =>
            this.closeAccordion(accordion)
          );
          this.openAccordion(accordion);
        }
      });

      this.resize(accordion);
    });
  }

  openAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion__content");
    accordion.classList.add("accordion__active");
    content.style.maxHeight = content.scrollHeight + "px";
  };

  closeAccordion = (accordion) => {
    const content = accordion.querySelector(".accordion__content");
    accordion.classList.remove("accordion__active");
    content.style.maxHeight = null;
  };

  resize = (accordion) => {
    const content = accordion.querySelector(".accordion__content");

    window.addEventListener("resize", () => {
      if (accordion.classList.contains("accordion__active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  };
}

customElements.define("collapse-collection", CollapseCollection);

class SplittingAnimate extends HTMLElement {
  constructor() {
    super();

    this.target = this.querySelectorAll("[data-splitting-element]");

    this.chars = this.querySelectorAll(
      "[data-splitting-element][data-splitting-animate]"
    );

    this.split();

    this.animate(this.chars, ".char");
  }

  split() {
    Splitting({
      target: this.target,
      by: "chars",
      key: null,
    });
  }

  animate(els, className) {
    els.forEach((el) => {
      if (el.getAttribute("data-splitting-element") == "chars") {
        gsap.fromTo(
          el.querySelectorAll(className),
          0.4,
          {
            yPercent: 100,
          },
          {
            scrollTrigger: {
              trigger: els,
            },
            yPercent: 0,
            stagger: 0.05,
            delay: 0.2,
          }
        );
      } else {
        gsap.fromTo(
          el.querySelectorAll(className),
          0.2,
          {
            yPercent: 100,
            rotation: 30,
          },
          {
            scrollTrigger: {
              trigger: els,
            },
            yPercent: 0,
            rotation: 0,
            stagger: 0.02,
            delay: 0.2,
          }
        );
      }
    });
  }
}
customElements.define("splitting-animate", SplittingAnimate);

// gallery js
const gallery = document.querySelectorAll(".gallery-js");

gallery.forEach((i) => {
  const id = i.getAttribute("id");

  window.lightGallery(document.querySelector(`.gallery-js#${id}`), {
    selector: ".item-gallery",
    autoplayFirstVideo: false,
    pager: false,
    galleryId: "nature",
    plugins: [lgThumbnail],
    mobileSettings: {
      controls: false,
      showCloseIcon: false,
      download: false,
      rotate: false,
    },
  });
});

class NewsletterForm extends HTMLElement {
  constructor() {
    super();
    this.querySelector(".form--check label").addEventListener(
      "click",
      this.onClickChecked.bind(this)
    );
  }

  onClickChecked(e) {
    e.target.closest(".form--check").querySelector("input").checked
      ? this.querySelector(".newsletter-form__button").setAttribute(
          "disabled",
          true
        )
      : this.querySelector(".newsletter-form__button").removeAttribute(
          "disabled"
        );
  }
}
customElements.define("form-has-check", NewsletterForm);

// button ripple
function buttonRippleHover() {
  const btnRipple = document.querySelectorAll(".button--style-ripple");
  if (btnRipple) {
    btnRipple.forEach((button) => {
      const ripples = document.createElement("span");
      ripples.className = "layer";
      button.appendChild(ripples);

      const xSet = gsap.quickSetter(ripples, "xPercent");
      const ySet = gsap.quickSetter(ripples, "yPercent");

      const getXY = (e) => {
        const { left, top, width, height } = button.getBoundingClientRect();

        const xTransformer = gsap.utils.pipe(
          gsap.utils.mapRange(0, width, 0, 100),
          gsap.utils.clamp(0, 100)
        );

        const yTransformer = gsap.utils.pipe(
          gsap.utils.mapRange(0, height, 0, 100),
          gsap.utils.clamp(0, 100)
        );

        return {
          x: xTransformer(e.clientX - left),
          y: yTransformer(e.clientY - top),
        };
      };

      button.addEventListener("mouseenter", (e) => {
        const { x, y } = getXY(e);

        xSet(x);
        ySet(y);

        gsap.to(ripples, {
          scale: 1,
          duration: 0.8,
          ease: "power4.out",
        });
      });

      button.addEventListener("mouseleave", (e) => {
        const { x, y } = getXY(e);

        gsap.killTweensOf(ripples);

        gsap.to(ripples, {
          xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
          yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
          scale: 0,
          duration: 0.5,
          ease: "power4.out",
        });
      });

      button.addEventListener("mousemove", (e) => {
        const { x, y } = getXY(e);

        gsap.to(ripples, {
          xPercent: x,
          yPercent: y,
          duration: 0.4,
          ease: "power2",
        });
      });
    });
  }
}
buttonRippleHover();

class BundlePriceTotal extends HTMLElement {
  constructor() {
    super();

    this.priceBeforeSales = this.querySelectorAll(
      ".price__sale .price-before--sale"
    );
    this.priceSalesTotal = this.querySelector(".price-sale-total");

    this.prices = this.querySelectorAll(".price__regular .price-item--regular");
    this.priceTotal = this.querySelector(".price-item-total");

    this.render(
      this.priceBeforeSales,
      this.priceSalesTotal,
      this.prices,
      this.priceTotal
    );
  }
  render(priceBeforeSales, priceSalesTotal, priceAfterSales, priceTotal) {
    const numberFormatter = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let totalSales = 0,
      totalPrice = 0;
    // Set value
    priceSalesTotal.closest(".price-item--regular").classList.add("d-none");

    priceBeforeSales?.forEach((price) => {
      if (price.innerText.trim() != "") {
        priceSalesTotal
          .closest(".price-item--regular")
          .classList.remove("d-none");

        const priceBeforeNumber = parseFloat(
          price.innerText.trim().slice(1).replace(/,/g, "")
        );
        totalSales += priceBeforeNumber;

        this.querySelectorAll(
          ".price__regular .price-item--regular:not(.price-after--sale)"
        ).forEach((priceBefore) => {
          const priceBeforeNumber = parseFloat(
            priceBefore.innerText.trim().slice(1).replace(/,/g, "")
          );
          totalSales += priceBeforeNumber;

          priceSalesTotal.innerHTML = `$${numberFormatter.format(totalSales)}`;
        });
      }
    });

    // Total
    priceAfterSales.forEach((price) => {
      const priceNumber = parseFloat(
        price.innerText.trim().slice(1).replace(/,/g, "")
      );
      totalPrice += priceNumber;
    });

    priceTotal.innerHTML = `$${numberFormatter.format(totalPrice)}`;
  }
}
customElements.define("bundle-price-total", BundlePriceTotal);

class BundleProducts extends HTMLElement {
  constructor() {
    super();

    this.cartDrawer = document.querySelector("cart-drawer");
    this.bundleButton = this.querySelector(".bundle__button");
    if (this.bundleButton)
      this.bundleButton.addEventListener(
        "click",
        this.onButtonClick.bind(this)
      );
  }

  onButtonClick(event) {
    event.preventDefault();

    const ids = this.querySelectorAll('[name="id"]');
    const items = {
      items: [...ids]
        .map((e) => e.value)
        .map((e) => ({
          id: e,
          quantity: 1,
        })),
    };

    if (document.body.classList.contains("template-cart")) {
      Shopify.postLink2(routes.cart_add_url, {
        parameters: {
          ...items,
        },
      });
      return;
    }

    this.handleErrorMessage();

    this.bundleButton.setAttribute("disabled", true);
    this.bundleButton.classList.add("loading");
    const sections = this.cartDrawer
      ? this.cartDrawer.getSectionsToRender().map((section) => section.id)
      : [];

    const body = JSON.stringify({
      ...items,
      sections: sections,
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig("javascript"), body })
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessage(response.description);
          return;
        }

        if (this.cartDrawer) {
          this.cartDrawer.renderContents(response);
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.bundleButton.classList.remove("loading");
        this.bundleButton.removeAttribute("disabled");
      });
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper =
      this.errorMessageWrapper ||
      this.querySelector(".product-form__error-message");

    if (this.errorMessageWrapper) {
      this.errorMessage =
        this.errorMessage ||
        this.errorMessageWrapper.querySelector(".product-form__error-message");
      this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    } else {
      if (errorMessage) {
        alert(errorMessage);
      }
    }
  }
}
customElements.define("bundle-products", BundleProducts);

// button container auto scroll center when click
class ScrollContainerCenter extends HTMLElement {
  constructor() {
    super();

    this.buttonContainer = this.querySelector(".button-center-container");
    this.buttons = this.querySelectorAll(".button-center-item");

    this.onclick(this.buttons, this.buttonContainer);
  }

  onclick(buttons, scrollContainer) {
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        const screenWidth = window.innerWidth;
        const buttonRect = button.getBoundingClientRect();
        const buttonCenter = buttonRect.left + buttonRect.width / 2;
        const scrollAmount = buttonCenter - screenWidth / 2;
        setTimeout(() => {
          scrollContainer.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }, 200);
      })
    );
  }
}
customElements.define("scroll-container-center", ScrollContainerCenter);

// cart tool
class CartTool extends HTMLElement {
  constructor() {
    super();
    const buttons = this.querySelectorAll(".cartTool-item");
    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const id = button.dataset.popup;
        document.getElementById(id).classList.add("show");
        document.querySelector(".previewCart").classList.add("active-tool");
      });
    });

    document
      .querySelector(`.previewCart .drawer__overlay`)
      ?.addEventListener("click", (event) => {
        document
          .querySelector(".popup-toolDown.show")
          ?.classList.remove("show");
        document.querySelector(".previewCart").classList.remove("active-tool");
      });
  }
}
customElements.define("cart-item-tool", CartTool);

class CartCancel extends HTMLElement {
  constructor() {
    super();

    this.querySelector("button").addEventListener("click", (event) => {
      document.querySelector(".popup-toolDown.show")?.classList.remove("show");
      document.querySelector(".previewCart").classList.remove("active-tool");
    });
  }
}
customElements.define("cart-cancel-popup", CartCancel);

class ShippingCalculator extends HTMLElement {
  constructor() {
    super();

    this.setupCountries();

    this.errors = this.querySelector("#ShippingCalculatorErrors");
    this.success = this.querySelector("#ShippingCalculatorSuccess");
    this.zip = this.querySelector("#address_zip");
    this.country = this.querySelector("#address_country");
    this.province = this.querySelector("#address_province");
    this.button = this.querySelector("#get-rates-submit");

    this.button.addEventListener("click", this.onSubmitHandler.bind(this));
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        "address_country",
        "address_province",
        {
          hideElement: "address_province_container",
        }
      );
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();

    this.errors.classList.add("hidden");
    this.success.classList.add("hidden");
    this.zip.classList.remove("invalid");
    this.country.classList.remove("invalid");
    this.province.classList.remove("invalid");
    this.button.classList.add("loading");
    this.button.setAttribute("disabled", true);

    const body = JSON.stringify({
      shipping_address: {
        zip: this.zip.value,
        country: this.country.value,
        province: this.province.value,
      },
    });
    let sectionUrl = `${routes.cart_url}/shipping_rates.json`;

    // remove double `/` in case shop might have /en or language in URL
    sectionUrl = sectionUrl.replace("//", "/");

    fetch(sectionUrl, { ...fetchConfig("javascript"), body })
      .then((response) => response.json())
      .then((parsedState) => {
        if (parsedState.shipping_rates) {
          this.success.classList.remove("hidden");
          this.success.innerHTML = "";

          parsedState.shipping_rates.forEach((rate) => {
            const child = document.createElement("p");
            child.innerHTML = `${rate.name}: ${rate.price} ${Shopify.currency.active}`;
            this.success.appendChild(child);
          });
        } else {
          let errors = [];
          Object.entries(parsedState).forEach(([attribute, messages]) => {
            errors.push(`${messages[0]}`);
          });

          this.errors.classList.remove("hidden");
          this.errors.querySelector(".errors").innerHTML = errors.join("; ");
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.button.classList.remove("loading");
        this.button.removeAttribute("disabled");
      });
  }
}
customElements.define("shipping-calculator", ShippingCalculator);

class CardWishlist extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector("button");
    this.handle = this.button.dataset.wishlistHandle;
    this.button.addEventListener("click", this.onButtonClick.bind(this));
    this.countBubble = document.querySelectorAll(".wishlist-count-bubble");
    this.check();
  }

  check() {
    let check = false;
    JSON.parse(localStorage.getItem("_wishlist"))?.map((handle) => {
      if (this.handle == handle) check = true;
    });
    if (check) this.add(false);
  }

  onButtonClick() {
    this.wishlist = localStorage.getItem("_wishlist");
    this.button.matches(".added")
      ? this.remove(this.wishlist)
      : this.add(true, this.wishlist);
  }

  add(set, wishlist) {
    this.button.classList.add("added");
    if (set) {
      let list = wishlist ? JSON.parse(wishlist) : [];
      list.push(this.handle);
      localStorage.setItem("_wishlist", JSON.stringify(list));
      this.setCountBubble();
    }
  }

  remove(wishlist) {
    const list = JSON.parse(wishlist).filter(
      (handle) => handle !== this.handle
    );
    list.length == 0
      ? localStorage.removeItem("_wishlist")
      : localStorage.setItem("_wishlist", JSON.stringify(list));
    this.button.classList.remove("added");
    this.setCountBubble();
  }

  setCountBubble() {
    const count = localStorage.getItem("_wishlist")
      ? JSON.parse(localStorage.getItem("_wishlist")).length
      : 0;
    this.countBubble?.forEach((element) => {
      const text = element.querySelector(".visually-hidden");
      text.innerHTML = `${count} ${text.dataset.text}`;
      element.querySelector(".number").innerHTML = count;
    });
  }
}
customElements.define("card-wishlist", CardWishlist);

class WishlistDrawer extends HTMLElement {
  constructor() {
    super();
    this.grid = this.querySelector(".wisthlist-grid");
    this.gridEmpty = document.querySelector(".wisthlist-grid__empty");
    this.countBubble = document.querySelectorAll(".wishlist-count-bubble");
    document
      .querySelectorAll('[data-side-drawer="#Drawer-Wishlist"]')
      ?.forEach((element) => {
        element.addEventListener("click", this.loadWishList.bind(this));
      });
    this.setCountBubble();
  }

  loadWishList() {
    const wishlist = localStorage.getItem("_wishlist");
    if (!wishlist) return;
    this.grid.innerHTML = "";
    this.gridEmpty?.classList.add("hidden");
    JSON.parse(wishlist)?.forEach((handle) => {
      fetch(
        window.Shopify.routes.root + `products/${handle}?view=wishlist-card`
      )
        .then((response) => response.text())
        .then((product) => {
          const productHTML = new DOMParser()
            .parseFromString(product, "text/html")
            .querySelector(".wishlist__item");
          if (productHTML != null) this.grid.append(productHTML);
          this.querySelector(
            `[data-wishlist-handle="${handle}"]`
          ).addEventListener("click", this.onButtonClick.bind(this));
        });
    });
  }

  onButtonClick(event) {
    const $target = event.currentTarget;
    const productHandle = $target.dataset.wishlistHandle;
    const list = JSON.parse(localStorage.getItem("_wishlist")).filter(
      (handle) => handle !== productHandle
    );
    list.length == 0
      ? localStorage.removeItem("_wishlist")
      : localStorage.setItem("_wishlist", JSON.stringify(list));
    document
      .querySelectorAll(`[data-wishlist-handle="${productHandle}"]`)
      .forEach((element) => {
        element.classList.remove("added");
      });
    $target.closest(".wishlist__item").remove();
    if (this.grid.innerHTML == "") this.gridEmpty?.classList.remove("hidden");
    this.setCountBubble();
  }

  setCountBubble() {
    const count = localStorage.getItem("_wishlist")
      ? JSON.parse(localStorage.getItem("_wishlist")).length
      : 0;
    this.countBubble?.forEach((element) => {
      const text = element.querySelector(".visually-hidden");
      text.innerHTML = `${count} ${text.dataset.text}`;
      element.querySelector(".number").innerHTML = count;
    });
  }
}
customElements.define("wishlist-drawer", WishlistDrawer);

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

if (!document.querySelector(".header--top-center-special")) {
  document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 1);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
  });
}

// TrustPilot Service Reviews
// url for word
var environment = "live";

const serviceStarsUrl =
  `https://honeypot-trade.co.uk/` +
  environment +
  `/trustpilot/service-stars.php`;

// Fetch data using the Fetch API
fetch(serviceStarsUrl)
  .then((response) => response.json())
  .then((serviceStars) => {
    const serviceStarsWordElement = document.querySelector(".serviceStarsWord");
    const numberOfReviewsImageElement = document.querySelector(".numberOfReviewsImage");

    if (serviceStarsWordElement) {
      serviceStarsWordElement.textContent = serviceStars ? serviceStars.string : "";
    }

    if (numberOfReviewsImageElement) {
      numberOfReviewsImageElement.innerHTML = serviceStars
        ? `<img src="//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_${serviceStars.stars}.png" class="stars-image pb-1" alt="Trustpilot Stars">`
        : "";
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

// Hide missing product videos
if (typeof productVideo !== "undefined" && productVideo === "") {
  let productVideoElement = document.querySelector('[id*="QM4Cg7"]');
  if (productVideoElement) {
    productVideoElement.style.display = "none";
  }
}

// Hide missing product videos
if (typeof productVideo !== "undefined" && productVideo === "") {
  var element = document.querySelector('[id*="QM4Cg7"]');
  if (element) {
    element.style.display = "none";
  }
}

// ufurnish tracking (This only needs to run on product pages)
function sclClickPixelFn() {
  const url = new URL(document.location.href).searchParams;
  if (url.get("a")) {
    const availableParams = [
      "aff_click_id",
      "sub_id1",
      "sub_id2",
      "sub_id3",
      "sub_id4",
      "sub_id5",
      "aff_param1",
      "aff_param2",
      "aff_param3",
      "aff_param4",
      "aff_param5",
      "idfa",
      "gaid",
    ];
    const t = new URL("https://tracker.ufurnish.com/click");
    const r = t.searchParams;
    r.append("a", url.get("a"));
    r.append("o", "50");
    r.append("return", "click_id");
    if (availableParams?.length > 0) {
      availableParams.forEach((key) => {
        const value = url.get(key);
        if (value) {
          r.append(key, value);
        }
      });
    }
    fetch(t.href)
      .then((e) => e.json())
      .then((e) => {
        const c = e.click_id;
        if (c) {
          const expiration = 864e5 * 365;
          const o = new Date(Date.now() + expiration);
          document.cookie = "click_id=" + c + ";expires=" + o;
        }
      });
  }
}
sclClickPixelFn();

// Meta Browser Bug Fix
window._AutofillCallbackHandler = window._AutofillCallbackHandler || function(){}