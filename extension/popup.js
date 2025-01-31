document.getElementById("scrape-button").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "scrapeData" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error from background script:", chrome.runtime.lastError.message);
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
        message.data.filteredProducts.forEach((product) => {
            const productDiv = document.createElement("div");
            productDiv.innerHTML = `
                <p><strong>Name:</strong> ${product.name}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Merchant:</strong> ${product.merchant}</p>
                <p><strong>Delivery:</strong> ${product.freeDelivery}</p>
                <img src="${product.image}" alt="${product.name}" width="100">
                <hr>
            `;
            resultsContainer.appendChild(productDiv);
        });

        document.body.appendChild(resultsContainer);
    }
});
