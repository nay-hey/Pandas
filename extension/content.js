(async () => {
  const KEY = "VXRmOTdYs70kb4uo5VG0ZsaGU";
  const scrapEP = "http://api.scraping-bot.io/scrape";
  const username = "roopu";

  console.log("Content script running...");

  // Function to get links based on search terms in the textarea
  const getLinks = () => {
    const textarea = document.getElementsByTagName("textarea")[0];
    if (!textarea) {
      console.error("No textarea found on the page.");
      return [];
    }

    // Split the textarea value into search terms
    const searchTerms = textarea.value.split(",").map((term) => term.trim());
    console.log("Search terms:", searchTerms);

    const domlinks = document.links;
    const links = [];
    for (let i = 0; i < domlinks.length; i++) {
      const href = domlinks[i].href;
      for (let term of searchTerms) {
        if (href.includes(term) && !href.includes("google")) {
          links.push(href);
          break;
        }
      }
    }
    return links;
  };

  // Function to hit a link using the scraping API
  const hitLink = async (url) => {
    try {
      // Base64 encode the username and API key
      const auth = "Basic " + btoa(`${username}:${KEY}`);

      // Send a POST request to the scraping endpoint
      const response = await fetch(scrapEP, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: JSON.stringify({ url }),
      });

      // Parse the response
      const data = await response.json();
      console.log("Scraping API response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching or parsing the page:", error);
      return null;
    }
  };

  // Main logic
  const links = getLinks();
  console.log("Found links:", links);

  if (links.length > 0) {
    const firstLink = links[0];
    console.log("Hitting first link:", firstLink);

    const data = await hitLink(firstLink);
    if (data) {
      console.log("Scraped data:", data);

      // Send the scraped data to the backend for further processing
      try {
        const backendResponse = await fetch("http://localhost:3000/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ products: [data] }), // Wrap data in an array
        });

        if (!backendResponse.ok) {
          throw new Error(`HTTP error! Status: ${backendResponse.status}`);
        }

        const result = await backendResponse.json();
        console.log("Backend processed results:", result);

        // Send the processed results to the background script
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
    }
  } else {
    console.error("No links found matching the search terms.");
  }
})();
document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
        <h1 style="color: #3498db;">Welcome to the Random EJS Page</h1>
        <p>This content was dynamically injected using a Chrome extension!</p>
        <ul style="list-style-type: none;">
            <li><strong>Random Item 1:</strong> ${Math.random().toFixed(2)}</li>
            <li><strong>Random Item 2:</strong> ${Math.random().toFixed(2)}</li>
            <li><strong>Random Item 3:</strong> ${Math.random().toFixed(2)}</li>
        </ul>
    </div>
`;
