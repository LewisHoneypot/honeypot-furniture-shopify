// TrustPilot Reviews
var moreColoursKlevuArray = [];
var productRangeArray = [];

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

var productSku = "viva_sofabed_grey_2_seater";
var productId = "viva_sofabed_grey_2_seater";

// Trustpilot Product Reviews
// This gets populated by Klevu More Colours widget

// add current product to additional colours products
moreColoursKlevuArray.push(productSku);
// add current product to full range
productRangeArray.push(productSku);

// convert array to string for url
var moreColoursKlevuArrayString = moreColoursKlevuArray.toString();
var productRangeArrayString = productRangeArray.toString();

// Set up the URLs for the requests
// current product only
const urlCurrentProduct = `${phpEndpoint}?type=reviews&sku=${productId}&perPage=100`;
// current product with additional colours
const urlCurrentProductWithColourRange = `${phpEndpoint}?type=reviews&sku=${moreColoursKlevuArrayString}&perPage=100`;
// current product with full range
const urlCurrentProductWithFullRange = `${phpEndpoint}?type=reviews&sku=${productRangeArrayString}&perPage=100`;

// GET request reviews
fetch(urlCurrentProductWithFullRange)
  .then((response) => response.json())
  .then((data) => {
    // console.log('data: ', data)

    // Target the element with the ID "reviews"
    var reviewsContainer = $("#reviews");

    // Check if the target element exists
    if (reviewsContainer.length === 0) {
      console.error('Element with id="reviews" not found.');
      // return; // Stop execution if the target element is not found
    }

    // Create the outermost div
    var outerDiv = $("<div>").attr("id", "outerDiv").appendTo(reviewsContainer);

    if (Array.isArray(data.productReviews)) {
      // If productReviews is an array (array of reviews)
      data.productReviews.forEach((review, i) => {
        var innerDiv = $("<div>").addClass("innerDiv").appendTo(outerDiv);
        var reviewWrapper = $("<div>")
          .addClass("review-wrapper row")
          .appendTo(innerDiv);
        var reviewSection = $("<div>")
          .addClass("reviewSection pb-sm-3 col-12 col-md-7 order-1")
          .appendTo(reviewWrapper);
        var reviewSectionHeader = $("<div>")
          .addClass("reviewSectionHeader pb-sm-3 d-inline-flex")
          .appendTo(reviewSection);
        var attributeSection = $("<div>")
          .addClass("attribute-section col-12 col-md-5 order-2 pr-md-0 pb-5")
          .appendTo(reviewWrapper);
        var attributeSectionWrapper = $("<div>")
          .addClass("attributeSectionWrapper col-12 p-0")
          .appendTo(attributeSection);
        var attributeNames = $("<div>")
          .addClass("col-4 p-0 attributeNames")
          .appendTo(attributeSectionWrapper);
        var attributeStars = $("<div>")
          .addClass("col-8 p-0 attributeStars text-right text-md-left")
          .appendTo(attributeSectionWrapper);
        var userIcon = $("<div>")
          .addClass("userIcon userIcon pt-2")
          .appendTo(reviewSectionHeader);
        var customerInfo = $("<div>")
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
            $('<span class="p-0">').html(
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
          $('<span class="d-block mb-2">')
            .html(getReviewTrustpilotImage(review.stars, review.stars))
            .append($("<br>"))
        );
        reviewSection.append(
          $('<p class="d-block mb-0 py-2">')
            .text('"' + review.content.trim() + '"')
            .append($("<br>"))
        );

        if (review.attachments) {
          review.attachments.forEach((attachment, i) => {
            attachment.processedFiles.forEach((processedFiles, i) => {
              if (processedFiles.mimeType == "video/mp4") {
                reviewSection.append(
                  $('<span class="d-block">').html(
                    '<video src="' + processedFiles.url + '" controls>'
                  )
                );
              }
              if (processedFiles.dimension == "360pxWide") {
                reviewSection.append(
                  $('<span class="d-block">').html(
                    '<img src="' + processedFiles.url + '">'
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
            $('<span class="customerInfo d-block ml-3 mt-3">')
              .html(
                `<img src="//honeypot-furniture.myshopify.com/cdn/shop/files/bee-32x32.png" class="pb-1" height="24" width="24"> <strong>Honeypot Furniture</strong>` +
                  ", " +
                  formattedDate
              )
              .append($("<br>"))
          );
          reviewSection.append(
            $('<p class="ml-3 mb-0 py-2">')
              .text('"' + review.firstCompanyComment.comment.trim() + '"')
              .append($("<br>"))
          );
        }

        // Display Trustpilot image for each attribute rating
        review.attributeRatings.forEach((attribute) => {
          var roundedRating = Math.round(attribute.rating * 2) / 2; // Round to the nearest 0.5
          var trustpilotImage = getReviewTrustpilotImage(
            roundedRating,
            roundedRating
          );

          // console.log('attribute.rating', attribute.rating)
          // console.log('roundedRating', roundedRating)

          attributeNames
            .append(
              $("<span>").html(`<strong>${attribute.attributeName}:</strong>`)
            )
            .append($("<br>"));
          attributeStars
            .append($("<span>").html(`${trustpilotImage}`))
            .append($("<br>"));
        });

        // Create a button to toggle additional content
        var buttonWrapper = $("<div>").addClass(
          "buttonWrapper text-center pt-4 px-4 d-md-none"
        );
        reviewSection.append(buttonWrapper);
        var toggleButton = $("<button>")
          .addClass("toggle-button btn btn-secondary")
          .text("Rating Breakdown");
        buttonWrapper.append(toggleButton);

        // Additional content to toggle (e.g., more details about the review)
        var additionalContent = $("<div>")
          .addClass("additional-content d-md-block")
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
            toggleButton.text("Hide Breakdown");
          } else {
            toggleButton.text("Rating Breakdown");
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
  if (rating == "NaN") {
    $(".trustpilot-widget").addClass("d-none");
  } else {
    var imageUrl =
      "//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_" + roundedRatingImage + ".png"; // Provide the URL for the Trustpilot image corresponding to the rating

    // Return an image tag
    return `<img src="${imageUrl}" class="stars-image" alt="Trustpilot Rating"><span> ${rating} out of 5</span>`;
  }
}

// Function to get Trustpilot image based on rating
function getTrustpilotAnchorImage(rating, roundedRatingImage) {
  if (rating == "NaN") {
    $(".trustpilot-widget").addClass("d-none");
  } else {
    var imageUrl =
      "//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_" + roundedRatingImage + ".png"; // Provide the URL for the Trustpilot image corresponding to the rating

    // Return an image tag
    return `<img src="${imageUrl}" class="stars-image" alt="Trustpilot Rating">`;
  }
}

////////////////////// AVERAGE RATINGS
// Set up the URL for the request
const urlCurrentProductRange = `${phpEndpoint}?type=batch-summaries`;

// Target the element with the class "trustpilot-widget"
var trustPilotContainer = $(".trustpilot-widget");

var rangeType = 2;

if (rangeType === 0) {
  var skuList = moreColoursKlevuArray;
} else if (rangeType === 1) {
  var skuList = moreColoursKlevuArray;
} else if (rangeType === 2) {
  var skuList = productRangeArray;
}
// Prepare data for POST request
var postData = {
  skus: skuList,
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
    var outerDiv = $('<div class="main-trustpilot">').appendTo(
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
        $("#reviews-button2").hide();
        $(".anchor-icons > .row > div:nth-child(2)").hide();
        $(".anchor-icons > .row > div").removeClass("col-4");
        $(".anchor-icons > .row > div").addClass("col-6");
      }

      let totalCombinedReviews =
        amountOfFiveStarReviews +
        amountOfFourStarReviews +
        amountOfThreeStarReviews +
        amountOfTwoStarReviews +
        amountOfOneStarReviews;

      let fiveStarFill = (amountOfFiveStarReviews / totalCombinedReviews) * 100;
      let fourStarFill = (amountOfFourStarReviews / totalCombinedReviews) * 100;
      let threeStarFill =
        (amountOfThreeStarReviews / totalCombinedReviews) * 100;
      let twoStarFill = (amountOfTwoStarReviews / totalCombinedReviews) * 100;
      let oneStarFill = (amountOfOneStarReviews / totalCombinedReviews) * 100;

      // console.log(fiveStarFill.toFixed(0));
      // console.log(fourStarFill.toFixed(0));
      // console.log(threeStarFill.toFixed(0));
      // console.log(twoStarFill.toFixed(0));
      // console.log(oneStarFill.toFixed(0));

      // console.log('data.summaries: ', data.summaries);
      // console.log('amountOfOneStarReviews: ', amountOfOneStarReviews);
      // console.log('amountOfTwoStarReviews: ', amountOfTwoStarReviews);
      // console.log('amountOfThreeStarReviews: ', amountOfThreeStarReviews);
      // console.log('amountOfFourStarReviews: ', amountOfFourStarReviews);
      // console.log('amountOfFiveStarReviews: ', amountOfFiveStarReviews);

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

      // console.log('amountOfReviews: ', amountOfReviews);
      // console.log('totalStars: ', totalStars);
      // console.log('data.summaries.length: ', data.summaries.length);
      // console.log('totalStarsAverage: ', totalStarsAverage);

      var roundedRating = Math.round(totalStarsAverage * 2) / 2; // Round to the nearest 0.5
      var trustpilotImage = getTrustpilotAnchorImage(
        totalStarsAverage,
        roundedRating
      );

      // Select widget div
      var outerDiv = $(".trustpilot-widget"); // Replace with the actual ID or selector of your outer div

      // Create the link with a span inside
      var reviewsLink = $(
        '<a href="#reviews" id="reviews-button" class="trustpilotTooltip"></a>'
      ).append(
        $(
          "<span>" +
            trustpilotImage +
            '<span class="ammount-of-reviews"> ' +
            amountOfReviews +
            ' Reviews</span> <span class="tp-widget-readmore-arrow" id="readMoreArrow"></span>'
        )
      );

      if (amountOfReviews == "0") {
        // $(".reviews-accordion").css("display", "none");
        $(".trustpilot-widget").removeClass("d-lg-block");
        $(".trustpilot-widget").addClass("d-lg-none");
      }

      var toolTip = $('<span class="tooltip-content"></span>');
      var toolTipHeader = $(
        '<div class="tooltip-header col-12 px-0 pt-1 pb-3"></div>'
      );
      var toolTipHeaderText = $(
        "<div>Rated " + outOfFive + " out of 5 stars</div>"
      );

      // score rows
      var toolTipFiveStar = $(
        '<div class="row"><div class="col-3 py-1">5 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          fiveStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfFiveStarReviews +
          ")</div></div>"
      );
      var toolTipFourStar = $(
        '<div class="row"><div class="col-3 py-1">4 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          fourStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfFourStarReviews +
          ")</div></span>"
      );
      var toolTipThreeStar = $(
        '<div class="row"><div class="col-3 py-1">3 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          threeStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfThreeStarReviews +
          ")</div></span>"
      );
      var toolTipTwoStar = $(
        '<div class="row"><div class="col-3 py-1">2 stars</div><div class="col-7 py-1"><div class="score-bar mt-2"><div class="score-bar-fill" style="width: ' +
          twoStarFill +
          '%"></div></div></div><div class="col-2 py-1 px-0">(' +
          amountOfTwoStarReviews +
          ")</div></span>"
      );
      var toolTipOneStar = $(
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
