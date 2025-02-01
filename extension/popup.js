document.getElementById("scrape-button").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "scrapeData" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error from background script:",
        chrome.runtime.lastError.message
      );
    } else if (response.status === "error") {
      console.error("Error:", response.message);
    } else {
      console.log("Scraping initiated:", response.message);
    }
  });
});

// Listen for processed results
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processedResults") {
    console.log("Processed results received in popup:", message.data);

    // Display the results in the popup
    const resultsContainer = document.createElement("div");
    resultsContainer.style.maxHeight = "400px";
    resultsContainer.style.overflowY = "auto";

    message.data.filteredProducts.forEach((product) => {
      const productDiv = document.createElement("div");
      productDiv.style.marginBottom = "20px";
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
