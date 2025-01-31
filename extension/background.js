// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

// Listen for scrape requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeData") {
        console.log("Scraping triggered in background script");

        // Check if the active tab is available
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error("No active tabs found");
                sendResponse({ status: "error", message: "No active tab available" });
                return;
            }

            // Inject content.js into the active tab
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    files: ["content.js"],
                },
                (results) => {
                    if (chrome.runtime.lastError) {
                        console.error("Error injecting content script:", chrome.runtime.lastError.message);
                        sendResponse({ status: "error", message: "Failed to inject content script" });
                        return;
                    }
                    console.log("Content script injected successfully");
                    sendResponse({ status: "success", message: "Scraping initiated" });
                }
            );
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});
