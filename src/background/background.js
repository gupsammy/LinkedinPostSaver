// LinkedIn Post Saver Background Service Worker

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedIn Post Saver extension installed");

  // Create context menu item
  chrome.contextMenus.create({
    id: "saveLinkedInPosts",
    title: "Save LinkedIn Posts",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.linkedin.com/*"],
  });

  console.log("Context menu created");
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "saveLinkedInPosts") {
    console.log("Context menu clicked, starting extraction...");
    await triggerPostExtraction(tab);
  }
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

// Common function to trigger post extraction (used by both context menu and icon click)
async function triggerPostExtraction(tab) {
  try {
    console.log("Triggering post extraction for tab:", tab.id);

    // Check if we're on LinkedIn
    if (!tab.url.includes("linkedin.com")) {
      console.log("Not on LinkedIn page");
      return;
    }

    // Try to contact existing content script first
    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: "ping" });
      console.log("Content script already loaded");
    } catch (error) {
      console.log("Content script not loaded, injecting it...");

      // Inject content script manually
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["src/content/content.js"],
      });

      // Wait for script to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Content script injected");
    }

    // Extract posts
    console.log("Sending extract posts message...");
    response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractPosts",
    });

    if (response && response.success) {
      console.log(`Found ${response.postsCount} posts, starting download...`);

      // Generate filename with current date
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `linkedin-posts-${timestamp}.md`;

      // Download the markdown
      await downloadMarkdownFile(response.markdown, filename);
      console.log("Context menu extraction completed successfully");
    } else {
      console.error("Failed to extract posts:", response?.error);
    }
  } catch (error) {
    console.error("Failed to trigger extraction:", error);
  }
}

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
  await triggerPostExtraction(tab);
});
