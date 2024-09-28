// contentScript.js

try {
console.log('Content script is running');
// Function to extract data from the page
function extractArticleData() {
    const titleSelectors = ['h1', '.headline', '.article-title', '.entry-title', '.post-title', '.title'];
    const bylineSelectors = ['.author', '.byline', '.author-name', '.post-author'];
    const dateSelectors = ['time', '.publish-date', '.post-date', '.entry-date'];
    const contentSelectors = ['.article-content', '.entry-content', '.post-content', '.content'];
  
    function selectText(selectors) {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerText) {
          return element.innerText.trim();
        }
      }
      return '';
    }
  
    const title = selectText(titleSelectors) || document.title || '';
    const byline = selectText(bylineSelectors);
    const publishDate = selectText(dateSelectors);
    const content = selectText(contentSelectors);
  
    return {
      title,
      byline,
      publishDate,
      content,
      url: window.location.href
    };
  }
  
  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'extractData') {
      const articleData = extractArticleData();
      sendResponse({ data: articleData });
    }
    // Return true to indicate asynchronous response (if needed)
    return true;
  });

} catch (error) {
console.error('Error in content script:', error);
}