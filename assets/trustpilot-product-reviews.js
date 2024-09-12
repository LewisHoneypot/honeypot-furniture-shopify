// Consolidated TrustPilot Image Helper
function getTrustpilotImage(rating, isAnchorImage = false) {
  if (isNaN(rating) || rating < 0 || rating > 5) return "";

  const roundedRating = Math.round(rating * 2) / 2;
  const imageUrl = `//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_${roundedRating}.png`;
  const isMobile = window.matchMedia("(max-width: 750px)").matches;
  const ratingText = isMobile ? `${rating} / 5` : `${rating} out of 5`;

  return isAnchorImage
    ? `<img src="${imageUrl}" class="stars-image" alt="Trustpilot Rating" height="24" width="128">`
    : `<img src="${imageUrl}" class="stars-image mr-2" alt="Trustpilot Rating" height="24" width="128"><span>${ratingText}</span>`;
}

// Helper function to create and append elements
function createElement(type, classNames = [], attributes = {}, innerHTML = "") {
  const element = document.createElement(type);
  if (classNames.length) element.className = classNames.join(' ');
  Object.assign(element, attributes);
  element.innerHTML = innerHTML;
  return element;
}

// Tooltip Creation Helper
function createScoreRow(stars, fill, amount) {
  return `
    <div class="row">
      <div class="col-3 py-1">${stars} stars</div>
      <div class="col-7 py-1">
        <div class="score-bar mt-2">
          <div class="score-bar-fill" style="width: ${fill}%"></div>
        </div>
      </div>
      <div class="col-2 py-1 px-0">(${amount})</div>
    </div>
  `;
}

// Flag to track whether reviews have been loaded
let reviewsLoaded = false;

// Function to load and display reviews
function loadReviews() {
  if (reviewsLoaded) return; // Skip fetching if reviews are already loaded

  reviewsLoaded = true; // Set flag to prevent further fetching

  const productId = productSku;
  const phpEndpoint = `https://honeypot-trade.co.uk/live/trustpilot/product-reviews.php`;

  const urlCurrentProduct = `${phpEndpoint}?type=reviews&sku=${productId}&perPage=100`;
  const urlCurrentProductWithFullRangeTrustPilot = `${phpEndpoint}?type=reviews&sku=${[trustpilot_skus].toString()}&perPage=100`;

  const productRequest = [trustpilot_skus].length ? urlCurrentProductWithFullRangeTrustPilot : urlCurrentProduct;

  fetch(productRequest)
    .then(response => response.json())
    .then(reviewsData => {
      // Handle reviews data
      const reviewsContainer = document.querySelector("#reviews");
      if (!reviewsContainer) return;

      const outerDiv = createElement("div", ["outerDiv"]);
      reviewsContainer.appendChild(outerDiv);

      reviewsData.productReviews.forEach((review, i) => {
        const reviewDate = new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

        let reviewHTML = `
          <div class="review-wrapper row mt-5">
            <div class="reviewSection pb-sm-3 col-12 col-lg-7 order-1">
              <div class="reviewSectionHeader pb-sm-3 d-inline-flex">
                <div class="userIcon pt-2">
                  <img src="//honeypot-furniture.myshopify.com/cdn/shop/files/user-72x72.webp" class="pb-1" height="24" width="24" loading="lazy">
                </div>
                <div class="customerInfo pl-2">
                  <strong>${review.consumer.displayName}</strong>, ${reviewDate}
                  <span class="d-block mb-2">${getTrustpilotImage(review.stars)}</span>
                </div>
              </div>
              <p class="d-block mb-0 py-2">"${review.content.trim()}"</p>
        `;

        if (review.attachments) {
          review.attachments.forEach(attachment => {
            attachment.processedFiles.forEach(file => {
              if (file.mimeType === "video/mp4") {
                reviewHTML += `
                  <div class="media-wrapper mt-3">
                    <video controls height="360" width="640" poster="//example.com/path/to/placeholder-image.jpg" loading="lazy">
                      <source src="${file.url}" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  </div>
                `;
              } else if (file.dimension === "360pxWide") {
                reviewHTML += `
                  <div class="media-wrapper mt-3">
                    <img src="${file.url}" loading="lazy" height="360" width="640" alt="customer-photo-${i}">
                  </div>
                `;
              }
            });
          });
        }

        if (review.firstCompanyComment) {
          const companyReplyDate = new Date(review.firstCompanyComment.createdAt.split(".")[0] + "Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
          reviewHTML += `
            <div class="company-reply ml-3 mt-3">
              <img src="//honeypot-furniture.myshopify.com/cdn/shop/files/bee-32x32.png" class="pb-1" height="24" width="24">
              <strong>Honeypot Furniture</strong>, ${companyReplyDate}
              <p class="ml-3 mb-0 py-2">"${review.firstCompanyComment.comment.trim()}"</p>
            </div>
          `;
        }

        if (review.attributeRatings && review.attributeRatings.length) {
          const attributeHTML = `
            <div class="row attributeSectionWrapper col-12 p-0">
              <div class="col-4 p-0 attributeNames">
                ${review.attributeRatings.map(attribute => ` 
                  <span><strong>${attribute.attributeName === "Value for money" ? "Value" : attribute.attributeName}:</strong></span><br>
                `).join('')}
              </div>
              <div class="col-8 p-0 attributeStars text-right text-lg-left">
                ${review.attributeRatings.map(attribute => {
                  const roundedRating = Math.round(attribute.rating * 2) / 2;
                  const trustpilotImage = getTrustpilotImage(roundedRating);
                  return `
                    <span>${trustpilotImage}</span><br>
                  `;
                }).join('')}
              </div>
            </div>
          `;

          reviewHTML += `</div>
            <div class="rating-breakdown col-12 col-lg-5 order-2 pr-lg-0 pb-5 mt-5">
              <div class="buttonWrapper text-center pt-4 px-4 d-lg-none field__action contact__button pos-relative m-t m-b grid__item">
                <button class="toggle-button button button--style-diagonal-swipe mi-w color-background-1" data-target="breakdown-${i}">
                  <span class="text">Rating Breakdown</span>
                </button>
              </div>
              <div id="breakdown-${i}" class="additional-content d-none d-lg-block">
                <div class="attribute-section col-12 order-2 pr-lg-0 pb-5 mt-5">
                  ${attributeHTML}
                </div>
              </div>
            </div>
          `;
        }

        reviewHTML += `</div></div>`;
        outerDiv.innerHTML += reviewHTML;
      });

      document.querySelectorAll(".toggle-button").forEach(button => {
        button.addEventListener("click", function () {
          const targetId = this.getAttribute("data-target");
          const content = document.querySelector(`#${targetId}`);
          if (content) {
            content.classList.toggle("d-none");
            this.querySelector(".text").textContent = content.classList.contains("d-none") ? "Rating Breakdown" : "Hide Breakdown";
          }
        });
      });
    })
    .catch(error => console.error("Error fetching data from Trustpilot API:", error));
}

// Function to initialize TrustPilot (including the tooltip button)
function initializeTrustPilot() {
  const productId = productSku;
  const phpEndpoint = `https://honeypot-trade.co.uk/live/trustpilot/product-reviews.php`;

  const urlCurrentProductRange = `${phpEndpoint}?type=batch-summaries`;
  const urlCurrentProduct = `${phpEndpoint}?type=reviews&sku=${productId}&perPage=100`;
  const urlCurrentProductWithFullRangeTrustPilot = `${phpEndpoint}?type=reviews&sku=${[trustpilot_skus].toString()}&perPage=100`;

  // Fetch batch summaries first for the tooltip
  fetch(urlCurrentProductRange, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {{ settings.storefront_api.token }}",
    },
    body: JSON.stringify({ skus: trustpilot_skus })
  })
  .then(response => response.json())
  .then(summariesData => {
    // Handle summaries data (average ratings)
    const trustPilotContainer = document.querySelector(".trustpilot-mini-widget");
    if (!Array.isArray(summariesData.summaries)) return;

    const outerDivSummaries = createElement("div", ["main-trustpilot"]);
    trustPilotContainer.appendChild(outerDivSummaries);

    let totalStars = 0, amountOfReviews = 0;
    const reviewCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    summariesData.summaries.forEach(summary => {
      totalStars += summary.starsAverage;
      amountOfReviews += summary.numberOfReviews.total;
      reviewCounts[1] += summary.numberOfReviews.oneStar;
      reviewCounts[2] += summary.numberOfReviews.twoStars;
      reviewCounts[3] += summary.numberOfReviews.threeStars;
      reviewCounts[4] += summary.numberOfReviews.fourStars;
      reviewCounts[5] += summary.numberOfReviews.fiveStars;
    });

    const totalCombinedReviews = Object.values(reviewCounts).reduce((a, b) => a + b, 0);
    const fills = Object.fromEntries(Object.entries(reviewCounts).map(([stars, count]) => [stars, (count / totalCombinedReviews) * 100]));
    const totalStarsAverage = (totalStars / summariesData.summaries.length).toFixed(1);
    const trustpilotImage = getTrustpilotImage(totalStarsAverage, true);

    const reviewsLink = createElement("div", [], {}, `
      <span style='min-height:24px;'>
        ${trustpilotImage}
        <span class="ammount-of-reviews"> ${amountOfReviews} Reviews</span>
        <span class="tp-widget-readmore-arrow" id="readMoreArrow"></span>
      </span>
    `);

    if (amountOfReviews === 0) {
      trustPilotContainer.classList.replace("d-lg-block", "d-lg-none");
    }

    const toolTip = createElement("span", ["tooltip-content"]);
    const toolTipHeader = createElement("div", ["tooltip-header", "col-12", "px-0", "pt-1", "pb-3"]);
    toolTipHeader.appendChild(createElement("div", [], {}, `Rated ${totalStarsAverage} out of 5 stars`));

    // Iterate in reverse order and include all rows
    [5, 4, 3, 2, 1].forEach(stars => {
      toolTip.innerHTML += createScoreRow(stars, fills[stars] || 0, reviewCounts[stars] || 0);
    });

    toolTip.appendChild(toolTipHeader);
    reviewsLink.appendChild(toolTip);
    outerDivSummaries.appendChild(reviewsLink);

    reviewsLink.addEventListener("click", () => {
      window.scrollTo({ top: document.querySelector("#reviews").offsetTop, behavior: "smooth" });
    });

    // Attach click event listener to the <details> element
    const detailsElement = document.querySelector("details[id*='Details-collapsible_row']");

    if (detailsElement) {
      detailsElement.addEventListener("click", function() {
        // Load reviews only if details element is not open
        if (!this.hasAttribute("open") && !reviewsLoaded) {
          loadReviews();
        }
      });
    } else {
      console.log("Details element not found");
    }

    const reviewsButton = document.querySelector("#reviews-button");
  
    if (reviewsButton) {
      reviewsButton.addEventListener("click", function() {
        // Load reviews if the details element is not open
        if (detailsElement && !detailsElement.hasAttribute("open") && !reviewsLoaded) {
          loadReviews();
        }
      });
    } else {
      console.log("Reviews button not found");
    }
  })
  .catch(error => console.error("Error fetching batch summaries from Trustpilot API:", error));
}

initializeTrustPilot();
