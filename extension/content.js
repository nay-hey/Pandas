(async () => {
    console.log("Content script running");

    // Example: Scrape product data from a search result page
    const products = Array.from(document.querySelectorAll(".product-item")).map((item) => ({
        name: item.querySelector(".product-name")?.innerText || "No name",
        price: item.querySelector(".product-price")?.innerText || "No price",
        rating: item.querySelector(".product-rating")?.innerText || "No rating",
    }));

    console.log("Scraped Products:", products);

    // Send scraped data to the backend
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
    } catch (error) {
        console.error("Error sending data to backend:", error);
    }
})();
