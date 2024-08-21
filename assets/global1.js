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
