const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Endpoint to process scraped data
app.post("/process", async (req, res) => {
    const products = req.body;

    // Filter products by cheapest and best rating
    const filtered = products
        .filter(product => product.price) // Ensure price is available
        .sort((a, b) => parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", ""))); // Sort by price

    // Call Gemini API (example)
    try {
        const response = await axios.post("https://your-gemini-api-endpoint.com/process", { products: filtered });
        res.json(response.data);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).send("Error processing data");
    }
});

// Run Puppeteer for seasonal trends (example endpoint)
const puppeteer = require("puppeteer");

// Seasonal trends scraping endpoint
app.get("/trend-analysis", async (req, res) => {
    try {
        const query = req.query.q || "seasonal sales 2025"; // Example query
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        const browser = await puppeteer.launch({
            headless: true, // Run in headless mode
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // Sandbox args for production environments
        });
        const page = await browser.newPage();

        // Navigate to Google search
        await page.goto(googleSearchUrl, { waitUntil: "domcontentloaded" });

        // Wait for search results to load
        await page.waitForSelector("div.tF2Cxc"); // Google search result selector

        // Scrape search results
        const results = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("div.tF2Cxc")).map((result) => {
                const title = result.querySelector("h3")?.innerText || "No title";
                const link = result.querySelector("a")?.href || "No link";
                const snippet = result.querySelector(".VwiC3b")?.innerText || "No snippet";
                return { title, link, snippet };
            });
        });

        await browser.close();
        res.json({ query, results });
    } catch (error) {
        console.error("Puppeteer error:", error);
        res.status(500).send("Error fetching Google trends");
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
