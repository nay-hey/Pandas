(async () => {
  console.log("Content script running...");

  const getProductElements = () =>
    Array.from(document.querySelectorAll("a[href*='http']"));

  let products = [];
  let attempts = 0;

  // The target number of products to collect
  const targetProducts = 15;

  // Scroll and collect products until we hit the limit or try for a certain number of times
  while (products.length < targetProducts && attempts < 10) {
    const productElements = getProductElements();
    console.log("Found product elements:", productElements.length);

    productElements.forEach((item) => {
      if (products.length >= targetProducts) return;

      let name = item.innerText.split("\n")[0].trim() || "No name";
      let price = item.innerText.match(/₹[\d,]+/)?.[0] || "No price";
      let rating =
        item.innerText.match(/\d+\.\d+ out of 5 stars/)?.[0] || "No rating";
      let freeDelivery = item.innerText.includes("Free delivery")
        ? "Free delivery"
        : "No free delivery";
      let image = item.querySelector("img")?.src || "No image";
      let link = item.href || "No link";

      products.push({ name, price, rating, freeDelivery, image, link });
    });

    console.log("Collected products so far:", products.length);

    // If we haven’t collected enough products, scroll and wait for more content to load
    if (products.length < targetProducts) {
      // Scroll down the page to load more products
      window.scrollBy(0, window.innerHeight);
      // Wait for new content to load
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    attempts++;
  }

  console.log("Final Scraped Products:", JSON.stringify(products, null, 2));

  if (products.length === 0) {
    console.error("No products found. Ensure the page has product elements.");
    return;
  }

  try {
    console.log("Sending data to backend...");
    const response = await fetch("http://localhost:3000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Processed Results:", result);

    chrome.runtime.sendMessage(
      { action: "processedResults", data: result },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending processed results to background:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log(
            "Processed results sent to background:",
            response?.message || "No response"
          );
        }
      }
    );
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }
})();
