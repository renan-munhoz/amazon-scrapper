const express = require('express'); // Import express module
const cors = require('cors'); // Import cors module for enabling CORS
const puppeteer = require('puppeteer'); // Import puppeteer module for web scraping

const app = express(); // Create an instance of express
const PORT = process.env.PORT || 3000; // Define the port number

app.use(cors()); // Enable CORS for all routes

// Define a route for scraping Amazon search results
app.get('/api/scrape', async (req, res) => {
    const keyword = req.query.keyword; // Get the keyword from query parameters
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' }); // Return an error if keyword is not provided
    }

    try {
        // Launch a headless browser instance
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage(); // Open a new page
        await page.goto(`https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`, {
            waitUntil: 'networkidle2', // Wait until the network is idle
        });

        // Evaluate the page content and extract product details
        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.s-main-slot .s-result-item')).map(item => {
                const title = item.querySelector('h2 .a-text-normal')?.textContent || 'N/A';
                const rating = item.querySelector('.a-icon-alt')?.textContent || 'N/A';
                const reviews = item.querySelector('.a-size-small .a-size-base')?.textContent || 'N/A';
                const image = item.querySelector('.s-image')?.src || 'N/A';

                return { title, rating, reviews, image };
            });
        });

        await browser.close(); // Close the browser
        console.log({ keyword, products }); // Log the response
        res.json({ keyword, products }); // Send the response back to the client
    } catch (error) {
        console.error(error); // Log any errors
        res.status(500).json({ error: 'Failed to scrape Amazon' }); // Return an error response
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
