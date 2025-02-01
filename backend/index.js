const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(bodyParser.json());

// Increase the limit for the JSON body (example: 10mb)
app.use(bodyParser.json({ limit: "50mb" })); // You can adjust the limit as needed
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Endpoint for processing data
app.use(bodyParser.json({ limit: "50mb" }));
app.post("/process", async (req, res) => {
  const products = req.body.products || [];

  if (!Array.isArray(products) || products.length === 0) {
    console.error("No products received or invalid data format");
    return res
      .status(400)
      .json({ error: "No products received or invalid data format." });
  }

  console.log("Received products:", products);

  // Process the products (e.g., filter, sort, or call external APIs)
  const filteredProducts = products
    // Ensure price is valid
    .filter(
      (product) =>
        product.price &&
        !isNaN(parseFloat(product.price.replace(/[₹$,]/g, "").replace(",", "")))
    )
    // Sort products by numeric price (ascending)
    .sort(
      (a, b) =>
        parseFloat(a.price.replace(/[₹$,]/g, "").replace(",", "")) -
        parseFloat(b.price.replace(/[₹$,]/g, "").replace(",", ""))
    );

  //   console.log("Filtered products:", filteredProducts);

  res.json({ success: true, filteredProducts });
});

// Send processed data to Gemini API
app.post("/gemini-process", async (req, res) => {
  const { sortedLinks } = req.body;

  if (!sortedLinks || sortedLinks.length === 0) {
    return res.status(400).json({ error: "No sorted links received." });
  }

  try {
    console.log("Sending data to Gemini AI...");

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyAdX-lmz_hIwAOfzrYOoYNRT4LZPfRwqjA",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer AIzaSyAdX-lmz_hIwAOfzrYOoYNRT4LZPfRwqjA",
        },
        body: JSON.stringify({ sortedLinks }),
      }
    );

    const result = await geminiResponse.json();
    console.log("Received response from Gemini:", result);

    res.send(result.generatedHtml);
  } catch (error) {
    console.error("Error processing with Gemini:", error);
    res.status(500).json({ error: "Failed to generate page" });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
