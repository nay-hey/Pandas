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

    console.log("Link found:", linkElement);
    // Log the link element for debugging
    if (linkElement) {
        console.log("Link found:", linkElement);
    } else {
        console.log("No link found for this item.");
    }

    // Extract link (use getAttribute for better compatibility)
    const link = linkElement ? linkElement.getAttribute("href") : "No link";  

        // Log the link for debugging
        console.log("Product link:", link);
        console.log({ name, price, merchant, freeDelivery, image, link });

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
})();
