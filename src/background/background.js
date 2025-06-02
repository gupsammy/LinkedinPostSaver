// LinkedIn Post Saver Background Service Worker

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Post Saver extension installed");
});

// Handle download requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);

  if (request.action === "downloadMarkdown") {
    downloadMarkdownFile(request.markdown, request.filename)
      .then(() => {
        console.log("Download completed successfully");
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Download error:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }
});

// Download markdown content as a file
async function downloadMarkdownFile(markdownContent, filename) {
  try {
    console.log("Starting download process...");

    // Create data URL from markdown content
    const dataUrl = createDataUrl(markdownContent, "text/markdown");

    // Generate filename if not provided
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      filename = `linkedin-posts-${timestamp}.md`;
    }

    // Ensure .md extension
    if (!filename.endsWith(".md")) {
      filename += ".md";
    }

    console.log("Triggering download for:", filename);

    // Trigger download
    await chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true,
    });

    console.log(`Successfully downloaded: ${filename}`);
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
}

// Create data URL from content
function createDataUrl(content, mimeType = "text/plain") {
  try {
    // Encode content as base64 to handle special characters properly
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    return `data:${mimeType};charset=utf-8;base64,${base64Content}`;
  } catch (error) {
    console.error("Error creating data URL:", error);
    throw error;
  }
}

// Handle extension icon click (alternative trigger)
chrome.action.onClicked.addListener(async (tab) => {
  console.log("Extension icon clicked, tab URL:", tab.url);

  // Check if we're on LinkedIn
  if (!tab.url.includes("linkedin.com")) {
    console.log("Not on LinkedIn page");
    return;
  }

  try {
    console.log("Injecting content script via icon click...");

    // Inject content script if not already present and extract posts
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/content.js"],
    });

    // Wait for script to load
    setTimeout(async () => {
      try {
        // Send message to content script to extract posts
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "extractPosts",
        });

        if (response && response.success) {
          const timestamp = new Date().toISOString().split("T")[0];
          const filename = `linkedin-posts-${timestamp}.md`;

          // Download the markdown
          await downloadMarkdownFile(response.markdown, filename);
          console.log("Auto-extraction completed via icon click");
        }
      } catch (error) {
        console.error("Failed to auto-extract via icon click:", error);
      }
    }, 1000);
  } catch (error) {
    console.error("Failed to trigger extraction via icon click:", error);
  }
});
