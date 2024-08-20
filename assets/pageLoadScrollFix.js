if (!document.querySelector(".header--top-center-special")) {
  document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 1);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);
  });
}
