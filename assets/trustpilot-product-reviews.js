// TrustPilot Reviews

// Helper function to create and append elements
function createElement(type, classNames = [], attributes = {}, innerHTML = "") {
  const element = document.createElement(type);
  classNames.forEach((className) => element.classList.add(className));
  Object.keys(attributes).forEach((attr) =>
    element.setAttribute(attr, attributes[attr])
  );
  element.innerHTML = innerHTML;
  return element;
}

// Function to run your main code
function initializeTrustPilot() {
  var productRangeArray = [productSku];
  var trustpilot_skus_array = [trustpilot_skus];

  var environment = "live";
  const phpEndpoint = `https://honeypot-trade.co.uk/${environment}/trustpilot/product-reviews.php`;

  var productId = productSku;

  // Trustpilot Product Reviews

  // add current product to full range
  productRangeArray.push(productSku);
  // add current product to full range
  trustpilot_skus_array.push(trustpilot_skus);

  // convert array to string for url
  var productRangeArrayString = productRangeArray.toString();
  var trustpilot_skus_array_string = trustpilot_skus_array.toString();

  // Set up the URLs for the requests
  // current product only
  const urlCurrentProduct = `${phpEndpoint}?type=reviews&sku=${productId}&perPage=100`;
  // current product with full range
  const urlCurrentProductWithFullRange = `${phpEndpoint}?type=reviews&sku=${productRangeArrayString}&perPage=100`;
  // current product with full range
  const urlCurrentProductWithFullRangeTrustPilot = `${phpEndpoint}?type=reviews&sku=${trustpilot_skus_array_string}&perPage=100`;

  // choose whether to use single product or product range
  var $productRequest = "";

  if (!trustpilot_skus_array_string) {
    $productRequest = urlCurrentProduct;
  } else {
    $productRequest = urlCurrentProductWithFullRangeTrustPilot;
  }

  var i = 1;

  // GET request reviews
  fetch($productRequest)
    .then((response) => response.json())
    .then((data) => {
      // Target the element with the ID "reviews"
      var reviewsContainer = document.querySelector("#reviews");

      // Check if the target element exists
      if (!reviewsContainer) {
        console.error('Element with id="reviews" not found.');
        return;
      }

      // Create the outermost div
      var outerDiv = createElement("div", ["outerDiv"]);
      reviewsContainer.appendChild(outerDiv);

      if (Array.isArray(data.productReviews)) {
        // If productReviews is an array (array of reviews)
        data.productReviews.forEach((review, i) => {
          var innerDiv = createElement("div", ["innerDiv"]);
          outerDiv.appendChild(innerDiv);

          var reviewWrapper = createElement("div", [
            "review-wrapper",
            "row",
            "mt-5",
          ]);
          innerDiv.appendChild(reviewWrapper);

          var reviewSection = createElement("div", [
            "reviewSection",
            "pb-sm-3",
            "col-12",
            "col-lg-7",
            "order-1",
          ]);
          reviewWrapper.appendChild(reviewSection);

          var attributeSection = createElement("div", [
            "attribute-section",
            "col-12",
            "col-lg-5",
            "order-2",
            "pr-lg-0",
            "pb-5",
            "mt-5",
          ]);
          reviewWrapper.appendChild(attributeSection);

          var attributeSectionWrapper = createElement("div", [
            "attributeSectionWrapper",
            "col-12",
            "p-0",
          ]);
          attributeSection.appendChild(attributeSectionWrapper);

          var attributeNames = createElement("div", [
            "col-4",
            "p-0",
            "attributeNames",
          ]);
          attributeSectionWrapper.appendChild(attributeNames);

          var attributeStars = createElement("div", [
            "col-8",
            "p-0",
            "attributeStars",
            "text-right",
            "text-lg-left",
          ]);
          attributeSectionWrapper.appendChild(attributeStars);

          var reviewSectionHeader = createElement("div", [
            "reviewSectionHeader",
            "pb-sm-3",
            "d-inline-flex",
          ]);
          reviewSection.appendChild(reviewSectionHeader);

          var userIcon = createElement("div", ["userIcon", "pt-2"]);
          reviewSectionHeader.appendChild(userIcon);

          var customerInfo = createElement("div", ["customerInfo", "pl-2"]);
          reviewSectionHeader.appendChild(customerInfo);

          // Check if review.createdAt exists and is a string
          if (review.createdAt && typeof review.createdAt === "string") {
            // Use Date's built-in parsing for better handling of various date formats
            var reviewDate = new Date(review.createdAt);

            // Only proceed if the date is valid
            if (!isNaN(reviewDate.getTime())) {
              var formattedDate = reviewDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              var userIconImage = createElement("img", [], {
                src: "//honeypot-furniture.myshopify.com/cdn/shop/files/user-72x72.webp",
                class: "pb-1",
                height: 24,
                width: 24,
                loading: "lazy",
              });

              userIcon.appendChild(userIconImage);

              var customerInfoSpan = createElement(
                "span",
                ["p-0"],
                {},
                `<strong>${review.consumer.displayName}</strong>, ${formattedDate}`
              );
              customerInfo.appendChild(customerInfoSpan);
            } else {
              console.error("Invalid date format:", review.createdAt);
            }
          } else {
            console.error("Invalid or missing review date:", review.createdAt);
          }

          var trustpilotImageSpan = createElement(
            "span",
            ["d-block", "mb-2"],
            {},
            getReviewTrustpilotImage(review.stars)
          );
          customerInfo.appendChild(trustpilotImageSpan);

          var reviewContentParagraph = createElement(
            "p",
            ["d-block", "mb-0", "py-2"],
            {},
            `"${review.content.trim()}"`
          );
          reviewSection.appendChild(reviewContentParagraph);

          if (review.attachments) {
            review.attachments.forEach((attachment) => {
              attachment.processedFiles.forEach((processedFiles) => {
                if (processedFiles.mimeType === "video/mp4") {
                  // Create and append video element with Intersection Observer for lazy loading
                  var videoSpan = createElement("span", ["d-block"]);
                  var video = createElement("video", [], {
                    "data-src": processedFiles.url,
                    controls: true,
                    height: 360,
                    width: 640,
                    alt: `customer-video-${i}`,
                    poster: "//example.com/path/to/placeholder-image.jpg",
                  });

                  videoSpan.appendChild(video);
                  reviewSection.appendChild(videoSpan);

                  // Video Observer setup
                  var observer = new IntersectionObserver(
                    (entries, observer) => {
                      entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                          var video = entry.target;
                          video.src = video.dataset.src;
                          observer.unobserve(video);
                        }
                      });
                    },
                    { rootMargin: "0px", threshold: 0.1 }
                  );

                  observer.observe(video);
                  i++;
                }

                if (processedFiles.dimension === "360pxWide") {
                  // Create and append image element with lazy loading
                  var imageSpan = createElement("span", ["d-block"]);
                  var img = createElement("img", [], {
                    src: processedFiles.url,
                    loading: "lazy",
                    height: 360,
                    width: 640,
                    alt: `customer-photo-${i}`,
                  });
                  imageSpan.appendChild(img);
                  reviewSection.appendChild(imageSpan);
                  i++;
                }
              });
            });
          } else {
            console.log("No processedFiles");
          }

          // if honeypot replied
          if (review.firstCompanyComment) {
            var dateStringWithoutMilliseconds =
              review.firstCompanyComment.createdAt.split(".")[0] + "Z";
            var reviewDate = new Date(dateStringWithoutMilliseconds);
            var formattedDate = reviewDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            // Create and append the customer info span
            var customerInfoSpan = createElement(
              "span",
              ["customerInfo", "d-block", "ml-3", "mt-3"],
              {},
              `
              <img src="//honeypot-furniture.myshopify.com/cdn/shop/files/bee-32x32.png" class="pb-1" height="24" width="24"> 
              <strong>Honeypot Furniture</strong>, ${formattedDate}
            `
            );

            reviewSection.appendChild(customerInfoSpan);

            var commentParagraph = createElement(
              "p",
              ["ml-3", "mb-0", "py-2"],
              {},
              `"${review.firstCompanyComment.comment.trim()}"`
            );
            reviewSection.appendChild(commentParagraph);
          }

          // Display Trustpilot image for each attribute rating
          review.attributeRatings.forEach((attribute) => {
            var roundedRating = Math.round(attribute.rating * 2) / 2;
            var trustpilotImage = getReviewTrustpilotImage(
              roundedRating,
              roundedRating
            );

            if (attribute.attributeName === "Value for money") {
              attribute.attributeName = "Value";
            }

            var attributeNameSpan = createElement(
              "span",
              [],
              {},
              `<strong>${attribute.attributeName}:</strong>`
            );
            attributeNames.appendChild(attributeNameSpan);

            var lineBreak1 = createElement("br");
            attributeNames.appendChild(lineBreak1);

            var attributeStarsSpan = createElement(
              "span",
              [],
              {},
              trustpilotImage
            );
            attributeStars.appendChild(attributeStarsSpan);

            var lineBreak2 = createElement("br");
            attributeStars.appendChild(lineBreak2);
          });

          // Create a button to toggle additional content
          var buttonWrapper = createElement("div", [
            "buttonWrapper",
            "text-center",
            "pt-4",
            "px-4",
            "d-lg-none",
            "field__action",
            "contact__button",
            "pos-relative",
            "m-t",
            "m-b",
            "grid__item",
          ]);
          reviewSection.appendChild(buttonWrapper);

          var toggleButton = createElement("button", [
            `button`,
            `button--style-${button_style}`,
            `mi-w`,
            `color-${primary_button_color_scheme}`,
          ]);
          buttonWrapper.appendChild(toggleButton);

          var buttonSpan = createElement(
            "span",
            ["text"],
            {},
            primary_button_label
          );
          toggleButton.appendChild(buttonSpan);

          // Additional content to toggle (e.g., more details about the review)
          var additionalContent = createElement("div", ["additional-content", "d-lg-block"], { style: "display: none" });
          attributeSection.appendChild(additionalContent);

          // Move attribute-section div into additional content
          additionalContent.appendChild(attributeSectionWrapper);

          // Toggle button click event
          toggleButton.addEventListener("click", function () {
            // Toggle visibility of additional content
            if (additionalContent.style.display === "none") {
              additionalContent.style.display = "block";
              buttonSpan.textContent = "Hide Breakdown";
            } else {
              additionalContent.style.display = "none";
              buttonSpan.textContent = "Rating Breakdown";
            }
          });
        });
      } else {
        // If productReviews is not an array (handle differently or log an error)
        console.error("productReviews is not an array:", data.productReviews);
      }
    })
    .catch((error) => {
      console.error("Error fetching data from Trustpilot API:", error);
    });

  // Function to get TrustPilot image based on rating
  function getReviewTrustpilotImage(rating) {
    // Ensure rating is a valid number
    if (isNaN(rating) || rating < 0 || rating > 5) {
      document.querySelector(".trustpilot-mini-widget").classList.add("d-none");
      return ""; // No image to return if rating is invalid
    }

    // Map the rating to the appropriate image file
    var roundedRatingImage = rating; // Format rating for image file name
    var imageUrl = `//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_${roundedRatingImage}.png`; // Construct the image URL

    // Determine the display text
    var outOf = window.matchMedia("(max-width: 750px)").matches
      ? "/"
      : "out of"; // Adapt text based on screen size

    // Create image and text elements
    var img = document.createElement("img");
    img.src = imageUrl;
    img.loading = "lazy";
    img.className = "stars-image mr-2";
    img.alt = "Trustpilot Rating";
    img.height = 24;
    img.width = 128;

    var span = document.createElement("span");
    span.textContent = `${rating} ${outOf} 5`;

    // Return the HTML string
    return img.outerHTML + span.outerHTML;
  }

  // Function to get Trustpilot image based on rating
  function getTrustpilotAnchorImage(rating, roundedRatingImage) {
    if (isNaN(rating)) {
      document.querySelector(".trustpilot-mini-widget").classList.add("d-none");
    } else {
      var imageUrl =
        "//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_" +
        roundedRatingImage +
        ".png"; // Provide the URL for the Trustpilot image corresponding to the rating

      // Create an image element
      var img = document.createElement("img");
      img.src = imageUrl;
      img.loading = "lazy";
      img.className = "stars-image";
      img.alt = "Trustpilot Rating";
      img.height = 24;
      img.width = 128;

      // Return the HTML string
      return img.outerHTML;
    }
  }

  ////////////////////// AVERAGE RATINGS
  // Set up the URL for the request
  const urlCurrentProductRange = `${phpEndpoint}?type=batch-summaries`;

  // Target the element with the class "trustpilot-mini-widget"
  var trustPilotContainer = document.querySelector(".trustpilot-mini-widget");

  var skuList = trustpilot_skus_array;

  // Prepare data for POST request
  var postData = {
    skus: trustpilot_skus,
  };

  // GET request
  fetch(urlCurrentProductRange, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer {{ settings.storefront_api.token }}", // use auto-generated token
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      // create div
      var outerDiv = createElement("div", ["main-trustpilot"]);
      trustPilotContainer.appendChild(outerDiv);

      //check for data
      if (Array.isArray(data.summaries)) {
        let totalStars = 0;
        let amountOfOneStarReviews = 0;
        let amountOfTwoStarReviews = 0;
        let amountOfThreeStarReviews = 0;
        let amountOfFourStarReviews = 0;
        let amountOfFiveStarReviews = 0;
        let totalStarsAverage = 0;
        let amountOfReviews = 0;

        data.summaries.forEach((summary, i) => {
          totalStars += summary.starsAverage;
          amountOfReviews += summary.numberOfReviews.total;
          amountOfOneStarReviews += summary.numberOfReviews.oneStar;
          amountOfTwoStarReviews += summary.numberOfReviews.twoStars;
          amountOfThreeStarReviews += summary.numberOfReviews.threeStars;
          amountOfFourStarReviews += summary.numberOfReviews.fourStars;
          amountOfFiveStarReviews += summary.numberOfReviews.fiveStars;
        });

        // hide reviews icon if none exist
        if (amountOfReviews === 0) {
          var elements = document.querySelectorAll(
            "[id*='trustpilot_product_reviews_collapsible']"
          );
          elements.forEach(function (element) {
            element.style.display = "none";
          });
        }

        let totalCombinedReviews =
          amountOfFiveStarReviews +
          amountOfFourStarReviews +
          amountOfThreeStarReviews +
          amountOfTwoStarReviews +
          amountOfOneStarReviews;

        let fiveStarFill =
          (amountOfFiveStarReviews / totalCombinedReviews) * 100;
        let fourStarFill =
          (amountOfFourStarReviews / totalCombinedReviews) * 100;
        let threeStarFill =
          (amountOfThreeStarReviews / totalCombinedReviews) * 100;
        let twoStarFill = (amountOfTwoStarReviews / totalCombinedReviews) * 100;
        let oneStarFill = (amountOfOneStarReviews / totalCombinedReviews) * 100;

        totalStarsAverage = totalStars / data.summaries.length;

        var outOfFive = "";

        // Check if the number is a whole number
        if (totalStarsAverage % 1 === 0) {
          // If it is, convert it to a string without decimal places
          outOfFive = totalStarsAverage.toFixed(0);
        } else {
          // If it's not, keep one decimal place
          outOfFive = totalStarsAverage.toFixed(1);
        }

        totalStarsAverage = totalStarsAverage.toFixed(1);

        var roundedRating = Math.round(totalStarsAverage * 2) / 2; // Round to the nearest 0.5
        var trustpilotImage = getTrustpilotAnchorImage(
          totalStarsAverage,
          roundedRating
        );

        // Create the link with a span inside
        var reviewsLink = document.createElement("div");
        reviewsLink.innerHTML = `
  <span style='min-height:24px;'>
    ${trustpilotImage}
    <span class="ammount-of-reviews"> ${amountOfReviews} Reviews</span>
    <span class="tp-widget-readmore-arrow" id="readMoreArrow"></span>
  </span>
`;

        // Append the reviewsLink to the desired parent element
        // Example: parentElement.appendChild(reviewsLink);

        // Hide the reviews section if amountOfReviews is "0"
        if (amountOfReviews === "0") {
          var trustpilotMiniWidget = document.querySelector(
            ".trustpilot-mini-widget"
          );
          if (trustpilotMiniWidget) {
            trustpilotMiniWidget.classList.remove("d-lg-block");
            trustpilotMiniWidget.classList.add("d-lg-none");
          }
        }

        // Create tooltip elements
        var toolTip = document.createElement("span");
        toolTip.className = "tooltip-content";

        var toolTipHeader = document.createElement("div");
        toolTipHeader.className = "tooltip-header col-12 px-0 pt-1 pb-3";

        var toolTipHeaderText = document.createElement("div");
        toolTipHeaderText.innerHTML = `Rated ${outOfFive} out of 5 stars`;

        // Append the header text to the header
        toolTipHeader.appendChild(toolTipHeaderText);

        // Create and append the score rows
        var createScoreRow = function (stars, fill, amount) {
          var row = document.createElement("div");
          row.className = "row";

          var starLabel = document.createElement("div");
          starLabel.className = "col-3 py-1";
          starLabel.textContent = `${stars} stars`;

          var scoreBarWrapper = document.createElement("div");
          scoreBarWrapper.className = "col-7 py-1";

          var scoreBar = document.createElement("div");
          scoreBar.className = "score-bar mt-2";

          var scoreBarFill = document.createElement("div");
          scoreBarFill.className = "score-bar-fill";
          scoreBarFill.style.width = `${fill}%`;

          scoreBar.appendChild(scoreBarFill);
          scoreBarWrapper.appendChild(scoreBar);

          var amountLabel = document.createElement("div");
          amountLabel.className = "col-2 py-1 px-0";
          amountLabel.textContent = `(${amount})`;

          row.appendChild(starLabel);
          row.appendChild(scoreBarWrapper);
          row.appendChild(amountLabel);

          return row;
        };

        // Create and append each star rating row
        toolTip.appendChild(
          createScoreRow("5", fiveStarFill, amountOfFiveStarReviews)
        );
        toolTip.appendChild(
          createScoreRow("4", fourStarFill, amountOfFourStarReviews)
        );
        toolTip.appendChild(
          createScoreRow("3", threeStarFill, amountOfThreeStarReviews)
        );
        toolTip.appendChild(
          createScoreRow("2", twoStarFill, amountOfTwoStarReviews)
        );
        toolTip.appendChild(
          createScoreRow("1", oneStarFill, amountOfOneStarReviews)
        );

        // Append tooltip header to the tooltip
        toolTip.appendChild(toolTipHeader);

        // Append the tooltip to the reviews link
        reviewsLink.appendChild(toolTip);

        // Append the reviews link to the outer div
        outerDiv.appendChild(reviewsLink);
      }
    })
    .catch((error) => {
      console.error("Error fetching data from Trustpilot API:", error);
    });
}

initializeTrustPilot();
