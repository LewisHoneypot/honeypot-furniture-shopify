class BeforeYouLeave extends HTMLElement {
    constructor() {
        super();
        this.idleTime = 0;
        this.time = Number(this.dataset.time) * 60000;
        this.section = this.closest('.shopify-section');
        this.drawer = this.closest('side-drawer');
        this.closeButton = this.querySelector('.before-you-leave__close');

        let slickInterval = setInterval(() => {
            this.timerIncrement();
        }, this.time);
        
        document.addEventListener('mousemove', this.resetTimer.bind(this));
        document.addEventListener('keydown', this.resetTimer.bind(this));
        document.addEventListener('scroll', this.resetTimer.bind(this));
        this.closeButton.addEventListener('click', this.closeBeforeYouLeave.bind(this));
    }

    resetTimer() {
        this.idleTime = -1;
    }

    timerIncrement() {
        this.idleTime += 1;
        if (this.idleTime < 1 || document.body.classList.contains('before-you-leave__show')) return;
        this.show();
    }

    closeBeforeYouLeave(e) {
        e.preventDefault();
        this.close();
    }
    
    show() {
        this.section.classList.remove('d-none');
        document.body.classList.add('before-you-leave__show', 'o-h');
        setTimeout(() => {this.drawer.classList.add('active')}, 100);
    }

    close() {
        this.drawer.classList.remove('active');
        setTimeout(() => {
            this.section.classList.add('d-none');
            document.body.classList.remove('before-you-leave__show', 'o-h');
        }, 501);
    }
}
customElements.define('before-you-leave', BeforeYouLeave);