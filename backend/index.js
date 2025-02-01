const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
app.use(bodyParser.json());

// Endpoint for processing data
app.post("/process", async (req, res) => {
    const products = req.body.products || [];

    if (!Array.isArray(products) || products.length === 0) {
        console.error("No products received or invalid data format");
        return res.status(400).json({ error: "No products received or invalid data format." });
    }

    console.log("Received products:", products);

    // Process the products (e.g., filter, sort, or call external APIs)
    const filteredProducts = products
    // Ensure price is valid
    .filter(product => product.price && !isNaN(parseFloat(product.price.replace(/[₹$,]/g, "").replace(",", ""))))
    // Sort products by numeric price (ascending)
    .sort((a, b) => parseFloat(a.price.replace(/[₹$,]/g, "").replace(",", "")) - parseFloat(b.price.replace(/[₹$,]/g, "").replace(",", "")));

    console.log("Filtered products:", filteredProducts);

    res.json({ success: true, filteredProducts });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
