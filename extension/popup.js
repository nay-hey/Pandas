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
