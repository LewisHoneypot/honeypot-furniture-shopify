class CountDown extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.d = new Date(this.dataset.countdown).getTime();
    this.t = this.dataset.type;

    this.createObserver();
  }

  init(time, type) {
    var countdown = setInterval(() => {
      let now = new Date().getTime();
      let distance = time - now;

      if (distance < 0) {
        clearInterval(countdown);
        this.remove();
      } else {
        let day = Math.floor(distance / (1000 * 60 * 60 * 24)),
          hour = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          second = Math.floor((distance % (1000 * 60)) / 1000),
          content;

        if (type == "banner") {
          content = `<span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${day}</span><span class="d-block text uppercase">${window.countdown.day}</span></span>\
              <span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${hour}</span><span class="d-block text uppercase">${window.countdown.hour}</span></span>\
              <span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${minute}</span><span class="d-block text uppercase">${window.countdown.min}</span></span>\
              <span class="item d-inline-block v-a-top left w-auto"><span class="d-block num">${second}</span><span class="d-block text uppercase">${window.countdown.sec}</span></span>`;

          this.querySelector(".countdown").innerHTML = content;
          this.parentElement.classList.remove("hidden");
        } else if (type == "dots") {
          content = `<span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${day}</span><span class="d-block text uppercase f-normal">${window.countdown.day}s</span></span><span class="devide">:</span>\
            <span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${hour}</span><span class="d-block text uppercase f-normal">${window.countdown.hour}s</span></span><span class="devide">:</span>\
            <span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${minute}</span><span class="d-block text uppercase f-normal">${window.countdown.min}utes</span></span><span class="devide">:</span>\
            <span class="item d-inline-block v-a-top left w-auto center"><span class="d-block num">${second}</span><span class="d-block text uppercase f-normal">${window.countdown.sec}conds</span></span>`;
          this.querySelector(".countdown").innerHTML = content;
          this.parentElement.classList.remove("hidden");
        } else {
          content = `<span class="num">${day}</span><span class="text">${window.countdown.day},</span>\
              <span class="num">${hour}</span><span class="text"> : </span>\
              <span class="num">${minute}</span><span class="text"> : </span>\
              <span class="num">${second}`;

          this.querySelector(".countdown").innerHTML = content;
          this.parentElement.classList.remove("hidden");
        }
      }
    }, 1000);
  }

  createObserver() {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          this.init(this.d, this.t);
          observer.unobserve(this);
        });
      },
      { rootMargin: "0px 0px -200px 0px" }
    );

    observer.observe(this);
  }
}
customElements.define("count-down", CountDown);
