console.log('Background script is running');


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background script received a message:', request);
    if (request.action === 'startFetch') {
        console.log('Received startFetch message with URL:', request.url);
        const pageUrl = request.url;
        startFetch(pageUrl);
        sendResponse({ status: 'Fetch started' });
    } else {
        sendResponse({ status: 'Unknown action' });
    }
});

let eventSource;
function startFetch(pageUrl) {
    if (eventSource) {
        eventSource.close();  // Close any existing EventSource connections
    }

    const apiEndpoint = `http://localhost:3005/api/scrape/article/stream?url=${encodeURIComponent(pageUrl)}`;
    console.log(`Starting fetch for API endpoint: ${apiEndpoint}`);

    eventSource = new EventSource(apiEndpoint);

    eventSource.onopen = () => {
        console.log('EventSource connection opened');
    };
    
    eventSource.addEventListener('initialData', function(event) {
      const articleData = JSON.parse(event.data);
      console.log('Initial data received by background.js:', articleData);
        // Store data in chrome.storage.local
        // chrome.storage.local.set({ 'initialData': articleData }, function() {
        //     console.log('Initial data stored in chrome.storage.local');
        // });
            console.log('Sending initialData to popup:', articleData);

            chrome.runtime.sendMessage({ action: 'updateData', data: { type: 'initialData', payload: articleData } });
        });

    eventSource.addEventListener('byline', function(event) {
        const byline = JSON.parse(event.data);
        console.log('Byline received:', byline);
        chrome.runtime.sendMessage({ action: 'updateData', data: { type: 'byline', payload: byline } });
    });

    eventSource.addEventListener('summary', function(event) {
      const summary = JSON.parse(event.data);
        console.log('Summary received:', summary); 
      chrome.runtime.sendMessage({ action: 'updateData', data: { type: 'summary', payload: summary } });
    });

    eventSource.addEventListener('tags', function(event) {
      const tags = JSON.parse(event.data);
      console.log('Tags received:', tags);
      chrome.runtime.sendMessage({ action: 'updateData', data: { type: 'tags', payload: tags } });
    });

    eventSource.addEventListener('publishDate', function(event) {
      const publishDate = JSON.parse(event.data);
        console.log('Publish date received:', publishDate);
      chrome.runtime.sendMessage({ action: 'updateData', data: { type: 'publishDate', payload: publishDate } });
    });

    eventSource.addEventListener('finalData', function(event) {
        const articleData = JSON.parse(event.data);
        chrome.runtime.sendMessage({ action: 'updateData', data: { type: 'finalData', payload: articleData } });
        eventSource.close();
      });

      eventSource.onerror = (event) => {
        console.error('Error received in EventSource:', event);
        eventSource.close();
    };
  
    }


  