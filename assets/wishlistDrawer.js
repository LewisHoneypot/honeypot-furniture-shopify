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
