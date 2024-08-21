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
