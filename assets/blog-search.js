document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("blog-search-input");
  const resultsContainer = document.getElementById("blog-search-results");
  const heading = document.getElementById("blog-search-heading");

  const isResultsPage = !!heading;

  // --- Fetch for live search ---
  const fetchSuggestArticles = (query, limit = 5) => {
    return fetch(
      `/search/suggest.json?q=${encodeURIComponent(
        query
      )}&resources[type]=article&resources[limit]=${limit}&resources[options][fields]=title,body`
    )
      .then((res) => res.json())
      .then((data) => data.resources?.results?.articles || [])
      .catch((err) => {
        console.error("Live search error:", err);
        return [];
      });
  };

  // --- Fetch full articles for results page ---
  const fetchFullArticles = (query) => {
    return fetch(
      `/search/suggest.json?q=${encodeURIComponent(
        query
      )}&resources[type]=article&resources[limit]=20&resources[options][fields]=title,body`
    )
      .then((res) => res.json())
      .then((data) => data.resources?.results?.articles || [])
      .catch((err) => {
        console.error("Results page error:", err);
        return [];
      });
  };

  // --- RESULTS PAGE ---
  const resultsPageContainer = document.getElementById(
    "blog-search-results-page"
  );

  if (isResultsPage && resultsPageContainer) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");

    if (!query) {
      heading.textContent = "No search term provided.";
      resultsPageContainer.innerHTML = "";
    } else {
      heading.textContent = `Search results for “${query}”`;
      resultsPageContainer.innerHTML = `<p>Loading results...</p>`;

      fetchFullArticles(query).then((articles) => {
        if (articles.length === 0) {
          resultsPageContainer.innerHTML = `<p>No blog posts found for “${query}”.</p>`;
          return;
        }

        resultsPageContainer.innerHTML = articles
          .map((article) => {
            const image = article.image
              ? `<img src="${article.image}" alt="${article.title}" class="blog-search-thumb">`
              : "";
            return `
              <div class="blog-search-item">
                <a href="${article.url}" class="blog-search-link">
                  ${image}
                  <div class="blog-search-text">
                    <h3 class="blog-search-title">${article.title}</h3>
                    <p class="blog-search-excerpt">${article.body
                      .replace(/<[^>]+>/g, "")
                      .substring(0, 150)}...</p>
                  </div>
                </a>
              </div>
            `;
          })
          .join("");
      });
    }
  }

  // --- MAIN BLOG PAGE LIVE SEARCH ---
  if (input) {
    let debounceTimer;

    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      const query = this.value.trim();

      if (query.length < 2) {
        resultsContainer.classList.add("hidden");
        resultsContainer.innerHTML = "";
        return;
      }

      debounceTimer = setTimeout(() => {
        fetchSuggestArticles(query, 5).then((articles) => {
          if (articles.length === 0) {
            resultsContainer.innerHTML = `<div class='blog-search-item'>No results found.</div>`;
            resultsContainer.classList.remove("hidden");
            return;
          }

          resultsContainer.innerHTML = articles
            .map(
              (article) => `
              <div class="blog-search-item">
                <a href="${article.url}">${article.title}</a>
                <p>${article.body
                  .replace(/<[^>]+>/g, "")
                  .substring(0, 100)}...</p>
              </div>
            `
            )
            .join("");

          // Add “See all results” link
          resultsContainer.innerHTML += `
            <div class="blog-search-item blog-search-see-all">
              <a href="/pages/blog-search-results?q=${encodeURIComponent(
                query
              )}">
                See all results →
              </a>
            </div>
          `;

          resultsContainer.classList.remove("hidden");
        });
      }, 300);
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".blog-live-search")) {
        resultsContainer.classList.add("hidden");
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = input.value.trim();
        if (query.length > 0) {
          window.location.href = `/pages/blog-search-results?q=${encodeURIComponent(
            query
          )}`;
        }
      }
    });
  }
});
