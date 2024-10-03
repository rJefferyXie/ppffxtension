chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  fetch('https://ppffxtensionpw.onrender.com/api/mistral', {  // Updated API endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages: request.messages }),
  })
    .then(response => {
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Read the stream and send chunks back to the content script
        const processStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log('Stream complete');
              return;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Send each chunk to the content script progressively
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { streamChunk: chunk }); // Send chunk to content script
              } else {
                console.error('No active tab found');
              }
            });

            // Continue reading the next chunk
            processStream();
          });
        };

        processStream(); // Start processing the stream
      } else {
        console.error('No response body to read.');
        sendResponse({ error: 'No response body to read.' });
      }
    })
    .catch(error => {
      console.error("Error fetching data:", error); // Log any errors
      sendResponse({ error: error.message });
    });

  return true; // Keep the message channel open for sendResponse
});
