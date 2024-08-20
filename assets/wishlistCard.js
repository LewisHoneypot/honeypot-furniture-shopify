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
