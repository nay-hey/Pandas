(async () => {
  console.log("Content script running...");

  // Select all product items
  const productItems = document.querySelectorAll(".pla-unit");
  console.log("Found product items:", productItems);

  // Map through product items and extract details
  const products = Array.from(productItems).map((item, index) => {
    console.log(`Processing item ${index + 1}:`, item);

    // Extract name from `innerText`
    let name = "No name";
    const rawText = item.innerText || ""; // Get the full text content of the item
    if (rawText) {
      name = rawText.split("\n")[0].trim(); // Extract the first line as the name
    }

    const price = item.innerText.match(/₹[\d,]+/)?.[0] || "No price";
    const merchant = item.dataset.dtld || "No merchant";
    const freeDelivery = item.innerText.includes("Free delivery") ? "Free delivery" : "No free delivery";
    const image = item.querySelector("img")?.src || "No image";
    console.log("Item HTML:", item.outerHTML);

    // Try to find the link using the correct selector (pla-unit)
    const linkElement = item.querySelector("a");
    const link = linkElement ? linkElement.getAttribute("href") : "No link";

    console.log("Product link:", link);

    return { name, price, merchant, freeDelivery, image, link };
  });

  console.log("Scraped Products:", products);

  // Send the scraped data to the backend
  try {
    const response = await fetch("http://localhost:3000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products }),
    });

    const result = await response.json();
    console.log("Processed Results:", result);
    chrome.runtime.sendMessage({ action: "processedResults", data: result }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending processed results to background:", chrome.runtime.lastError.message);
      } else {
        console.log("Processed results sent to background:", response.message);
      }
    });
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }

  // Dynamically inject HTML content including filters and swiper container
  document.body.innerHTML = `
    <!-- Filtering Options -->
    <div id="filters">
        <label for="merchant-filter">Merchant:</label>
        <select id="merchant-filter">
            <option value="all">All</option>
            <!-- Additional merchants can be added dynamically -->
        </select>

        <label for="price-range">Max Price:</label>
        <input type="range" id="price-range" min="0" max="2000" step="10" value="2000">
        <span id="price-value">2000</span>

        <label>
            <input type="checkbox" id="free-delivery-filter">
            Free Delivery Only
        </label>
    </div>

    <!-- Swiper Container -->
    <div class="swiper-container">
        <div class="swiper-wrapper" id="product-list">
            ${products.map(product => `
              <div class="swiper-slide">
                <div class="product-card">
                  <img src="${product.image}" alt="${product.name}" />
                  <h3>${product.name}</h3>
                  <p>${product.price}</p>
                  <p>${product.merchant}</p>
                  <p>${product.freeDelivery}</p>
                  <a href="${product.link}" target="_blank">View Product</a>
                </div>
              </div>
            `).join('')}
        </div>
        <div class="swiper-pagination"></div>
    </div>

    <script src="popup.js"></script>
  `;

  // Initialize the Swiper
  const swiper = new Swiper('.swiper-container', {
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
})();
