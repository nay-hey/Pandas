(async () => {
  console.log("Content script running...");

  // Save the original content of the page
  const originalHTML = document.body.innerHTML;

  // Select all product items (Ensure the selector is accurate based on your actual page)
  const productItems = document.querySelectorAll(".pla-unit");
  console.log("Found product items:", productItems);

  // Map through product items and extract details
  const products = Array.from(productItems).map((item, index) => {
    console.log(`Processing item ${index + 1}:`, item);

    // Extract name from innerText
    let name = "No name";
    const rawText = item.innerText || ""; // Get the full text content of the item
    if (rawText) {
      name = rawText.split("\n")[0].trim(); // Extract the first line as the name
    }

    const price = item.innerText.match(/₹[\d,]+/)?.[0] || "No price";
    const merchant = item.dataset.dtld || "No merchant";
    const freeDelivery = item.innerText.includes("Free delivery")
      ? "Free delivery"
      : "No free delivery";
    const image = item.querySelector("img")?.src || "No image";
    console.log("Item HTML:", item.outerHTML);

    // Try to find the link using the correct selector (pla-unit)
    const linkElement = item.querySelector("a");
    const link = linkElement ? linkElement.getAttribute("href") : "No link";

    console.log("Product link:", link);

    return { name, price, merchant, freeDelivery, image, link };
  });

  console.log("Scraped Products:", products);

  // Sort the products by price (if available)
  products.sort((a, b) => {
    const priceA = a.price.replace(/[₹,]/g, "") || 0;
    const priceB = b.price.replace(/[₹,]/g, "") || 0;
    return parseFloat(priceA) - parseFloat(priceB);
  });

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
    chrome.runtime.sendMessage(
      { action: "processedResults", data: result },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending processed results to background:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log(
            "Processed results sent to background:",
            response.message
          );
        }
      }
    );
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }

  // Dynamically inject HTML content including filters and swiper container
  document.body.innerHTML = `
        <!-- Close Button -->
        <button id="close-injected-content" style="position: absolute; top: 10px; right: 10px; z-index: 1000; background: red; color: white; border: none; padding: 10px; cursor: pointer;">X</button>
  
        <!-- Filtering Options -->
        <div id="filters" style="display: flex; gap: 15px; flex-wrap: wrap;">
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
  
        <!-- Product Cards -->
        <div class="product-cards" id="product-list" style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: flex-start;">
            ${products
              .map(
                (product) => ` 
              <div class="product-card" style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 200px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
                  <img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 5px;" />
                  <h3 style="font-size: 16px; margin: 10px 0; text-align: center;">${product.name}</h3>
                  <p style="color: green; font-size: 14px; margin: 5px 0;">${product.price}</p>
                  <p style="font-size: 14px; margin: 5px 0; text-align: center;">Merchant: ${product.merchant}</p>
                  <p style="font-size: 14px; margin: 5px 0; text-align: center;">${product.freeDelivery}</p>
                  <a href="${product.link}" target="_blank" style="font-size: 14px; color: blue; text-align: center;">View Product</a>
              </div>
            `
              )
              .join("")}
        </div>
    
        <script src="popup.js"></script>
      `;

  // Close button functionality to restore original page content
  document
    .getElementById("close-injected-content")
    ?.addEventListener("click", () => {
      document.body.innerHTML = originalHTML; // Restore the original HTML
      console.log("Original page content restored");
    });

  // Add event listeners for filtering
  const merchantFilter = document.getElementById("merchant-filter");
  const priceRange = document.getElementById("price-range");
  const priceValue = document.getElementById("price-value");
  const freeDeliveryFilter = document.getElementById("free-delivery-filter");

  // Update price display
  priceValue.textContent = priceRange.value;

  // Apply filters dynamically
  function applyFilters() {
    const selectedMerchant = merchantFilter.value;
    const maxPrice = parseFloat(priceRange.value);
    const freeDeliveryOnly = freeDeliveryFilter.checked;

    const filteredProducts = products.filter((product) => {
      const productPrice = parseFloat(product.price.replace(/[₹,]/g, ""));
      return (
        (selectedMerchant === "all" || product.merchant === selectedMerchant) &&
        (isNaN(productPrice) || productPrice <= maxPrice) &&
        (!freeDeliveryOnly || product.freeDelivery === "Free delivery")
      );
    });

    // Re-render products after applying filters
    const productList = document.getElementById("product-list");
    productList.innerHTML = filteredProducts
      .map(
        (product) => `
        <div class="product-card" style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 200px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center;">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: auto; border-radius: 5px;" />
            <h3 style="font-size: 16px; margin: 10px 0; text-align: center;">${product.name}</h3>
            <p style="color: green; font-size: 14px; margin: 5px 0;">${product.price}</p>
            <p style="font-size: 14px; margin: 5px 0; text-align: center;">Merchant: ${product.merchant}</p>
            <p style="font-size: 14px; margin: 5px 0; text-align: center;">${product.freeDelivery}</p>
            <a href="${product.link}" target="_blank" style="font-size: 14px; color: blue; text-align: center;">View Product</a>
        </div>
        `
      )
      .join("");
  }

  // Event listeners for filtering
  merchantFilter.addEventListener("change", applyFilters);
  priceRange.addEventListener("input", function () {
    priceValue.textContent = this.value;
    applyFilters();
  });
  freeDeliveryFilter.addEventListener("change", applyFilters);

})();
