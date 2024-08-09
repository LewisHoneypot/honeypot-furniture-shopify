// TrustPilot Reviews

// Function to run your main code
function initializeTrustPilot() {
  var $j = jQuery.noConflict();

  var productRangeArray = [];
  var trustpilot_skus_array = [];

  // console.log('productRangeArray', productRangeArray);
  // console.log('trustpilot_skus_array', trustpilot_skus_array);

  // check if live or staging
  var environment = "";
  if (
    window.location.href.indexOf("localhost:3") > -1 ||
    window.location.href.indexOf("honeypotfurnitureimages") > -1
  ) {
    var environment = "staging";
  } else {
    var environment = "live";
  }

  const phpEndpoint =
    "https://honeypot-trade.co.uk/" +
    environment +
    "/trustpilot/product-reviews.php";

  var productId = productSku;

  // console.log('phpEndpoint', phpEndpoint);
  // console.log('productId', productId);

  // Trustpilot Product Reviews

  // add current product to full range
  productRangeArray.push(productSku);
  // add current product to full range
  trustpilot_skus_array.push(trustpilot_skus);

  // console.log('productRangeArray', productRangeArray);
  // console.log('trustpilot_skus_array', trustpilot_skus_array);
  // console.log('trustpilot_skus', trustpilot_skus);

  // convert array to string for url
  var productRangeArrayString = productRangeArray.toString();
  var trustpilot_skus_array_string = trustpilot_skus_array.toString();

  // console.log('productRangeArrayString', productRangeArrayString)
  // console.log('trustpilot_skus_array_string', trustpilot_skus_array_string)

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
    // console.log('productRequest', $productRequest);
  } else {
    $productRequest = urlCurrentProductWithFullRangeTrustPilot;
    // console.log('productRequest', $productRequest);
  }

  // GET request reviews
  fetch($productRequest)
    .then((response) => response.json())
    .then((data) => {
      // Target the element with the ID "reviews"
      var reviewsContainer = $j("#reviews");

      // Check if the target element exists
      if (reviewsContainer.length === 0) {
        console.error('Element with id="reviews" not found.');
        // return; // Stop execution if the target element is not found
      }

      // Create the outermost div
      var outerDiv = $j("<div>")
        .attr("id", "outerDiv")
        .appendTo(reviewsContainer);

      if (Array.isArray(data.productReviews)) {
        // If productReviews is an array (array of reviews)
        data.productReviews.forEach((review, i) => {
          var innerDiv = $j("<div>").addClass("innerDiv").appendTo(outerDiv);
          var reviewWrapper = $j("<div>")
            .addClass("review-wrapper row mt-5")
            .appendTo(innerDiv);
          var reviewSection = $j("<div>")
            .addClass("reviewSection pb-sm-3 col-12 col-lg-7 order-1")
            .appendTo(reviewWrapper);
          var reviewSectionHeader = $j("<div>")
            .addClass("reviewSectionHeader pb-sm-3 d-inline-flex")
            .appendTo(reviewSection);
          var attributeSection = $j("<div>")
            .addClass(
              "attribute-section col-12 col-lg-5 order-2 pr-lg-0 pb-5 mt-5"
            )
            .appendTo(reviewWrapper);
          var attributeSectionWrapper = $j("<div>")
            .addClass("attributeSectionWrapper col-12 p-0")
            .appendTo(attributeSection);
          var attributeNames = $j("<div>")
            .addClass("col-4 p-0 attributeNames")
            .appendTo(attributeSectionWrapper);
          var attributeStars = $j("<div>")
            .addClass("col-8 p-0 attributeStars text-right text-lg-left")
            .appendTo(attributeSectionWrapper);
          var userIcon = $j("<div>")
            .addClass("userIcon userIcon pt-2")
            .appendTo(reviewSectionHeader);
          var customerInfo = $j("<div>")
            .addClass("customerInfo pl-2")
            .appendTo(reviewSectionHeader);

          // Check if review.consumer.createdAt exists and is a string
          if (review.createdAt && typeof review.createdAt === "string") {
            // Remove milliseconds and parse the date
            var dateStringWithoutMilliseconds =
              review.createdAt.split(".")[0] + "Z";
            var reviewDate = new Date(dateStringWithoutMilliseconds);
            var formattedDate = reviewDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            userIcon.html(
              `<img src="//honeypot-furniture.myshopify.com/cdn/shop/files/user-72x72.webp" class="pb-1" height="24" width="24">`
            );
            customerInfo.append(
              $j('<span class="p-0">').html(
                `<strong> ${review.consumer.displayName}</strong>` +
                ", " +
                formattedDate
              )
            );
          } else {
            console.error(
              "Invalid or missing review date:",
              review.consumer.createdAt
            );
          }
          customerInfo.append(
            $j('<span class="d-block mb-2">')
              .html(getReviewTrustpilotImage(review.stars, review.stars))
              .append($j("<br>"))
          );
          reviewSection.append(
            $j('<p class="d-block mb-0 py-2">')
              .text('"' + review.content.trim() + '"')
              .append($j("<br>"))
          );

          if (review.attachments) {
            review.attachments.forEach((attachment, i) => {
              attachment.processedFiles.forEach((processedFiles, i) => {
                if (processedFiles.mimeType == "video/mp4") {
                  reviewSection.append(
                    $j('<span class="d-block">').html(
                      '<video src="' + processedFiles.url + '" controls>'
                    )
                  );
                }
                if (processedFiles.dimension == "360pxWide") {
                  reviewSection.append(
                    $j('<span class="d-block">').html(
                      '<img src="' + processedFiles.url + '" loading="lazy">'
                    )
                  );
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

            reviewSection.append(
              $j('<span class="customerInfo d-block ml-3 mt-3">')
                .html(
                  `<img src="//honeypot-furniture.myshopify.com/cdn/shop/files/bee-32x32.png" class="pb-1" height="24" width="24"> <strong>Honeypot Furniture</strong>` +
                  ", " +
                  formattedDate
                )
                .append($j("<br>"))
            );
            reviewSection.append(
              $j('<p class="ml-3 mb-0 py-2">')
                .text('"' + review.firstCompanyComment.comment.trim() + '"')
                .append($j("<br>"))
            );
          }

          // Display Trustpilot image for each attribute rating
          review.attributeRatings.forEach((attribute) => {
            var roundedRating = Math.round(attribute.rating * 2) / 2; // Round to the nearest 0.5
            var trustpilotImage = getReviewTrustpilotImage(
              roundedRating,
              roundedRating
            );

            if (attribute.attributeName == "Value for money") {
              attribute.attributeName = "Value";
            }

            attributeNames
              .append(
                $j("<span>").html(
                  `<strong>${attribute.attributeName}:</strong>`
                )
              )
              .append($j("<br>"));
            attributeStars
              .append($j("<span>").html(`${trustpilotImage}`))
              .append($j("<br>"));
          });

          // Create a button to toggle additional content
          var buttonWrapper = $j("<div>").addClass(
            "buttonWrapper text-center pt-4 px-4 d-lg-none field__action contact__button pos-relative m-t m-b grid__item"
          );
          reviewSection.append(buttonWrapper);

          var toggleButton = $j("<button>").addClass(
            "button button--style-" +
            button_style +
            " mi-w color-" +
            primary_button_color_scheme +
            ""
          );
          buttonWrapper.append(toggleButton);

          var buttonSpan = $j("<span>")
            .addClass("text")
            .text(primary_button_label);
          toggleButton.append(buttonSpan);

          // Additional content to toggle (e.g., more details about the review)
          var additionalContent = $j("<div>")
            .addClass("additional-content d-lg-block")
            .hide();
          attributeSection.append(additionalContent);

          // Move attribute-section div into additional content
          attributeSectionWrapper.appendTo(additionalContent);

          // Toggle button click event
          toggleButton.on("click", function () {
            // Toggle visibility of additional content
            additionalContent.toggle();
            // Change button text based on visibility
            if (additionalContent.is(":visible")) {
              buttonSpan.text("Hide Breakdown");
            } else {
              buttonSpan.text("Rating Breakdown");
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

  // Function to get Trustpilot image based on rating
  function getReviewTrustpilotImage(rating, roundedRatingImage) {
  var outOf= "";
    if (rating == "NaN") {
      $j(".trustpilot-mini-widget").addClass("d-none");
    } else {
      var imageUrl =
        "//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_" +
        roundedRatingImage +
        ".png"; // Provide the URL for the Trustpilot image corresponding to the rating

      outOf = window.matchMedia('(max-width: 750px)').matches ? "/" : "out of"; // 20px for mobile, 50px for desktop
    }
    // Return an image tag
    return `<img src="${imageUrl}" class="stars-image" alt="Trustpilot Rating" height="24" width="128"><span> ${rating} ${outOf} 5</span>`;
  }

  // Function to get Trustpilot image based on rating
  function getTrustpilotAnchorImage(rating, roundedRatingImage) {
    if (rating == "NaN") {
      $j(".trustpilot-mini-widget").addClass("d-none");
    } else {
      var imageUrl =
        "//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_" +
        roundedRatingImage +
        ".png"; // Provide the URL for the Trustpilot image corresponding to the rating

      // Return an image tag
      return `<img src="${imageUrl}" class="stars-image" alt="Trustpilot Rating" height="24" width="128">`;
    }
  }

  ////////////////////// AVERAGE RATINGS
  // Set up the URL for the request
  const urlCurrentProductRange = `${phpEndpoint}?type=batch-summaries`;

  // console.log('urlCurrentProductRange', urlCurrentProductRange);

  // Target the element with the class "trustpilot-mini-widget"
  var trustPilotContainer = $j(".trustpilot-mini-widget");

  var skuList = trustpilot_skus_array;

  // console.log('trustpilot_skus_array', trustpilot_skus_array);
  // console.log('skuList', skuList);

  // Prepare data for POST request
  var postData = {
    skus: trustpilot_skus,
  };

  // console.log('postData', postData);

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
      // console.log(data);
      // create div
      var outerDiv = $j('<div class="main-trustpilot">').appendTo(
        trustPilotContainer
      );

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
        if (amountOfReviews == 0) {
          $j("[id*='trustpilot_product_reviews_collapsible']").hide();
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
      var reviewsLink = $j(
        '<div></div>'
      ).append(
        $(
          "<span style='min-height:24px;'>" +
            trustpilotImage +
            '<span class="ammount-of-reviews"> ' +
            amountOfReviews +
            ' Reviews</span> <span class="tp-widget-readmore-arrow" id="readMoreArrow"></span>'
          )
        );

        if (amountOfReviews == "0") {
          // j(".reviews-accordion").css("display", "none");
          $j(".trustpilot-mini-widget").removeClass("d-lg-block");
          $j(".trustpilot-mini-widget").addClass("d-lg-none");
        }

        var toolTip = $j('<span class="tooltip-content"></span>');
        var toolTipHeader = $j(
          '<div class="tooltip-header col-12 px-0 pt-1 pb-3"></div>'
        );
        var toolTipHeaderText = $j(
          "<div>Rated " + outOfFive + " out of 5 stars</div>"
        );

        // score rows
        var toolTipFiveStar = $j(
          '<div class="row"><div class="col-3 py-1">5 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          fiveStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfFiveStarReviews +
          ")</div></div>"
        );
        var toolTipFourStar = $j(
          '<div class="row"><div class="col-3 py-1">4 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          fourStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfFourStarReviews +
          ")</div></span>"
        );
        var toolTipThreeStar = $j(
          '<div class="row"><div class="col-3 py-1">3 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          threeStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfThreeStarReviews +
          ")</div></span>"
        );
        var toolTipTwoStar = $j(
          '<div class="row"><div class="col-3 py-1">2 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          twoStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfTwoStarReviews +
          ")</div></span>"
        );
        var toolTipOneStar = $j(
          '<div class="row"><div class="col-3 py-1">1 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          oneStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfOneStarReviews +
          ")</div></span>"
        );

        reviewsLink.append(toolTip);
        toolTip.append(toolTipHeader);
        toolTipHeader.append(toolTipHeaderText);
        toolTip.append(toolTipFiveStar);
        toolTip.append(toolTipFourStar);
        toolTip.append(toolTipThreeStar);
        toolTip.append(toolTipTwoStar);
        toolTip.append(toolTipOneStar);

        // Append the anchor link to the outer div
        outerDiv.append(reviewsLink);
      }
    })
    .catch((error) => {
      console.error("Error fetching data from Trustpilot API:", error);
    });
}

// Wait until jQuery is loaded
function waitForJQuery() {
  if (window.jQuery) {
    initializeTrustPilot();
  } else {
    setTimeout(waitForJQuery, 50);
  }
}

// Start checking for jQuery
waitForJQuery();
