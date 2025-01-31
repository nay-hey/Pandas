(async () => {
    console.log("Content script running...");

    // Select all product items
    
    const productItems = document.querySelectorAll(".pla-unit");
    console.log("Found product items:", productItems);
    

    // Map through product items and extract details
    const products = Array.from(productItems).map((item, index) => {
        console.log(`Processing item ${index + 1}:`, item);

        // Extract details
        let name = "No name";
        const nameElement = 
            item.querySelector(".bXPcId.pymv4e.eAF8mc") || // Primary selector
            item.firstElementChild ||                     // Fallback: First child
            item;                                         // Fallback: Whole item

        if (nameElement) {
            const rawText = nameElement.innerText || "";  // Get `innerText` of the element
            // Use regex or split to isolate the name
            const nameMatch = rawText.split("\n")[0].trim(); // Assuming name is the first line
            name = nameMatch || "No name";
        }

        const price = item.innerText.match(/₹[\d,]+/)?.[0] || "No price";
        const merchant = item.dataset.dtld || "No merchant";
        const freeDelivery = item.innerText.includes("Free delivery") ? "Free delivery" : "No free delivery";
        const image = item.querySelector("img")?.src || "No image";

        console.log({ name, price, merchant, freeDelivery, image });
        return { name, price, merchant, freeDelivery, image };
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
