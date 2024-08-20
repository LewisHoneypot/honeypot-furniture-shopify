class ProductCustomerViewing extends HTMLElement {
  constructor() {
    super();

    const wrapper = document.querySelector(".product__quickview-inner");

    if (wrapper) {
      const numbersViewer = wrapper.getAttribute("data-customer-view"),
        numbersViewerList = JSON.parse("[" + numbersViewer + "]"),
        numbersViewerTime = wrapper.getAttribute("data-customer-view-time"),
        timeViewer = parseInt(numbersViewerTime) * 1000;

      setInterval(function () {
        const numbersViewerItem = Math.floor(
          Math.random() * numbersViewerList.length
        );

        wrapper.querySelector(".text").innerHTML =
          window.customer_view.text.replace(
            "[number]",
            numbersViewerList[numbersViewerItem]
          );
      }, timeViewer);
    }
  }
}
customElements.define("customer-viewing", ProductCustomerViewing);
