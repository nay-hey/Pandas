
document.getElementById("scrape-button").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "scrapeData" }, (response) => {
      if (chrome.runtime.lastError) {
          console.error("Error from background script:", chrome.runtime.lastError.message);
      } else if (response?.status === "error") {
          console.error("Error:", response.message);
      } else {
          console.log("Scraping initiated:", response?.message);
      }
  });
});

// Listen for processed results
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processedResults" && message.data?.filteredProducts) {
      console.log("Processed results received in popup:", message.data);

      let allProducts = message.data.filteredProducts;
      updateMerchantDropdown(allProducts);
      applyFilters(allProducts); // Initial render with all products
  }
});

// Update merchant dropdown dynamically
function updateMerchantDropdown(products) {
  const merchantFilter = document.getElementById("merchant-filter");
  const uniqueMerchants = [...new Set(products.map(product => product.merchant))];

  // Clear and repopulate merchant filter
  merchantFilter.innerHTML = '<option value="all">All</option>';
  uniqueMerchants.forEach(merchant => {
      let option = document.createElement("option");
      option.value = merchant;
      option.textContent = merchant;
      merchantFilter.appendChild(option);
  });
}

// Apply filters based on user selection
function applyFilters(products) {
  const merchantFilter = document.getElementById("merchant-filter").value;
  const maxPrice = document.getElementById("price-range").value;
  const freeDeliveryOnly = document.getElementById("free-delivery-filter").checked;

  let filteredProducts = products.filter(product => {
      return (
          (merchantFilter === "all" || product.merchant === merchantFilter) &&
          (parseFloat(product.price.replace(/[^\d.]/g, "")) <= maxPrice) &&
          (!freeDeliveryOnly || product.freeDelivery.toLowerCase() === "yes")
      );
  });

  // Sort filtered products by price in ascending order
  filteredProducts.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^\d.]/g, ""));
      const priceB = parseFloat(b.price.replace(/[^\d.]/g, ""));
      return priceA - priceB;  // Sort in ascending order
  });

  displayProducts(filteredProducts);
}

// Display products in Swiper carousel
function displayProducts(products) {
  const productList = document.getElementById("product-list");
  productList.innerHTML = ""; // Clear previous results

  products.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.classList.add("swiper-slide", "product-item");
      productDiv.innerHTML = `
                  <p><strong>Name:</strong> ${product.name}</p>
                  <p><strong>Price:</strong> ${product.price}</p>
                  <p><strong>Merchant:</strong> ${product.merchant}</p>
                  <p><strong>Delivery:</strong> ${product.freeDelivery}</p>
                  <p><strong>Link:</strong> <a href="${product.link}" target="_blank">View Product</a></p>
                  <img src="${product.image}" alt="${product.name}" width="100">
                  <hr>
              `;
      resultsContainer.appendChild(productDiv);
    });

    // Clear previous results and append the new results
    document.body.innerHTML = ""; // Clear the body for a fresh display
    document.body.appendChild(resultsContainer);
  }
});
document.getElementById("scrape-button").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    });
  });
});