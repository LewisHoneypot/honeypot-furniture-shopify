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
