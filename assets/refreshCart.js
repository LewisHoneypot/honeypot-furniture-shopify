function refreshProtectiondDrawer() {
  // Fetch the current page to update the drawer
  fetch(location.href)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch the page for refreshing the drawer.");
      }
      return response.text();
    })
    .then((html) => {
      const tempDoc = document.createElement("div");
      tempDoc.innerHTML = html;

      // Get the updated drawer content from the fetched HTML
      const newCartDrawer = tempDoc.querySelector(
        "#Drawer-Protection .drawer__wrapper"
      );
      const cartDrawer = document.querySelector(
        "#Drawer-Protection .drawer__wrapper"
      );

      if (cartDrawer && newCartDrawer) {
        cartDrawer.innerHTML = newCartDrawer.innerHTML; // Update the drawer content
      } else {
        console.error("Drawer elements not found.");
      }
    })
    .catch((error) => {
      console.error("Error refreshing the drawer:", error);
    });
}

function refreshCartDrawer() {
  // console.log('protection-drawer refreshCartDrawer');

  fetch("/cart.js")
    .then((response) => response.json())
    .then((cart) => {
      const cartDrawer = document.querySelector("#CartDrawer");

      if (cartDrawer) {
        fetch(location.href)
          .then((response) => response.text())
          .then((html) => {
            const tempDoc = document.createElement("div");
            tempDoc.innerHTML = html;
            const newCartDrawer = tempDoc.querySelector("#CartDrawer");
            if (newCartDrawer) {
              cartDrawer.innerHTML = newCartDrawer.innerHTML;
            }
          });
      }
    });
}

function refreshCartBubble() {
  // console.log('protection-drawer refreshCartBubble');

  fetch("/cart.js")
    .then((response) => response.json())
    .then((cart) => {
      const cartCountBubble = document.querySelector(".cart-count-bubble");

      if (cartCountBubble) {
        fetch(location.href)
          .then((response) => response.text())
          .then((html) => {
            const tempDoc = document.createElement("div");
            tempDoc.innerHTML = html;
            const newCartCountBubble =
              tempDoc.querySelector(".cart-count-bubble");
            if (newCartCountBubble) {
              cartCountBubble.innerHTML = newCartCountBubble.innerHTML;
            }
          });
      }
    });
}

// Create a global theme object with a refreshCart method
window.theme = {
  refreshCart: function () {
    //   console.log('theme.refreshCart started.');
    refreshCartDrawer();
    refreshCartBubble();
    refreshProtectiondDrawer();
    //   console.log('theme.refreshCart completed.');
  },
};
