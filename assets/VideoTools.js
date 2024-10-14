class VideoTemplate extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector("iframe");
    this.video_tag = this.querySelector("video");
    this.isMouseenter = false;
  }

  loadVideo() {
    if (!this.video && !this.video_tag) return;

    if (this.video) {
      this.dispatchEvent(
        new CustomEvent("loadingStart", {
          detail: { element: this.video, parent: this },
        })
      );
      this.video.setAttribute("src", this.video.getAttribute("data-src"));
      this.video.addEventListener(
        "load",
        function () {
          this.dispatchEvent(
            new CustomEvent("loadingEnd", {
              detail: { element: this.video, parent: this },
            })
          );
          this.dataVideoType == "youtube" &&
            this.video.contentWindow.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              "*"
            );
        }.bind(this)
      );

      this.isLoaded(true);
    }

    if (this.video_tag) {
      this.video_tag.play();
    }
  }

  init() {
    if (this.dataset.autoplay === "true") {
      if (Shopify.designMode) {
        this.loadVideo();
      } else {
        ["mouseenter", "touchstart"].forEach(
          function (e) {
            document.body.addEventListener(
              e,
              function () {
                this.isMouseenter || this.loadVideo();
                this.isMouseenter = true;
              }.bind(this)
            );
          }.bind(this)
        );

        window.addEventListener(
          "scroll",
          function () {
            this.isMouseenter || this.loadVideo();
            this.isMouseenter = true;
          }.bind(this),
          false
        );
      }
    } else {
      this.isMouseenter = true;
    }
  }

  isLoaded(load) {
    if (load) {
      this.setAttribute("loaded", true);
      this.querySelectorAll("img, svg").forEach((element) => element.remove());
    } else {
      this.removeAttribute("loaded");
    }
  }

  static get observedAttributes() {
    return ["data-video-type", "data-video-id"];
  }

  set dataVideoType(type) {
    this.setAttribute("data-video-type", type);
  }

  get dataVideoType() {
    return this.getAttribute("data-video-type");
  }

  set dataVideoId(id) {
    this.setAttribute("data-video-id", id);
  }

  get dataVideoId() {
    return this.getAttribute("data-video-id");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    oldValue !== newValue && this.init();
  }

  connectedCallback() {
    this.init();
    
    // Ensure video_tag exists before querying for the <img> inside it
    if (this.video_tag) {
      const imgElement = this.video_tag.querySelector("img");
      if (imgElement) {
        imgElement.setAttribute("loading", "lazy");
      }
    }
  }
}

customElements.define("video-template", VideoTemplate);

class VideoTemplateOpener extends HTMLElement {
  constructor() {
    super();
    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const video = document.querySelector(this.getAttribute("data-video"));
      if (video) video.loadVideo();
      button.parentElement.classList.add("hidden");
    });
  }
}

customElements.define("video-template-opener", VideoTemplateOpener);
