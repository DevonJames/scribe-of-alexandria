// Function to fetch related articles based on tags
function fetchRelatedArticles() {
    const tags = document.getElementById('tags').value;
    logOutput("tags"+tags);
    if (!tags) {
        logOutput("No tags found, cannot fetch related articles.");
        return;
    }

    // API endpoint with tags
    const apiEndpoint = `http://localhost:3005/api/records?resolveDepth=2&tags=${encodeURIComponent(tags)}`;

    // Show loading indicator
    showLoadingIndicator(true);

    // Fetch related articles from the API
    fetch(apiEndpoint)
        .then(response => response.json())
        .then(data => {
            showLoadingIndicator(false);  // Hide loading indicator after receiving data

            // Log the received data for debugging
            console.log("Related articles fetched:", data);

            // Check if any articles were returned
            if (data.qtyReturned > 0) {

                const relatedTab = document.getElementById('Related');
                relatedTab.innerHTML = ""; // Clear only the related articles, not the whole tab structure.

                const heading = document.createElement('h3');
                heading.innerText = "Select related articles";
                relatedTab.appendChild(heading);

                // Loop to append articles (same logic as before)
                data.records.forEach(record => {
                    const index = data.records.indexOf(record);
                    const article = record.data[0].basic;
                    const articleElement = document.createElement('div');
                    articleElement.classList.add('related-article');

                    articleElement.innerHTML = `
                    <input type="checkbox" class="related-checkbox" id="article-${index}" data-url="${article.urlItems[0].data[0].associatedURLOnWeb.url}">
                    <label for="article-${index}">
                    <h4>${article.name}</h4>
                    <p>${article.description}</p>
                    <p>Published on: ${new Date(article.date * 1000).toDateString()}</p>
                    </label>
                    <a href="${article.urlItems[0].data[0].associatedURLOnWeb.url}" target="_blank">Read it</a>
                    `;
                    
                    relatedTab.appendChild(articleElement);
                });

                // const relatedTab = document.getElementById('Related');
                // relatedTab.innerHTML = "<h3>Select related articles</h3>";
                // // const relatedTabContent = document.getElementById('Related');  // Target only content, not the entire tab structure

                // // relatedTabContent.innerHTML = "<h3>Select related articles</h3>";


                // // Loop through records and append to the related tab
                // data.records.forEach(record => {
                //     const index = data.records.indexOf(record);
                //     const article = record.data[0].basic;
                //     // const post = record.data[1].post;
                //     const articleElement = document.createElement('div');
                //     articleElement.classList.add('related-article');
                    
                //     articleElement.innerHTML = `
                //     <input type="checkbox" class="related-checkbox" id="article-${index}" data-url="${article.urlItems[0].data[0].associatedURLOnWeb.url}">
                //     <label for="article-${index}">
                //     <h4>${article.name}</h4>
                //     <p>${article.description}</p>
                //     <p>Published on: ${new Date(article.date * 1000).toDateString()}</p>
                //         </label>
                //         <a href="${article.urlItems[0].data[0].associatedURLOnWeb.url}" target="_blank">Read it</a>
                //     `;
                    
                //     // Append article to the Related tab
                //     relatedTab.appendChild(articleElement);
                //     // relatedTabContent.appendChild(articleElement);

                // });

                // const tabs = document.querySelector('.tab');
                // if (!tabs) {
                //     // If for some reason tabs are removed, add them back
                //     document.querySelector('.popup-container').insertAdjacentHTML('afterbegin', `
                //         <div class="tab">
                //             <button class="tablinks" id="defaultOpen">Article</button>
                //             <button class="tablinks active">Related</button>
                //             <button class="tablinks">Settings</button>
                //         </div>
                //     `);
                // }

                // document.getElementById('relatedTab').classList.add('active'); // Ensure the active class stays

                // Add the "Summarize" button below the related articles
                const summaryButton = document.createElement('button');
                summaryButton.textContent = 'Summarize Selected Articles';
                summaryButton.addEventListener('click', summarizeSelectedArticles);  // Trigger the summarization
                relatedTab.appendChild(summaryButton);
            } else {
                document.getElementById('Related').innerHTML = "<h3>Related Articles</h3><p>No related articles found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching related articles:", error);
            alert("Failed to fetch related articles.");
            showLoadingIndicator(false);  // Hide loading indicator in case of error
        });
}

// Wait for the entire page to load
window.addEventListener('load', function () {
    const tabLinks = document.querySelectorAll('.tablinks');

    tabLinks.forEach(tab => {
        tab.addEventListener('click', function (event) {
            const tabName = event.target.innerText;
            openTab(event, tabName);
        });
    });

    // Set default tab open
    document.getElementById('defaultOpen').click();

    // Get the active tab's URL and start fetching data
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        const pageUrl = activeTab.url;
        // logOutput("Fetching Article Data at URL: " + pageUrl);
        // start backend fetching for more detailed data
        // logOutput("Sending startFetch message with URL:" + pageUrl);

        // Show loading indicator
        showLoadingIndicator(true);
        // Send message to content script to extract data
        chrome.tabs.sendMessage(activeTab.id, { action: 'extractData' }, function(response) {
            // logOutput('Response from content script:' + response.data);
            const articleData = response.data;
            if (articleData) {
                document.getElementById('byline').value = articleData.byline || "Unknown author";
                document.getElementById('headline').value = articleData.title || "No title found";
                document.getElementById('description').value = articleData.description || "No description found";
                document.getElementById('content').value = articleData.content || "No content found";
                document.getElementById('url').value = articleData.url;
                document.getElementById('domain').value = (new URL(articleData.url)).hostname.split('.').slice(-2, -1)[0] || "No domain found";
                showLoadingIndicator(false);  // Hide loading indicator
            }
            // add this to localstorage as initialData
            // chrome.storage.local.set({ 'initialData': articleData }, function() {
            //     logOutput('Initial data stored in chrome.storage.local');
            // });
        });

        chrome.runtime.sendMessage({ action: 'startFetch', url: pageUrl }, function(response) {
            // logOutput("Response from background script for startFetch:" + response);
        });      

        // // Send message to content script to extract data
        // chrome.tabs.sendMessage(activeTab.id, { action: 'extractData' }, function(response) {
        //     logOutput('Response from content script:' + response.data);
        //     const articleData = response.data;
        //     if (articleData) {
        //         document.getElementById('byline').value = articleData.byline || "Unknown author";
        //         document.getElementById('headline').value = articleData.title || "No title found";
        //         document.getElementById('description').value = articleData.description || "No description found";
        //         document.getElementById('content').value = articleData.content || "No content found";
        //         document.getElementById('url').value = articleData.url;
        //     }
        //     // add this to localstorage as initialData
        //     // chrome.storage.local.set({ 'initialData': articleData }, function() {
        //     //     logOutput('Initial data stored in chrome.storage.local');
        //     // });
        // });
            
        
        // // get data from storage
        // chrome.storage.local.get(['initialData', 'tags', 'publishDate', 'summary'], function(result) {

        //     logOutput('Data retrieved from storage:', result);
        //     if (result.initialData) {
        //         const articleData = result.initialData;
        //         document.getElementById('byline').value = articleData.byline || "Unknown author";
        //         document.getElementById('headline').value = articleData.title || "No title found";
        //         document.getElementById('description').value = articleData.description || "No description found";
        //         document.getElementById('content').value = articleData.content || "No content found";
        //         document.getElementById('url').value = articleData.url;
        //     }
        //     if (result.tags) {
        //         const tags = result.tags;
        //         document.getElementById('tags').value = tags.join(', ');
        //     }
        //     if (result.publishDate) {
        //         const publishDate = result.publishDate;
        //         document.getElementById('publish-date').value = publishDate || "Unknown date";
        //     }
        //     if (result.summary) {
        //         const summary = result.summary;
        //         document.getElementById('description').value = summary || "No description found";
        //     }
        // });
          
    });

    // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //     logOutput('Popup received message 111:' + JSON.parse(request.data));
    //     const data = request.data;
    
    //     if (request.action === 'updateData' && data) {
    //         logOutput('Data received:' + data);
    
    //         if (data.type === 'initialData' && data.payload) {
    //             const articleData = data.payload;
    //             logOutput('Initial data received:', articleData);
    //             if (articleData.byline) document.getElementById('byline').value = articleData.byline;
    //             if (articleData.title) document.getElementById('headline').value = articleData.title;
    //             if (articleData.description) document.getElementById('description').value = articleData.description;
    //             if (articleData.content) document.getElementById('content').value = articleData.content;
    //             if (articleData.url) document.getElementById('url').value = articleData.url;
    //             if (articleData.publishDate) document.getElementById('publish-date').value = articleData.publishDate;
    //         }
    
    //         if (data.type === 'tags') {
    //             const tags = data.payload;
    //             if (tags) document.getElementById('tags').value = tags.join(', ');
    //         }
    //         if (data.type === 'publishDate') {
    //             const publishDate = data.payload;
    //             if (publishDate) document.getElementById('publish-date').value = publishDate;
    //         }
    
    //         showLoadingIndicator(false);  // Hide the loading indicator once the data is processed
    //     } else if (request.action === 'error') {
    //         logOutput('Error received:' + request.message);
    //         alert('An error occurred while fetching article data.');
    //         showLoadingIndicator(false);
    //     }
    // });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // logOutput('Popup received message:' + request);
        // console.log('Popup received message:', request);
        if (request.action === 'updateData') {
            const data = request.data;
            // logOutput('Data received:' + request.action + ' ' + data.type + ' ' + data.payload); 
            // Update UI based on data.type and data.payload
            if (data.type === 'initialData') {
                
                const articleData = data.payload;
                // logOutput('Initial data received:' + articleData.byline + ' ' + articleData.title + ' ' + articleData.description + ' ' + articleData.content + ' ' + articleData.url + ' ' + articleData.publishDate);
                document.getElementById('byline').value = articleData.byline || "Unknown author";
                document.getElementById('headline').value = articleData.title || "No title found";
                document.getElementById('description').value = articleData.description || "No description found";
                document.getElementById('content').value = articleData.content || "No content found";
                document.getElementById('url').value = articleData.url || "No URL found";
                document.getElementById('domain').value = (new URL(articleData.url)).hostname.split('.').slice(-2, -1)[0] || "No domain found";
                document.getElementById('publish-date').value = articleData.publishDate || "Unknown date";
            } else if (data.type === 'byline') {
                const byline = data.payload;
                logOutput('Byline received:' + byline);
                // const articleData = data.payload;
                if (document.getElementById('byline').value = "Unknown author" ) document.getElementById('byline').value = byline;
            } else if (data.type === 'headline') {
                const headline = data.payload;
                if (!articleData.headline) document.getElementById('headline').value = headline;
            } else if (data.type === 'description') {
                const description = data.payload;
                if (!articleData.description) document.getElementById('description').value = description;
            } else if (data.type === 'content') {
                const content = data.payload;
                if (!articleData.content) document.getElementById('content').value = content;
            } else if (data.type === 'tags') {
                const tags = data.payload;
                document.getElementById('tags').value = tags.join(', ');
                showLoadingIndicator(false);  // Hide loading indicator
            } else if (data.type === 'publishDate') {
                const publishDate = data.payload;
                document.getElementById('publish-date').value = publishDate || "Unknown date";
                showLoadingIndicator(false);  // Hide loading indicator
                

            

            } else if (data.type === 'finalData') {
                showLoadingIndicator(false);  // Hide loading indicator
                const articleData = data.payload;
                // logOutput('Initial data received:' + articleData.byline + ' ' + articleData.title + ' ' + articleData.description + ' ' + articleData.content + ' ' + articleData.url + ' ' + articleData.publishDate);
                document.getElementById('byline').value = articleData.byline || "Unknown author";
                document.getElementById('headline').value = articleData.title || "No title found";
                document.getElementById('description').value = articleData.description || "No description found";
                document.getElementById('content').value = articleData.content || "No content found";
                document.getElementById('url').value = articleData.url || "No URL found";
                document.getElementById('domain').value = (new URL(articleData.url)).hostname.split('.').slice(-2, -1)[0] || "No domain found";
                document.getElementById('publish-date').value = articleData.publishDate || "Unknown date";
                document.getElementById('tags').value = articleData.tags.join(', ');
            }
            // Handle other data types...
        } else if (request.action === 'error') {
            console.error('Error received:', request.message);
            alert('An error occurred while fetching article data.');
            showLoadingIndicator(false);
        }
    });
});

// Attach event listener to the "Related" tab
document.querySelector(".tablinks:nth-child(2)").addEventListener("click", fetchRelatedArticles);


// Show or hide the loading indicator and backdrop
function showLoadingIndicator(show) {
    // show = true
    logOutput(`Loading indicator state: ${show}`);  // Add this for debugging
    const loadingIndicator = document.getElementById('loading-indicator');
    const loadingBackdrop = document.getElementById('loading-backdrop');

    if (show) {
        loadingIndicator.classList.remove('hidden');
        loadingBackdrop.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
        loadingBackdrop.classList.add('hidden');
    }
}

function openTab(event, tabName) {
    const tabcontent = document.getElementsByClassName('tabcontent');
    const tablinks = document.getElementsByClassName('tablinks');

    // Hide all tab contents
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }

    // Remove 'active' class from all tablinks
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }

    // Show the current tab and add 'active' class to the button
    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Utility function to output logs to both the console and a DOM element
function logOutput(message) {
    // console.log(message); // Standard console log

    // // Also, append logs to the body for direct visibility
    const logDiv = document.createElement('div');
    logDiv.textContent = message;
    logDiv.style.color = 'red';
    document.body.appendChild(logDiv);
}

function submitArticleToAPI() {
    showLoadingIndicator(show=true);  // Show the loading indicator

    const headline = document.getElementById('headline').value;
    const byline = document.getElementById('byline').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    const url = document.getElementById('url').value;
    const publishDateInput = document.getElementById('publish-date').value;  // Fetching the publish date
    let publishDate;
    if (publishDateInput) {
        publishDate = new Date(publishDateInput).getTime() / 1000;  // Converting to Unix timestamp
    } else {
        publishDate = Math.floor(Date.now() / 1000);  // Current timestamp
    }

    const articleData = {
        "basic": {
            "name": headline,
            "language": "en",
            "date": publishDate,  // Current timestamp or use scraped date if applicable
            "description": description,
            "urlItems": [
                {
                    "associatedUrlOnWeb": {
                        "url": url
                    }
                }
            ],
            "nsfw": false,
            "tagItems": tags
        },
        "post": {
            "bylineWriter": byline,
            "articleText": {
                "text": "Placeholder for full article text",
                "contentType": "text/markdown"
            },
            "featuredImage": {
                "basic": {
                    "name": headline,
                    "date": Math.floor(Date.now() / 1000),
                    "language": "en",
                    "nsfw": false
                },
                "image": {
                    "height": 400,
                    "width": 720,
                    "size": 50000,
                    "contentType": "image/jpeg"
                },
                "associatedUrlOnWeb": {
                    "url": "Placeholder for main image"
                }
            }
        }
    };

    const apiEndpoint = "http://localhost:3005/api/records/newRecord?recordType=post";  // Update your API URL here

    fetch(apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(articleData)
    })
    .then(response => response.json())
    .then(data => {
        const article = {
            didTx: data.didTx,
            title: headline,
            byline: byline,
            description: description,
            tags: tags,
            publishedOnUtcEpoch: publishDate,
            canonicalUrl: url,
            archivedTimestamp: Math.floor(Date.now() / 1000),
            archivedBy: "User",  // Update with user's name or ID
            interactionMetadata: {
                views: 0,
                likes: 0,
                comments: 0
            }
        }
        // for (const video)
    

        
        console.log("Article submitted:", data);
        alert("Article archived successfully!");
    })
    .catch(error => {
        console.error("Error submitting article:", error);
        alert("Failed to archive the article.");
    })
    .finally(() => {
        showLoadingIndicator(show=false);  // Hide loading indicator when done
    });
}


document.getElementById('toggle-content-btn').addEventListener('click', function() {
    const contentTextarea = document.getElementById('content');
    const toggleBtn = document.getElementById('toggle-content-btn');

    if (contentTextarea.rows === 2) {
        contentTextarea.rows = 10;  // Expand the textarea
        toggleBtn.innerText = 'Collapse';  // Change button text
    } else {
        contentTextarea.rows = 2;  // Collapse the textarea back to 2 lines
        toggleBtn.innerText = 'Expand';  // Change button text back
    }
});

// Function to collect selected articles and send them for summarization
function summarizeSelectedArticles() {
    const selectedCheckboxes = document.querySelectorAll('.related-checkbox:checked');
    
    // Collect the titles and descriptions of the selected articles
    const selectedArticles = Array.from(selectedCheckboxes).map(checkbox => {
        const articleElement = checkbox.parentElement;  // The container div for the article
        const title = articleElement.querySelector('h4').innerText;
        const description = articleElement.querySelector('p').innerText;
        
        // logOutput('Selected article:' + title + description);
        return { title, content: description };  // Use description as content for now
    });

    logOutput('Selected articles:' + JSON.stringify(selectedArticles));

    if (selectedArticles.length === 0) {
        alert('No articles selected!');
        return;
    }

    // Send the selected articles to the API for summarization
    fetch('http://localhost:3005/api/scrape/articles/summary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articles: selectedArticles }),  // Send selected articles as JSON
    })
    .then(response => response.json())
    .then(data => {
        // Display the summary result
        console.log('Summary generated:', data.summary);

        
        startSpeedReader(data.summary, 350);  // Start the speed reader with the summary text
        // startJetztReader(data.summary);
        // alert(`Summary: ${data.summary}`);  // Optionally, you can display it in the UI instead of an alert
    })
    .catch(error => {
        console.error("Error generating summary:", error);
        alert("Failed to generate summary.");
    });
}

function startSpeedReader(text, wpm) {
    const words = text.split(' ');  // Split the text into words
    const readingElement = document.getElementById('reading-container');  // Where the words will be displayed
    let currentIndex = 0;
    const interval = 60000 / wpm;  // Calculate interval based on WPM

    let readerInterval;

    // Function to display the next word
    function displayNextWord() {
        if (currentIndex < words.length) {
            readingElement.textContent = words[currentIndex];
            currentIndex++;
        } else {
            clearInterval(readerInterval);  // Stop when text is finished
        }
    }

    // Start the reader
    readerInterval = setInterval(displayNextWord, interval);

    // Controls to pause/resume
    document.getElementById('pause-btn').addEventListener('click', function() {
        clearInterval(readerInterval);
    });

    document.getElementById('resume-btn').addEventListener('click', function() {
        readerInterval = setInterval(displayNextWord, interval);
    });

    document.getElementById('speed-slider').addEventListener('input', function(e) {
        const newWpm = parseInt(e.target.value);
        clearInterval(readerInterval);
        startSpeedReader(text, newWpm);  // Restart reader with new speed
    });
}


// // Attach event listener to the "Related" tab
// document.querySelector(".tablinks:nth-child(2)").addEventListener("click", fetchRelatedArticles);
// Fetch Related Articles when the "Related" tab is clicked
// document.getElementById('relatedTab').addEventListener('click', function () {
//     fetchRelatedArticles();
// });

// document.getElementById('Related').style.display = 'block'; // Ensure it's shown when active
// Toggle Reading Container visibility
document.getElementById('brief-btn').addEventListener('click', function () {
    const briefBtn = document.getElementById('brief-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const progressBar = document.getElementById('progress-bar');
    const readingContainer = document.getElementById('reading-container');
    const dimBackground = document.querySelector('.dim-background');

    // Show the reading container and dim background
    readingContainer.classList.add('active');
    dimBackground.classList.add('active');

    // Start "reading" and update progress bar
    briefBtn.style.display = 'none';
    pauseBtn.style.display = 'block';

    let progress = 0;
    const interval = setInterval(function () {
        if (progress >= 100) {
            clearInterval(interval);
        } else {
            progress += 1;
            progressBar.style.width = progress + '%';
        }
    }, 100); // Adjust the interval speed

    pauseBtn.addEventListener('click', function () {
        clearInterval(interval);
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'block';
    });

    resumeBtn.addEventListener('click', function () {
        pauseBtn.style.display = 'block';
        resumeBtn.style.display = 'none';
        // Logic to resume reading and progress bar
    });
});

// Trigger submission when "Save Article" button is clicked
document.getElementById('archive-btn').addEventListener('click', submitArticleToAPI);
