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
