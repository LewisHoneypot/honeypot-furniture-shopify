document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("blog-search-input");
  const resultsContainer = document.getElementById("blog-search-results");
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
      fetch(
        `/search/suggest.json?q=${encodeURIComponent(
          query
        )}&resources[type]=article&resources[limit]=5&resources[options][fields]=title,body`
      )
        .then((response) => response.json())
        .then((data) => {
          const articles = data.resources.results.articles;
          if (!articles || articles.length === 0) {
            resultsContainer.innerHTML =
              "<div class='blog-search-item'>No results found.</div>";
            resultsContainer.classList.remove("hidden");
            return;
          }

          resultsContainer.innerHTML = articles
            .map(
              (article) => `
                <div class="blog-search-item">
                  <a href="${article.url}">${article.title}</a>
                  <p>${article.body
                    ?.replace(/<[^>]+>/g, "")
                    .substring(0, 100)}...</p>
                </div>
              `
            )
            .join("");

          // Add "See all results" link at bottom pointing to blog-only search page
          resultsContainer.innerHTML += `
            <div class="blog-search-item blog-search-see-all">
              <a href="/search.blog?q=${encodeURIComponent(query)}">
                See all results →
              </a>
            </div>
          `;

          resultsContainer.classList.remove("hidden");
        })
        .catch((err) => {
          console.error("Search error:", err);
        });
    }, 300);
  });

  // Hide dropdown when click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".blog-live-search")) {
      resultsContainer.classList.add("hidden");
    }
  });

  // Handle Enter key to redirect to blog-only results
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent default form submission if any
      const query = this.value.trim();
      if (query.length > 0) {
        // redirect to blog-only search results page
        window.location.href = `/search.blog?q=${encodeURIComponent(query)}`;
      }
    }
  });
});
