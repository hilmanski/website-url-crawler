const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

// Feel free to update with your own website URL
const websiteUrl = 'https://example.com';

async function scrapeWebsite(websiteUrl) {
  const visitedUrls = new Set();
  const urlsToVisit = [websiteUrl];
  const allLinks = new Set();

  while (urlsToVisit.length > 0) {
    const currentUrl = urlsToVisit.pop();

    if (visitedUrls.has(currentUrl)) continue;

    try {
      console.log(`Scraping: ${currentUrl}`);
      const response = await axios.get(currentUrl, { timeout: 10000 });
      visitedUrls.add(currentUrl);

      const $ = cheerio.load(response.data);

      $('a').each((i, link) => {
        const href = $(link).attr('href');
        if (href) {
          const absoluteUrl = url.resolve(websiteUrl, href);
          const parsedUrl = new URL(absoluteUrl);
          
          // Only process URLs from the same website
          if (parsedUrl.hostname === new URL(websiteUrl).hostname) {
            allLinks.add(absoluteUrl);
            if (!visitedUrls.has(absoluteUrl) && !urlsToVisit.includes(absoluteUrl)) {
              urlsToVisit.push(absoluteUrl);
            }
          }
        }
      });

      // Wait for a second before making the next request (Optional)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error scraping ${currentUrl}:`, error.message);
    }
  }

  return Array.from(allLinks);
}

scrapeWebsite(websiteUrl)
  .then(urls => {
    console.log('Scraped URLs:');
    urls.forEach(url => console.log(url));
    console.log(`Total unique URLs found: ${urls.length}`);
  })
  .catch(error => {
    console.error('Error:', error);
  });