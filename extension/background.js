chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes("google.com/search") && changeInfo.status === "complete") {
        chrome.tabs.sendMessage(tabId, { action: "scrapeProducts" }, (response) => {
            if (response) {
                // Send scraped data to Node.js backend
                fetch("http://localhost:3000/process", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(response)
                })
                .then(res => res.json())
                .then(data => console.log("Processed Results:", data))
                .catch(err => console.error("Error:", err));
            }
        });
    }
});
