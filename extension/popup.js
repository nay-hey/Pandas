document.getElementById("scrape-button").addEventListener("click", () => {
  // Show loading animation
  document.getElementById("loading").style.display = "block";
  document.getElementById("product-list").innerHTML = ""; // Clear previous results

  chrome.runtime.sendMessage({ action: "scrapeData" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error from background script:",
        chrome.runtime.lastError.message
      );
      document.getElementById("loading").style.display = "none"; // Hide loading animation on error
    } else if (response.status === "error") {
      console.error("Error:", response.message);
      document.getElementById("loading").style.display = "none"; // Hide loading animation on error
    } else {
      console.log("Scraping initiated:", response.message);
      // The loading animation will be hidden when the processed results are received
    }
  });
});

// Listen for processed results
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processedResults") {
    console.log("Processed results received in popup:", message.data);

    // Hide loading animation
    document.getElementById("loading").style.display = "none";

    // Display the results in the popup
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Clear previous results

    message.data.filteredProducts.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.className = "product-item";
      productDiv.innerHTML = `
                <p class="product-name">${product.name}</p>
                <p class="product-price">${product.price}</p>
                <p><strong>Merchant:</strong> ${product.merchant}</p>
                <p><strong>Delivery:</strong> ${product.freeDelivery}</p>
                <p><strong>Link:</strong> <a href="${product.link}" target="_blank">View Product</a></p>
                <img src="${product.image}" alt="${product.name}" width="100">
                <hr>
            `;
      productList.appendChild(productDiv);
    });
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
