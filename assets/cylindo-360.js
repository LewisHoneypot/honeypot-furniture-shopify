// Make these accessible globally or in a shared scope
let exitZoom = () => {};
let activateThumb = () => {};

function init360Gallery() {
  // redefine exitZoom here so it updates the closure
  exitZoom = function () {
    if (!zoomEnabled) return;
    zoomEnabled = false;
    zoomBtn.innerText = "🔍 Zoom";
    mainWrapper.classList.remove("zoomed");
    mainImage.style.width = "100%";
    mainImage.style.height = "auto";
    mainImage.style.maxWidth = "100%";
    mainImage.style.maxHeight = "100%";
    if (spinning) {
      showFrame(currentFrame, true);
    }
  };

  const gallery = document.getElementById("pdp-gallery");
  if (!gallery) return;
  console.log("[INIT] Running 360 script");

  const mainWrapper = document.getElementById("main-image-wrapper");
  const mainImage = document.getElementById("main-image");

  if (!window.cylindoConfig) {
    console.error("[Cylindo] window.cylindoConfig not found!");
    return;
  }

  let { customerId, productCode, upholstery, frameCount } =
    window.cylindoConfig;
  frameCount = frameCount - 1; // drop duplicate last frame

  let currentFrame = 1;
  let spinning = true;

  // Zoom config
  let zoomEnabled = false;
  const normalSize = window.innerWidth > 1024 ? 800 : 444;
  const zoomSize = window.innerWidth > 1024 ? 1600 : 1100;

  // Lazy high-res storage
  const framesHigh = [];

  // Drag/inertia tuning
  const dragSensitivity = 40;
  const friction = 0.97;

  // Inertia state
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let isHorizontalDrag = false;
  let rafId = null;
  let frameAccumulator = 0;
  let inertiaVelocity = 0;

  // ----------------------------
  // Frame URL helper
  // ----------------------------
  function frameUrl(idx, size = normalSize) {
    return `https://content.cylindo.com/api/v2/${customerId}/products/${productCode}/frames/${idx}/${productCode}.webp?size=${size}&feature=UPHOLSTERY:${encodeURIComponent(
      upholstery
    )}`;
  }

  const wrap1 = (idx) => ((idx - 1 + frameCount) % frameCount) + 1;

  // ----------------------------
  // Show frame
  // ----------------------------
  const showFrame = (idx, forceReload = false) => {
    currentFrame = wrap1(idx);
    const size = zoomEnabled ? zoomSize : normalSize;
    const url = frameUrl(currentFrame, size);

    if (zoomEnabled && !framesHigh[currentFrame]) {
      framesHigh[currentFrame] = url; // cache high-res
    }

    if (forceReload || mainImage.src !== url) {
      mainImage.src = url;
    }
  };

  // ----------------------------
  // Preload lightweight frames
  // ----------------------------
  for (let i = 1; i <= frameCount; i++) {
    const url = frameUrl(i, normalSize);
    const preload = new Image();
    preload.decoding = "async";
    preload.loading = "eager";
    preload.src = url;
  }
  console.log("[INIT] Preloaded", frameCount, "frames");

  // ----------------------------
  // Zoom button
  // ----------------------------
  const zoomBtn = document.createElement("button");
  zoomBtn.id = "zoom-btn";
  zoomBtn.innerText = "🔍 Zoom";
  zoomBtn.style.position = "absolute";
  zoomBtn.style.top = "10px";
  zoomBtn.style.right = "10px";
  zoomBtn.style.zIndex = "10";
  zoomBtn.style.padding = "6px 10px";
  zoomBtn.style.background = "#fff";
  zoomBtn.style.border = "1px solid #ccc";
  zoomBtn.style.borderRadius = "4px";
  zoomBtn.style.cursor = "pointer";
  zoomBtn.style.pointerEvents = "auto";
  mainWrapper.parentElement.appendChild(zoomBtn);

  zoomBtn.addEventListener("click", () => {
    zoomEnabled = !zoomEnabled;
    zoomBtn.innerText = zoomEnabled ? "➖ Exit Zoom" : "🔍 Zoom";

    if (zoomEnabled) {
      mainWrapper.classList.add("zoomed");
      mainImage.style.width = "auto";
      mainImage.style.height = "auto";
      mainImage.style.maxWidth = "none";
      mainImage.style.maxHeight = "none";
      mainImage.draggable = false;

      if (spinning) {
        // Cylindo 360 zoom
        const url = frameUrl(currentFrame, zoomSize);
        mainImage.onload = () => {
          const scrollX = (mainImage.offsetWidth - mainWrapper.clientWidth) / 2;
          const scrollY =
            (mainImage.offsetHeight - mainWrapper.clientHeight) / 2;
          mainWrapper.scrollLeft = scrollX > 0 ? scrollX : 0;
          mainWrapper.scrollTop = scrollY > 0 ? scrollY : 0;
          mainImage.onload = null; // clear handler
        };
        mainImage.src = url;
      } else {
        // Static Shopify image – don’t change src, just center
        const scrollX = (mainImage.offsetWidth - mainWrapper.clientWidth) / 2;
        const scrollY = (mainImage.offsetHeight - mainWrapper.clientHeight) / 2;
        mainWrapper.scrollLeft = scrollX > 0 ? scrollX : 0;
        mainWrapper.scrollTop = scrollY > 0 ? scrollY : 0;
      }
    } else {
      mainWrapper.classList.remove("zoomed");
      mainImage.style.width = "100%";
      mainImage.style.height = "auto";
      mainImage.style.maxWidth = "100%";
      mainImage.style.maxHeight = "100%";
      if (spinning) {
        showFrame(currentFrame, true); // back to normal-res
      }
    }
  });

  function getClientPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      return { x: e.clientX, y: e.clientY };
    }
  }

  // ----------------------------
  // Panning when zoomed
  // ----------------------------
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let scrollStart = { left: 0, top: 0 };

  function startPan(e) {
    if (!zoomEnabled) return;
    const pos = getClientPos(e);
    isPanning = true;
    panStart = pos;
    scrollStart = { left: mainWrapper.scrollLeft, top: mainWrapper.scrollTop };
    mainWrapper.style.cursor = "grabbing";
    e.preventDefault();
  }

  function movePan(e) {
    if (!zoomEnabled || !isPanning) return;
    const pos = getClientPos(e);
    const dx = pos.x - panStart.x;
    const dy = pos.y - panStart.y;
    mainWrapper.scrollLeft = scrollStart.left - dx;
    mainWrapper.scrollTop = scrollStart.top - dy;
  }

  function endPan() {
    if (!zoomEnabled) return;
    isPanning = false;
    mainWrapper.style.cursor = "grab";
  }

  mainWrapper.addEventListener("mousedown", startPan);
  mainWrapper.addEventListener("mousemove", movePan);
  mainWrapper.addEventListener("mouseup", endPan);
  mainWrapper.addEventListener("mouseleave", endPan);

  mainWrapper.addEventListener("touchstart", startPan, { passive: false });
  mainWrapper.addEventListener("touchmove", movePan, { passive: false });
  mainWrapper.addEventListener("touchend", endPan);

  // ----------------------------
  // Thumbnail logic (fixed)
  // ----------------------------
  function setActiveThumb(btn) {
    exitZoom(); // force zoom off whenever user picks a new image

    // Clear all active
    document
      .querySelectorAll("#thumb-bar .cylindo-thumbnail-btn")
      .forEach((el) => el.classList.remove("active"));

    // Mark this one active
    btn.classList.add("active");

    // Prefer img then svg
    const img = btn.querySelector("img.thumb");
    const svg = btn.querySelector("svg.thumb");
    const thumbEl = img || svg;
    if (!thumbEl) return;

    // helper to read dataset values with fallbacks
    const read = (el, name) => {
      if (!el) return null;
      // prefer dataset if present (dataset gives camelCased keys)
      if (
        el.dataset &&
        el.dataset[name] !== undefined &&
        el.dataset[name] !== ""
      ) {
        return el.dataset[name];
      }
      // fallback to attribute
      const attr = el.getAttribute && el.getAttribute("data-" + name);
      return attr !== null ? attr : null;
    };

    // Determine type: element -> button -> default (SVG => cylindo)
    let type =
      read(thumbEl, "type") ||
      read(btn, "type") ||
      (thumbEl.tagName && thumbEl.tagName.toLowerCase() === "svg"
        ? "cylindo"
        : null);

    if (type === "cylindo") {
      // frame may live on the thumb element or the button; default to 1
      const frameStr = read(thumbEl, "frame") || read(btn, "frame") || "1";
      const frame = parseInt(frameStr, 10) || currentFrame;
      currentFrame = frame;
      spinning = true;
      mainWrapper.style.cursor = "grab";
      showFrame(currentFrame, true);
    } else if (type === "shopify") {
      // source may be data-src or src
      const src =
        read(thumbEl, "src") ||
        read(btn, "src") ||
        (thumbEl.src ? thumbEl.src : null) ||
        (btn.querySelector &&
        btn.querySelector("img") &&
        btn.querySelector("img").src
          ? btn.querySelector("img").src
          : null);

      if (src) mainImage.src = src;
      spinning = false;
      mainWrapper.style.cursor = "default";
    }
  }

  // Attach listeners
  document
    .querySelectorAll("#thumb-bar .cylindo-thumbnail-btn")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // stop anchor-like scroll
        setActiveThumb(btn);
      });
    });

  // Set the first thumb active on init
  const firstThumb = document.querySelector(
    "#thumb-bar .cylindo-thumbnail-btn"
  );
  if (firstThumb) setActiveThumb(firstThumb);

  // ----------------------------
  // Drag / Spin
  // ----------------------------
  const onPointerDown = (e) => {
    if (!spinning || zoomEnabled) return;
    isDragging = true;
    isHorizontalDrag = null; // undecided yet
    startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    startY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    if (mainWrapper.setPointerCapture)
      mainWrapper.setPointerCapture(e.pointerId || 0);

    mainWrapper.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    if (!isDragging || !spinning || zoomEnabled) return;

    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    const dx = x - startX;
    const dy = y - startY;

    if (isHorizontalDrag === null) {
      // Decide drag direction after small threshold
      if (Math.abs(dx) > 5) isHorizontalDrag = true;
      else if (Math.abs(dy) > 5) isHorizontalDrag = false;
    }

    if (isHorizontalDrag) {
      e.preventDefault(); // only block vertical scrolling if horizontal drag
      startX = x;

      const deltaFrames = dx / dragSensitivity;
      frameAccumulator += deltaFrames;

      if (Math.abs(frameAccumulator) >= 1) {
        const steps =
          frameAccumulator > 0
            ? Math.floor(frameAccumulator)
            : Math.ceil(frameAccumulator);
        currentFrame = wrap1(currentFrame + steps);
        showFrame(currentFrame);
        frameAccumulator -= steps;
      }
      inertiaVelocity = deltaFrames;
    }
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    if (mainWrapper.releasePointerCapture)
      mainWrapper.releasePointerCapture(e.pointerId || 0);
    mainWrapper.style.cursor = spinning && !zoomEnabled ? "grab" : "default";

    if (isHorizontalDrag && Math.abs(inertiaVelocity) > 0.01 && !zoomEnabled) {
      rafId = requestAnimationFrame(runInertia);
    }
  };

  const runInertia = () => {
    inertiaVelocity *= friction;
    if (Math.abs(inertiaVelocity) < 0.01 && Math.abs(frameAccumulator) < 0.01) {
      rafId = null;
      return;
    }
    frameAccumulator += inertiaVelocity;
    if (Math.abs(frameAccumulator) >= 1) {
      const steps =
        frameAccumulator > 0
          ? Math.floor(frameAccumulator)
          : Math.ceil(frameAccumulator);
      currentFrame = wrap1(currentFrame + steps);
      showFrame(currentFrame);
      frameAccumulator -= steps;
    }
    rafId = requestAnimationFrame(runInertia);
  };

  if (window.PointerEvent) {
    mainWrapper.addEventListener("pointerdown", onPointerDown, {
      passive: false,
    });
    mainWrapper.addEventListener("pointermove", onPointerMove, {
      passive: false,
    });
    mainWrapper.addEventListener("pointerup", onPointerUp);
    mainWrapper.addEventListener("pointerleave", onPointerUp);
    mainWrapper.addEventListener("pointercancel", onPointerUp);
  }

  showFrame(currentFrame);

  // ----------------------------
  // Teaser hand
  // ----------------------------
  const runTeaser = () => {
    if (!spinning) return;
    const hand = document.getElementById("teaser-hand");
    if (!hand) return;

    const deltas = [
      1, 1, 1, 0, 0, -1, -1, -1, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 1, 1,
    ];
    let step = 0;
    let handOffset = 0;

    const animateStep = () => {
      if (step >= deltas.length) {
        hand.style.opacity = "0";
        return;
      }
      currentFrame = wrap1(currentFrame + deltas[step]);
      showFrame(currentFrame);

      handOffset += deltas[step] * 25;
      hand.style.transform = `translateX(calc(-50% + ${handOffset}px))`;

      step++;
      setTimeout(() => requestAnimationFrame(animateStep), 75);
    };

    setTimeout(() => animateStep(), 600);
  };

  mainWrapper.addEventListener("pointerdown", () => {
    const hand = document.getElementById("teaser-hand");
    if (hand) hand.style.display = "none";
  });

  runTeaser();

  // Replace the custom zoom button with the native toggle button
  const nativeZoomBtn = document.querySelector(
    '.product__media-toggle[data-media-id="48386929131807"]'
  );

  if (nativeZoomBtn) {
    nativeZoomBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Check if current active thumbnail is the 360
      const activeThumb = document.querySelector(
        "#thumb-bar .cylindo-thumbnail-btn.active"
      );
      if (activeThumb) {
        // It's the Cylindo 360 - trigger your 360 zoom
        zoomEnabled = !zoomEnabled;
        zoomBtn.click(); // programmatically toggle
      } else {
        // Otherwise let Shopify handle default zoom
        nativeZoomBtn.removeEventListener("click", arguments.callee);
        nativeZoomBtn.click();
      }
    });
  }
}

// ----------------------------
// Bootstrapping
// ----------------------------
function initThumbNav() {
  const thumbBar = document.getElementById("thumb-bar");
  const leftBtn = document.querySelector(".thumb-nav.left");
  const rightBtn = document.querySelector(".thumb-nav.right");
  const thumbs = document.querySelectorAll("#thumb-bar .cylindo-thumbnail-btn");

  if (thumbBar && leftBtn && rightBtn && thumbs.length > 0) {
    function getActiveIndex() {
      return Array.from(thumbs).findIndex((t) =>
        t.classList.contains("active")
      );
    }

    function activateThumb(newIdx) {
      exitZoom(); // ensure zoom is off when nav arrows change image
      if (newIdx < 0) newIdx = thumbs.length - 1;
      if (newIdx >= thumbs.length) newIdx = 0;
      thumbs[newIdx].click();

      // Ensure new thumb is centered in view
      const thumb = thumbs[newIdx];
      const thumbRect = thumb.getBoundingClientRect();
      const barRect = thumbBar.getBoundingClientRect();

      // Check if it's fully visible
      if (thumbRect.left < barRect.left || thumbRect.right > barRect.right) {
        const offset =
          thumb.offsetLeft - thumbBar.clientWidth / 2 + thumb.offsetWidth / 2;
        thumbBar.scrollTo({ left: offset, behavior: "smooth" });
      }
    }

    leftBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = getActiveIndex();
      activateThumb(idx - 1);
    });

    rightBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const idx = getActiveIndex();
      activateThumb(idx + 1);
    });
  }
}

function bootstrap() {
  init360Gallery();
  initThumbNav();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}

document.addEventListener("shopify:section:load", bootstrap);
