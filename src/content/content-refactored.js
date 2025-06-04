// LinkedIn Post Saver Content Script - Refactored with Modular Architecture

import { AutoScroller } from "./modules/auto-scroller.js";
import { PostExtractor } from "./modules/post-extractor.js";
import { MarkdownGenerator } from "./modules/markdown-generator.js";
import { ScrollProgress, EXTRACTION_PHASES } from "./types/post-types.js";

/**
 * Main LinkedIn Post Extractor class - orchestrates all functionality
 */
class LinkedInPostExtractor {
  constructor() {
    this.autoScroller = new AutoScroller();
    this.postExtractor = new PostExtractor();
    this.markdownGenerator = new MarkdownGenerator();
  }

  /**
   * Auto-scroll and load all posts before extraction
   * @param {Function} progressCallback - Callback function for progress updates
   * @returns {Promise<number>} - Total number of posts found
   */
  async autoScrollAndLoadAllPosts(progressCallback) {
    return await this.autoScroller.autoScrollAndLoadAllPosts(progressCallback);
  }

  /**
   * Extract all posts from the current page
   * @returns {Array<PostData>} - Array of extracted posts
   */
  extractAllPosts() {
    return this.postExtractor.extractAllPosts();
  }

  /**
   * Generate markdown from extracted posts
   * @returns {string} - Generated markdown content
   */
  generateMarkdown() {
    const posts = this.postExtractor.getPosts();
    return this.markdownGenerator.generateMarkdown(posts);
  }

  /**
   * Get the current posts count
   * @returns {number} - Number of posts
   */
  getPostsCount() {
    return this.postExtractor.getPosts().length;
  }

  /**
   * Clear all extracted posts
   */
  clearPosts() {
    this.postExtractor.clearPosts();
  }

  /**
   * Stop any ongoing operations
   */
  stop() {
    this.autoScroller.stopScrolling();
  }
}

// Create extractor instance
const extractor = new LinkedInPostExtractor();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request);

  if (request.action === "ping") {
    console.log("Responding to ping");
    sendResponse({ success: true, message: "Content script is ready" });
    return true;
  }

  if (request.action === "autoScrollAndLoad") {
    // Auto-scrolling and loading posts
    extractor
      .autoScrollAndLoadAllPosts((progress) => {
        // Send progress updates back to popup
        chrome.runtime.sendMessage({
          action: "scrollProgress",
          progress: progress,
        });
      })
      .then((totalPosts) => {
        sendResponse({
          success: true,
          totalPosts: totalPosts,
          message: "Auto-scroll completed",
        });
      })
      .catch((error) => {
        console.error("Auto-scroll error:", error);
        sendResponse({
          success: false,
          error: error.message,
        });
      });

    return true; // Keep message channel open for async response
  }

  if (request.action === "extractPosts") {
    try {
      const posts = extractor.extractAllPosts();
      const markdown = extractor.generateMarkdown();

      console.log(`Extracted ${posts.length} posts, sending response`);

      sendResponse({
        success: true,
        postsCount: posts.length,
        markdown: markdown,
      });
    } catch (error) {
      console.error("Extraction error:", error);
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  } else if (
    request.action !== "ping" &&
    request.action !== "autoScrollAndLoad"
  ) {
    console.log("Unknown action:", request.action);
    sendResponse({
      success: false,
      error: "Unknown action",
    });
  }

  return true; // Keep message channel open for async response
});

// Send a ready signal to confirm content script is loaded
console.log("LinkedIn Post Saver content script (refactored) loaded and ready");

// Also add a way to check if content script is ready
window.linkedinPostSaverReady = true;

// Export for potential future use
export { LinkedInPostExtractor };
