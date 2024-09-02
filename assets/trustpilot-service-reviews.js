function fetchReviews2(endpoint) {
  fetch(endpoint)
    .then((response) => response.json())
    .then((reviewData) => {
      var starsAverage = '';
      var starsTotal = 0;
      var numberOfReviews = reviewData.reviews.length;

      var oneStarCount = 0;
      var twoStarCount = 0;
      var threeStarCount = 0;
      var fourStarCount = 0;
      var fiveStarCount = 0;

      for (var i = 0; i < numberOfReviews; i++) {
        var stars = reviewData.reviews[i].stars;
        starsTotal = starsTotal + stars;

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
                break;
            }
          }

          numberOfReviews2 = numberOfReviews + numberOfReviews2;
          starsTotal2 = starsTotal + starsTotal2;
          nextPageToken = reviewData2.nextPageToken;

          fetch('https://honeypot-trade.co.uk/staging/trustpilot/service-all-reviews.php?nextPageToken=' + nextPageToken)
            .then((response) => response.json())
            .then((reviewData3) => {
              var starsAverage3 = 0;
              var starsTotal3 = 0;
              var numberOfReviews3 = reviewData3.reviews.length;

              for (var i = 0; i < numberOfReviews3; i++) {
                var stars3 = reviewData3.reviews[i].stars;
                starsTotal3 = starsTotal3 + stars3;

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

              document.querySelector('#fiveStarNumber').textContent = '(' + fiveStarFill + '%)';
              document.querySelector('#fourStarNumber').textContent = '(' + fourStarFill + '%)';
              document.querySelector('#threeStarNumber').textContent = '(' + threeStarFill + '%)';
              document.querySelector('#twoStarNumber').textContent = '(' + twoStarFill + '%)';
              document.querySelector('#oneStarNumber').textContent = '(' + oneStarFill + '%)';

              document.querySelector('#fiveStarFill').style.width = fiveStarFill + '%';
              document.querySelector('#fourStarFill').style.width = fourStarFill + '%';
              document.querySelector('#threeStarFill').style.width = threeStarFill + '%';
              document.querySelector('#twoStarFill').style.width = twoStarFill + '%';
              document.querySelector('#oneStarFill').style.width = oneStarFill + '%';

              starsAverage3 = starsTotal3 / numberOfReviews3;
              starsAverage3 = starsAverage3.toFixed(1);

              document.querySelector('#reviewCount').textContent = starsAverage3 + ' out of 5, Based on ' + numberOfReviews3 + ' Reviews';
              document.querySelector('#loading-indicator').style.display = 'none';
            });
        });
    });
}

fetchReviews2('https://honeypot-trade.co.uk/staging/trustpilot/service-all-reviews.php');

function fetchReviews(endpoint) {
  fetch(endpoint)
    .then((response) => response.json())
    .then((reviewData) => {
      document.getElementById('reviews').innerHTML = '';

      var reviewsContainer = document.getElementById('reviews');

      for (var i = 0; i < reviewData.reviews.length; i++) {
        var dateStringWithoutMilliseconds1 = reviewData.reviews[i].experiencedAt ? reviewData.reviews[i].experiencedAt.split('.')[0].replace(/Z+$/, '') + 'Z' : '';
        var reviewDate1 = new Date(dateStringWithoutMilliseconds1);
        var formattedDate1 = reviewDate1.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        var companyReply = '';

        if (reviewData.reviews[i].companyReply) {
          var dateStringWithoutMilliseconds2 = reviewData.reviews[i].companyReply.createdAt.split('.')[0].replace(/Z+$/, '') + 'Z';
          var reviewDate2 = new Date(dateStringWithoutMilliseconds2);
          var formattedDate2 = reviewDate2.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          companyReply = reviewData.reviews[i].companyReply.text;
        }

        var cardHtml =
          '<div class="col-sm-6 col-lg-4 mb-5 review">' +
          '<div class="card">' +
          '<div class="card-body">' +
          '<div class="reviewSectionHeader pb-3 d-inline-flex">' +
          '<div class="userIcon pt-2 pr-2">' +
          '<img src="' + userImage + '" class="pb-1" height="24" width="24">' +
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

        if (companyReply) {
          cardHtml +=
            '<div class="card-body pl-3">' +
            '<div class="reviewSectionHeader pb-3 d-inline-flex">' +
            '<div class="userIcon pt-2">' +
            '<img src="' + staffImage + '" class="pb-1" height="24" width="24">' +
            '</div>' +
            '<div class="customerInfo pl-2 pt-2">' +
            '<span class="p-0"><strong> Honeypot Furniture</strong>, ' + formattedDate2 + '</span>' +
            '</div>' +
            '</div>' +
            '<p class="card-text">' + companyReply + '</p>' +
            '</div>';
        }

        cardHtml += '</div><hr class="m-0"></div>';

        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml;
        var card = tempDiv.firstElementChild;

        reviewsContainer.appendChild(card);
      }

      fetch('https://cdn.jsdelivr.net/npm/masonry-layout@4.2.2/dist/masonry.pkgd.min.js')
        .then(response => response.text())
        .then(scriptText => {
          var script = document.createElement('script');
          script.text = scriptText;
          document.head.appendChild(script);
        });
    });
}

fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20');

document.querySelector('#reviewCount').addEventListener('click', function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20');
  document.querySelector('#reviewsMessage').innerHTML = 'Showing <strong>All Stars</strong> Trustpilot Service Reviews';
});

document.querySelector('#fiveStars').addEventListener('click', function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=5');
  document.querySelector('#reviewsMessage').innerHTML = 'Showing <strong>5 Star</strong> Trustpilot Service Reviews';
});

document.querySelector('#fourStars').addEventListener('click', function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=4');
  document.querySelector('#reviewsMessage').innerHTML = 'Showing <strong>4 Star</strong> Trustpilot Service Reviews';
});

document.querySelector('#threeStars').addEventListener('click', function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=3');
  document.querySelector('#reviewsMessage').innerHTML = 'Showing <strong>3 Star</strong> Trustpilot Service Reviews';
});

document.querySelector('#twoStars').addEventListener('click', function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=2');
  document.querySelector('#reviewsMessage').innerHTML = 'Showing <strong>2 Star</strong> Trustpilot Service Reviews';
});

document.querySelector('#oneStar').addEventListener('click', function () {
  fetchReviews('https://honeypot-trade.co.uk/staging/trustpilot/service-reviews.php?perPage=20&stars=1');
  document.querySelector('#reviewsMessage').innerHTML = 'Showing <strong>1 Star</strong> Trustpilot Service Reviews';
});

document.querySelector('#pagination').addEventListener('click', function (event) {
  if (event.target && event.target.classList.contains('page-btn')) {
    var page = event.target.getAttribute('data-page');
    var endpoint = phpEndpoints[currentEndpointIndex] + '?page=' + page;
    fetchReviews(endpoint);
  }
});
