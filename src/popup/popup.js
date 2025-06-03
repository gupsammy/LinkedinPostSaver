// LinkedIn Post Saver Popup Script - Enhanced with Auto-Scroll

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("extractBtn");
  const statusDiv = document.getElementById("status");

  // Check if we're on LinkedIn
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];

    if (!currentTab.url.includes("linkedin.com")) {
      showStatus("Please navigate to LinkedIn first", "error");
      extractBtn.disabled = true;
      extractBtn.textContent = "Not on LinkedIn";
      return;
    }

    // Add click handler for extract button
    extractBtn.addEventListener("click", extractPostsWithAutoScroll);
  });

  // Listen for progress updates from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollProgress") {
      const progress = request.progress;

      if (progress.phase === "scrolling") {
        showStatus(progress.message, "loading");
        extractBtn.innerHTML = `<span class="spinner"></span>Loading posts... (${progress.postsFound} found)`;
      } else if (progress.phase === "completed") {
        showStatus(progress.message, "loading");
        extractBtn.innerHTML = `<span class="spinner"></span>Preparing extraction...`;
      }
    }
  });

  async function extractPostsWithAutoScroll() {
    try {
      // Disable button and show initial loading state
      extractBtn.disabled = true;
      extractBtn.innerHTML = '<span class="spinner"></span>Starting...';
      showStatus("Initializing post extraction...", "loading");

      // Get current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // First, try to check if content script is already loaded
      let response;
      try {
        console.log("Attempting to contact content script...");
        response = await sendMessageToTab(tab.id, { action: "ping" });
        console.log("Content script responded:", response);
      } catch (error) {
        console.log("Content script not responding, injecting it manually...");

        // Content script not loaded, inject it manually
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/content/content.js"],
          });

          // Wait a moment for script to initialize
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("Content script injected successfully");
        } catch (injectError) {
          throw new Error(
            "Failed to inject content script: " + injectError.message
          );
        }
      }

      // Phase 1: Auto-scroll and load all posts
      showStatus("Starting auto-scroll to load all posts...", "loading");
      extractBtn.innerHTML = '<span class="spinner"></span>Auto-scrolling...';

      console.log("Starting auto-scroll phase...");
      response = await sendMessageToTab(tab.id, {
        action: "autoScrollAndLoad",
      });

      if (!response || !response.success) {
        throw new Error(response?.error || "Auto-scroll failed");
      }

      console.log(
        `Auto-scroll completed. Total posts available: ${response.totalPosts}`
      );

      // Phase 2: Extract all the loaded posts
      showStatus(
        `Auto-scroll completed! Extracting ${response.totalPosts} posts...`,
        "loading"
      );
      extractBtn.innerHTML = '<span class="spinner"></span>Extracting posts...';

      console.log("Starting post extraction phase...");
      response = await sendMessageToTab(tab.id, { action: "extractPosts" });

      if (!response || !response.success) {
        throw new Error(response?.error || "Failed to extract posts");
      }

      console.log(`Extracted ${response.postsCount} posts successfully`);

      // Phase 3: Download the markdown file
      showStatus(
        `Successfully extracted ${response.postsCount} posts. Preparing download...`,
        "loading"
      );
      extractBtn.innerHTML = '<span class="spinner"></span>Downloading...';

      // Generate filename with current date
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `linkedin-posts-${timestamp}.md`;

      // Send markdown to background script for download
      console.log("Sending download request to background script...");
      const downloadResponse = await chrome.runtime.sendMessage({
        action: "downloadMarkdown",
        markdown: response.markdown,
        filename: filename,
      });

      if (downloadResponse && downloadResponse.success) {
        showStatus(
          `🎉 Successfully saved ${response.postsCount} posts to ${filename}!`,
          "success"
        );

        // Update button to show completion
        extractBtn.innerHTML = `✅ Saved ${response.postsCount} Posts`;

        // Auto-close popup after success
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        throw new Error(downloadResponse?.error || "Download failed");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      showStatus(`❌ Error: ${error.message}`, "error");
    } finally {
      // Reset button state after delay if still open
      setTimeout(() => {
        if (!document.hidden) {
          extractBtn.disabled = false;
          extractBtn.innerHTML = "Save Posts to File";
        }
      }, 5000);
    }
  }

  // Legacy function for backward compatibility (if needed for context menu)
  async function extractPosts() {
    try {
      // Disable button and show loading state
      extractBtn.disabled = true;
      extractBtn.innerHTML = '<span class="spinner"></span>Extracting Posts...';
      showStatus("Preparing to scan for posts...", "loading");

      // Get current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // First, try to check if content script is already loaded
      let response;
      try {
        console.log("Attempting to contact content script...");
        response = await sendMessageToTab(tab.id, { action: "ping" });
        console.log("Content script responded:", response);
      } catch (error) {
        console.log("Content script not responding, injecting it manually...");

        // Content script not loaded, inject it manually
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["src/content/content.js"],
          });

          // Wait a moment for script to initialize
          await new Promise((resolve) => setTimeout(resolve, 500));
          console.log("Content script injected successfully");
        } catch (injectError) {
          throw new Error(
            "Failed to inject content script: " + injectError.message
          );
        }
      }

      showStatus("Scanning page for posts...", "loading");

      // Now try to extract posts
      console.log("Sending extract posts message...");
      response = await sendMessageToTab(tab.id, { action: "extractPosts" });
      console.log("Extract response:", response);

      if (response && response.success) {
        showStatus(
          `Found ${response.postsCount} posts. Preparing download...`,
          "loading"
        );

        // Generate filename with current date
        const timestamp = new Date().toISOString().split("T")[0];
        const filename = `linkedin-posts-${timestamp}.md`;

        // Send markdown to background script for download
        console.log("Sending download request to background script...");
        const downloadResponse = await chrome.runtime.sendMessage({
          action: "downloadMarkdown",
          markdown: response.markdown,
          filename: filename,
        });

        if (downloadResponse && downloadResponse.success) {
          showStatus(
            `Successfully saved ${response.postsCount} posts!`,
            "success"
          );

          // Auto-close popup after success
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error(downloadResponse?.error || "Download failed");
        }
      } else {
        throw new Error(response?.error || "Failed to extract posts");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      showStatus(`Error: ${error.message}`, "error");
    } finally {
      // Reset button state
      extractBtn.disabled = false;
      extractBtn.innerHTML = "Save Posts to File";
    }
  }

  // Helper function to send message to content script with better error handling
  function sendMessageToTab(tabId, message) {
    return new Promise((resolve, reject) => {
      console.log("Sending message to tab:", tabId, message);

      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error:", chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response) {
          console.log("Received response:", response);
          resolve(response);
        } else {
          console.error("No response received from content script");
          reject(new Error("No response from content script"));
        }
      });
    });
  }

  // Helper function to show status messages
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = "block";

    // Auto-hide success/error messages after 5 seconds
    if (type === "success" || type === "error") {
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 5000);
    }
  }
});
