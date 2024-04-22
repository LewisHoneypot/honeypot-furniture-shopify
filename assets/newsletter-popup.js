class NewsletterPopup extends HTMLElement {
    constructor() {
    super();
    this.cookieName = 'newsletter-popup';
    this.timeToShow = parseInt(this.getAttribute('data-delay'));
    this.expiresDate = this.getAttribute('data-expire');

    if (this.querySelector('.form__message')) {
        this.closest(`.drawer`).classList.add('active');
        window.localStorage.getItem(this.storageName);
    }

    this.querySelector('[id^="Drawer-Overlay-"]')?.addEventListener('click', this.setClosePopup.bind(this));
    this.querySelector('.newsletter__drawer-close')?.addEventListener('click', this.setClosePopup.bind(this));

    this.load();
    }

    load() {
        if (this.getCookie(this.cookieName) === '') {
            if (Shopify.designMode && localStorage.getItem(this.cookieName) === 'closed') return;
                setTimeout(() => {
                this.closest(`.drawer`).classList.add('active');
                window.localStorage.getItem(this.storageName);
            }, this.timeToShow);
            localStorage.removeItem(this.cookieName);
        }
    }

    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
    }

    getCookie(cname) {
    const name = cname + '=';
    const ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }

    return '';
    }

    deleteCookie(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    setClosePopup() {
        this.setCookie(this.cookieName, 'closed', this.expiresDate);
        this.closest(`.drawer`).classList.remove('active');
        if (Shopify.designMode) localStorage.setItem(this.cookieName, 'closed');
    }
}
customElements.define('newsletter-popup', NewsletterPopup);