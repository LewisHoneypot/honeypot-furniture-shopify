function init360Gallery() {
  const gallery = document.getElementById("pdp-gallery");
  if (!gallery) return;
  console.log("[INIT] Running 360 script");

  const mainWrapper = document.getElementById("main-image-wrapper");
  const mainImage = document.getElementById("main-image");
  const thumbs = document.querySelectorAll("#thumb-bar .thumb");

  if (!window.cylindoConfig) {
    console.error("[Cylindo] window.cylindoConfig not found!");
    return;
  }

  let { customerId, productCode, upholstery, frameCount } =
    window.cylindoConfig;

  // Cylindo exports often duplicate frame 1 at the end → drop it
  frameCount = frameCount - 1;

  const frames = [];
  let currentFrame = 1; // Start at frame 1
  let spinning = true;

  // Tuning
  const dragSensitivity = 30; // px per frame
  const friction = 0.92; // inertia decay per RAF

  // Inertia state
  let isDragging = false;
  let startX = 0;
  let rafId = null;
  let frameAccumulator = 0;
  let inertiaVelocity = 0;

  // Preload frames (1..frameCount)
  for (let i = 1; i <= frameCount; i++) {
    const url = `https://content.cylindo.com/api/v2/${customerId}/products/${productCode}/frames/${i}/${productCode}.webp?size=768&feature=UPHOLSTERY:${encodeURIComponent(
      upholstery
    )}`;
    frames[i] = url;

    const preload = new Image();
    preload.decoding = "async";
    preload.loading = "eager";
    preload.src = url;
  }
  console.log("[INIT] Preloaded", frames.length - 1, "frames");

  // Wrap inside 1..frameCount (no duplicate at the seam)
  const wrap1 = (idx) => ((idx - 1 + frameCount) % frameCount) + 1;

  const showFrame = (idx) => {
    currentFrame = wrap1(idx);
    mainImage.src = frames[currentFrame];
  };

  // Thumbs
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document
        .querySelectorAll("#thumb-bar .cylindo-thumbnail-btn")
        .forEach((btn) => btn.classList.remove("active"));
      const container = thumb.closest(".cylindo-thumbnail-btn");
      if (container) container.classList.add("active");

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      inertiaVelocity = 0;
      frameAccumulator = 0;

      if (thumb.dataset.type === "cylindo") {
        spinning = true;
        showFrame(currentFrame);
        mainWrapper.style.cursor = "grab";
      } else {
        spinning = false;
        mainImage.src = thumb.dataset.src;
        mainWrapper.style.cursor = "default";
      }
    });
  });

  // Drag / Spin
  const onPointerDown = (e) => {
    if (!spinning) return;
    isDragging = true;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    inertiaVelocity = 0;
    frameAccumulator = 0;

    startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    if (mainWrapper.setPointerCapture)
      mainWrapper.setPointerCapture(e.pointerId || 0);
    mainWrapper.style.cursor = "grabbing";
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!isDragging || !spinning) return;

    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const dx = x - startX;
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

    e.preventDefault();
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

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;

    if (mainWrapper.releasePointerCapture)
      mainWrapper.releasePointerCapture(e.pointerId || 0);
    if (spinning) mainWrapper.style.cursor = "grab";

    if (!rafId && Math.abs(inertiaVelocity) > 0.01) {
      rafId = requestAnimationFrame(runInertia);
    }
  };

  // Events
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
  } else {
    mainWrapper.addEventListener("mousedown", onPointerDown, {
      passive: false,
    });
    window.addEventListener("mousemove", onPointerMove, { passive: false });
    window.addEventListener("mouseup", onPointerUp);

    mainWrapper.addEventListener("touchstart", onPointerDown, {
      passive: false,
    });
    mainWrapper.addEventListener("touchmove", onPointerMove, {
      passive: false,
    });
    mainWrapper.addEventListener("touchend", onPointerUp);
    mainWrapper.addEventListener("touchcancel", onPointerUp);
  }

  showFrame(currentFrame);

  // Teaser motion (smooth nudge left and right on load)
  const runTeaser = () => {
    if (!spinning) return;

    // relative frame deltas
    const deltas = [1, 1, 1, 0, 0, -1, -1, -1, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 1, 1];
    let step = 0;

    const animateStep = () => {
      if (step >= deltas.length) return;

      currentFrame = wrap1(currentFrame + deltas[step]);
      showFrame(currentFrame);
      step++;

      setTimeout(() => requestAnimationFrame(animateStep), 75);
    };

    // delay a bit before starting teaser
    setTimeout(() => {
      animateStep();
    }, 600);
  };

  runTeaser();
}

// Run on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init360Gallery);
} else {
  init360Gallery();
}

// Shopify section reload
document.addEventListener("shopify:section:load", init360Gallery);
