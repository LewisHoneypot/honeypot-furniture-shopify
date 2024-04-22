class RecentlyPurchased extends HTMLElement {
    constructor() {
        super();
        let checkOrder = 0;
        this.time = this.dataset.time*1000;
        this.section = this.closest('.shopify-section');
        this.items = this.querySelectorAll('.recently-purchased__item');
        this.querySelector('.recently-purchased__close').addEventListener('click', this.hide.bind(this));

        if(this.items.length > 0) {
            setTimeout(() => {
            this.section.classList.remove('d-none');
            this.random(checkOrder);
            }, this.time);
        }
    }

    random(checkOrder) {
        const order = Math.floor(Math.random() * this.items.length);

        if (order == checkOrder) {
            this.random(checkOrder);
        } else {
            checkOrder = order;
            this.items.forEach(element => {element.classList.add('d-none')});
            this.items[order].classList.remove('d-none');
            if (this.matches('.rp-to-bottom')) this.show();
            setTimeout(() => {this.hide()}, this.time);
            setTimeout(() => {this.random(checkOrder)}, this.time*2);
        }
    }

    show() {
        this.classList.remove('rp-to-bottom');
        this.classList.add('rp-to-left');
    }

    hide() {
        this.classList.remove('rp-to-left');
        this.classList.add('rp-to-bottom');
    }
}
customElements.define('recently-purchased', RecentlyPurchased);