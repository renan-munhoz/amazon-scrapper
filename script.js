// Add event listener to the form to handle form submission
document.getElementById('searchForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Get the keyword entered by the user
    const keyword = document.getElementById('keyword').value;
    // Get the results container
    const results = document.getElementById('results');
    // Get the loading indicator
    const loading = document.getElementById('loading');

    // Clear any previous results
    results.innerHTML = '';
    // Show the loading indicator
    loading.classList.remove('hidden');

    try {
        // Make a GET request to the API with the keyword
        const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Parse the JSON response
        const data = await response.json();
        console.log(data); // Log the response data

        // Check if products were found in the response
        if (!data.products) {
            throw new Error('No products found in the response');
        }

        // Filter out products with all "N/A" values and create product elements
        data.products
            .filter(product => product.title !== 'N/A' || product.rating !== 'N/A' || product.reviews !== 'N/A' || product.image !== 'N/A')
            .forEach(product => {
                const productElement = document.createElement('div');
                productElement.classList.add('product');
                productElement.innerHTML = `
                    <h2>${product.title}</h2>
                    <p>Rating: ${product.rating}</p>
                    <p>Reviews: ${product.reviews}</p>
                    <img src="${product.image}" alt="${product.title}">
                `;
                results.appendChild(productElement);
            });
    } catch (error) {
        // Log any errors and display the error message in the results container
        console.error(error);
        results.innerHTML = `<p>Error: ${error.message}</p>`;
    } finally {
        // Hide the loading indicator
        loading.classList.add('hidden');
    }
});
