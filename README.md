# Financial saving extension

A web extension that assists useres in viewing products from across websites and filtering them. This will help them find the most cost saving options and get the best deal.
We will further use trained AI models to predict and suggest the best time of the year to buy items.

## How to run the code

### Prerequisites
- Node.js and npm

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/nay-hey/soi_webdev.git
    ```
    or download the repository in .zip format.

2. Setting up backend:
    - Change directory:
        ```bash
        cd Pandas-main\backend
        ```
    - Install dependencies:
        ```bash
        npm install
        ```
   
    - Run the development server:
        ```bash
        node index.js
        ```
3. Adding the extension to google chrome:
    - Open `chrome://extensions/` in the google chrome web browser.
    - Click on the top right corner button to turn developer mode on.
    - Click on left top corner button titled "Load unpacked".
    - ![Extension](/Extensions.png)
    - Select "Pandas-main\extension" folder from your system and upload it.

4. Testing:
    - Open a google chrome tab and search for any item.
    - Click on extensions in the searchbar and select the Price Scraper Extension.
    - ![Extension1](/Extensions1.png)
    - Now you can filter and view search results from various websites.
