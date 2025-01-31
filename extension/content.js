chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeProducts") {
        let products = [];
        document.querySelectorAll('.sh-dgr__grid-result').forEach(card => {
            let title = card.querySelector('.sh-np__product-title').innerText || "";
            let price = card.querySelector('.a8Pemb').innerText || "";
            let link = card.querySelector('a').href || "";
            let rating = card.querySelector('.sh-dgr__rating-stars')?.getAttribute('aria-label') || "No rating";
            products.push({ title, price, link, rating });
        });
        sendResponse(products);
    }
});
