function fetchReviews2(endpoint) {
// GET request reviews
fetch(endpoint)
  .then((response) => response.json())
  .then((reviewData) => {
    // console.log(reviewData);

    var starsAverage = '';
    var starsTotal = 0;
    var numberOfReviews = reviewData.reviews.length;

    // Initialize counters for each star rating
    var oneStarCount = 0;
    var twoStarCount = 0;
    var threeStarCount = 0;
    var fourStarCount = 0;
    var fiveStarCount = 0;

    for (var i = 0; i < numberOfReviews; i++) {
      var stars = reviewData.reviews[i].stars;
      starsTotal = starsTotal + stars;

      // Increment the corresponding counter based on the star rating
      switch (stars) {
        case 1:
          oneStarCount++;
          break;
        case 2:
          twoStarCount++;
          break;
        case 3:
          threeStarCount++;
          break;
        case 4:
          fourStarCount++;
          break;
        case 5:
          fiveStarCount++;
          break;
        default:
          // Handle any unexpected star ratings
          break;
      }
    }

    var nextPageToken = reviewData.nextPageToken;

    fetch('https://honeypot-trade.co.uk/staging/trustpilot/service-all-reviews.php?nextPageToken=' + nextPageToken)
      .then((response) => response.json())
      .then((reviewData2) => {
        var starsAverage2 = 0;
        var starsTotal2 = 0;
        var numberOfReviews2 = reviewData2.reviews.length;

        for (var i = 0; i < numberOfReviews2; i++) {
          var stars2 = reviewData2.reviews[i].stars;
          starsTotal2 = starsTotal2 + stars2;

          // Increment the corresponding counter based on the star rating
          switch (stars2) {
            case 1:
              oneStarCount++;
              break;
            case 2:
              twoStarCount++;
              break;
            case 3:
              threeStarCount++;
              break;
            case 4:
              fourStarCount++;
              break;
            case 5:
              fiveStarCount++;
              break;
            default:
              // Handle any unexpected star ratings
              break;
          }
        }

        numberOfReviews2 = numberOfReviews + numberOfReviews2;
        starsTotal2 = starsTotal + starsTotal2;
        nextPageToken = reviewData2.nextPageToken;

        fetch(
          'https://honeypot-trade.co.uk/staging/trustpilot/service-all-reviews.php?nextPageToken=' + nextPageToken
        )
          .then((response) => response.json())
          .then((reviewData3) => {
            var starsAverage3 = 0;
            var starsTotal3 = 0;
            var numberOfReviews3 = reviewData3.reviews.length;

            for (var i = 0; i < numberOfReviews3; i++) {
              var stars3 = reviewData3.reviews[i].stars;
              starsTotal3 = starsTotal3 + stars3;

              // Increment the corresponding counter based on the star rating
              switch (stars3) {
                case 1:
                  oneStarCount++;
                  break;
                case 2:
                  twoStarCount++;
                  break;
                case 3:
                  threeStarCount++;
                  break;
                case 4:
                  fourStarCount++;
                  break;
                case 5:
                  fiveStarCount++;
                  break;
                default:
                  // Handle any unexpected star ratings
                  break;
              }
            }

            numberOfReviews3 = numberOfReviews2 + numberOfReviews3;
            starsTotal3 = starsTotal2 + starsTotal3;

            let fiveStarFill = (fiveStarCount / numberOfReviews3) * 100;
            let fourStarFill = (fourStarCount / numberOfReviews3) * 100;
            let threeStarFill = (threeStarCount / numberOfReviews3) * 100;
            let twoStarFill = (twoStarCount / numberOfReviews3) * 100;
            let oneStarFill = (oneStarCount / numberOfReviews3) * 100;

            fiveStarFill = fiveStarFill.toFixed();
            fourStarFill = fourStarFill.toFixed();
            threeStarFill = threeStarFill.toFixed();
            twoStarFill = twoStarFill.toFixed();
            oneStarFill = oneStarFill.toFixed();

            // append rating amount
            $('#fiveStarNumber').text('(' + fiveStarFill + '%)');
            $('#fourStarNumber').text('(' + fourStarFill + '%)');
            $('#threeStarNumber').text('(' + threeStarFill + '%)');
            $('#twoStarNumber').text('(' + twoStarFill + '%)');
            $('#oneStarNumber').text('(' + oneStarFill + '%)');

            // append rating fill
            $('#fiveStarFill').attr('style', 'width: ' + fiveStarFill + '%');
            $('#fourStarFill').attr('style', 'width: ' + fourStarFill + '%');
            $('#threeStarFill').attr('style', 'width: ' + threeStarFill + '%');
            $('#twoStarFill').attr('style', 'width: ' + twoStarFill + '%');
            $('#oneStarFill').attr('style', 'width: ' + oneStarFill + '%');

            starsAverage3 = starsTotal3 / numberOfReviews3;
            starsAverage3 = starsAverage3.toFixed(1);

            $('#reviewCount').text(starsAverage3 + ' out of 5, Based on ' + numberOfReviews3 + ' Reviews');
            // $('#reviewAverage').text(starsAverage3 +" out of 5, Based on " + numberOfReviews3 +" Reviews");
            $('#loading-indicator').css('display', 'none');
          });
      });
  });
}
fetchReviews2('https://honeypot-trade.co.uk/staging/trustpilot/service-all-reviews.php');

// Get Service Reviews
function fetchReviews(endpoint) {
// GET request reviews
fetch(endpoint)
  .then((response) => response.json())
  .then((reviewData) => {
    // Clear existing reviews
    $('#reviews').empty();

    // Target the element with the ID "reviews"
    var reviewsContainer = $('#reviews');

    for (var i = 0; i < reviewData.reviews.length; i++) {
      if (reviewData.reviews[i].experiencedAt) {
        var dateStringWithoutMilliseconds1 =
          reviewData.reviews[i].experiencedAt.split('.')[0].replace(/Z+$/, '') + 'Z';
      } else {
        dateStringWithoutMilliseconds1 = '';
      }
      var reviewDate1 = new Date(dateStringWithoutMilliseconds1);
      var formattedDate1 = reviewDate1.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      var companyReply = '';

      if (reviewData.reviews[i].companyReply) {
        var dateStringWithoutMilliseconds2 =
          reviewData.reviews[i].companyReply.createdAt.split('.')[0].replace(/Z+$/, '') + 'Z';
        var reviewDate2 = new Date(dateStringWithoutMilliseconds2);
        var formattedDate2 = reviewDate2.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        companyReply = reviewData.reviews[i].companyReply.text;
      }
      
      // Create the card element
      var cardHtml =
        '<div class="col-sm-6 col-lg-4 mb-5">' +
        '<div class="card">' +
        '<div class="card-body">' +
        '<div class="reviewSectionHeader pb-3 d-inline-flex">' +
        '<div class="userIcon pt-2 pr-2">' +
        '<img src="'+userImage+'" class="pb-1" height="24" width="24">' +
        '</div>' +
        '<div class="customerInfo pl-2">' +
        '<span class="p-0"><strong>' + reviewData.reviews[i].consumer.displayName + '</strong>, ' + formattedDate1 + '</span>' +
        '<span class="d-block mb-2">' +
        '<img src="//honeypot-furniture.myshopify.com/cdn/shop/files/trustpilot_' + reviewData.reviews[i].stars +
        '.png" class="stars-image" alt="Trustpilot Rating" height="21" width="100"><span> ' + reviewData.reviews[i].stars +
        ' out of 5</span>' +
        '<br>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div class="card-title p-0">' + reviewData.reviews[i].title + '</div>' +
        '<p class="card-text mb-5">' + reviewData.reviews[i].text + '</p>' +
        '</div>';

      // Check if there's a company reply, and add it to the card if present
      if (companyReply) {
        cardHtml +=
          '<div class="card-body pl-3">' +
          '<div class="reviewSectionHeader pb-3 d-inline-flex">' +
          '<div class="userIcon pt-2">' +
          '<img src="'+staffImage+'" class="pb-1" height="24" width="24">' +
          '</div>' +
          '<div class="customerInfo pl-2 pt-2">' +
          '<span class="p-0"><strong> Honeypot Furniture</strong>, ' + formattedDate2 + '</span>' +
          '</div>' +
          '</div>' +
          '<p class="card-text">' + companyReply + '</p>' +
          '</div>';
      }

      // Close the card element
      cardHtml += '</div><hr class="m-0"></div>';

      // Create a jQuery object from the card HTML
      var $card = $(cardHtml);

      // Add the card to the reviews container
      reviewsContainer.append($card);
    }

    // Load Masonry layout script
    jQuery.getScript('https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js');
  });
}

fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20');

// Event listener for endpoint buttons
$('#reviewCount').click(function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20');
  $('#reviewsMessage').html('Showing <strong>All Stars</strong> Trustpilot Service Reviews');
});

$('#fiveStars').click(function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=5');
  $('#reviewsMessage').html('Showing <strong>5 Star</strong> Trustpilot Service Reviews');
});

$('#fourStars').click(function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=4');
  $('#reviewsMessage').html('Showing <strong>4 Star</strong> Trustpilot Service Reviews');
});

$('#threeStars').click(function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=3');
  $('#reviewsMessage').html('Showing <strong>3 Star</strong> Trustpilot Service Reviews');
});

$('#twoStars').click(function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=2');
  $('#reviewsMessage').html('Showing <strong>2 Star</strong> Trustpilot Service Reviews');
});

$('#oneStar').click(function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=1');
  $('#reviewsMessage').html('Showing <strong>1 Star</strong> Trustpilot Service Reviews');
});

// Pagination buttons (assuming you have logic for pagination)
$('#pagination').on('click', '.page-btn', function () {
  var page = $(this).data('page');
  // Update the page parameter in the endpoint URL
  var endpoint = phpEndpoints[currentEndpointIndex] + '?page=' + page;
  fetchReviews(endpoint);
});
