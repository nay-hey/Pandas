document.getElementById("scrape-button").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeProducts" }, (response) => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "<h4>Scraped Products:</h4>";
            response.forEach(product => {
                resultsDiv.innerHTML += `<p>${product.title} - ${product.price}</p>`;
            });
        });
    });
});
