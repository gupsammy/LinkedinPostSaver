// LinkedIn Post Saver Content Script - Enhanced with Auto-Scroll

class LinkedInPostExtractor {
  constructor() {
    this.posts = [];
    this.isScrolling = false;
    this.scrollTimeout = null;
  }

  // Auto-scroll and load all posts before extraction
  async autoScrollAndLoadAllPosts(progressCallback) {
    console.log("Starting auto-scroll to load all posts...");

    let currentPostCount = 0;
    let scrollAttempt = 0;

    this.isScrolling = true;

    try {
      // Initial count
      currentPostCount = this.getPostCount();
      progressCallback &&
        progressCallback({
          phase: "scrolling",
          postsFound: currentPostCount,
          message: "Starting to load posts...",
        });

      while (this.isScrolling) {
        scrollAttempt++;

        // Scroll down to load more content
        await this.scrollDown();

        // Wait for new content to load (shorter wait time)
        await this.waitForNewContent();

        // Check for "Show more" button and click it
        const buttonClicked = await this.clickShowMoreButton();

        // Wait a bit after clicking button (shorter wait)
        if (buttonClicked) {
          await this.sleep(800);
        }

        // Count posts again
        currentPostCount = this.getPostCount();

        progressCallback &&
          progressCallback({
            phase: "scrolling",
            postsFound: currentPostCount,
            message: `Loaded ${currentPostCount} posts (attempt ${scrollAttempt})...`,
          });

        // Check if we've reached the end: can't scroll further AND no "show more" button
        const canScrollFurther = this.canScrollFurther();
        const hasShowMoreButton = this.hasVisibleShowMoreButton();

        console.log(
          `Scroll attempt ${scrollAttempt}: Posts: ${currentPostCount}, Can scroll: ${canScrollFurther}, Has button: ${hasShowMoreButton}`
        );

        if (!canScrollFurther && !hasShowMoreButton) {
          console.log(
            "Reached end: Cannot scroll further and no 'Show more' button found"
          );
          break;
        }

        // Safety check to prevent infinite scrolling
        if (scrollAttempt > 100) {
          console.log("Maximum scroll attempts reached for safety");
          break;
        }
      }

      console.log(
        `Auto-scroll completed. Total posts found: ${currentPostCount}`
      );

      progressCallback &&
        progressCallback({
          phase: "completed",
          postsFound: currentPostCount,
          message: `Finished loading all posts. Found ${currentPostCount} posts total.`,
        });

      return currentPostCount;
    } catch (error) {
      console.error("Error during auto-scroll:", error);
      throw error;
    } finally {
      this.isScrolling = false;
    }
  }

  // Get current number of posts on page
  getPostCount() {
    return document.querySelectorAll(".fie-impression-container").length;
  }

  // Scroll down the page (faster)
  async scrollDown() {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Scroll down by viewport height
    const scrollTarget = Math.min(
      currentScrollTop + windowHeight,
      documentHeight
    );

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth",
    });

    // Shorter wait for scroll to complete
    await this.sleep(400);
  }

  // Check if we can scroll further down
  canScrollFurther() {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Consider we can't scroll further if we're within 100px of the bottom
    const distanceFromBottom =
      documentHeight - (currentScrollTop + windowHeight);
    const canScroll = distanceFromBottom > 100;

    console.log(
      `Scroll check: currentTop=${currentScrollTop}, windowHeight=${windowHeight}, docHeight=${documentHeight}, distanceFromBottom=${distanceFromBottom}, canScroll=${canScroll}`
    );

    return canScroll;
  }

  // Check if there's a visible "Show more" button
  hasVisibleShowMoreButton() {
    const showMoreSelectors = [
      'button[aria-label*="Show more"]',
      'button[aria-label*="See more"]',
      'button:contains("Show more results")',
      'button:contains("See more posts")',
      ".scaffold-finite-scroll__load-button",
      '.artdeco-button--secondary:contains("Show")',
      'button[data-test-pagination-page-btn="next"]',
    ];

    for (const selector of showMoreSelectors) {
      try {
        let button;
        if (selector.includes(":contains(")) {
          const textToFind = selector.match(/:contains\("([^"]+)"\)/)[1];
          const buttons = document.querySelectorAll("button");
          button = Array.from(buttons).find((btn) =>
            btn.textContent.toLowerCase().includes(textToFind.toLowerCase())
          );
        } else {
          button = document.querySelector(selector);
        }

        if (button && this.isElementVisible(button) && !button.disabled) {
          console.log(`Found visible show more button: ${selector}`);
          return true;
        }
      } catch (error) {
        console.log(`Error checking selector ${selector}:`, error);
      }
    }

    return false;
  }

  // Wait for new content to load (faster)
  async waitForNewContent() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 6; // Reduced from 10

      const checkForNewContent = () => {
        attempts++;

        // Check if there are any loading indicators
        const loadingIndicators = document.querySelectorAll(
          '.artdeco-spinner, .skeleton-loader, [data-placeholder="loading"]'
        );

        if (loadingIndicators.length === 0 || attempts >= maxAttempts) {
          resolve();
        } else {
          setTimeout(checkForNewContent, 300); // Reduced from 500ms
        }
      };

      // Start checking after shorter initial delay
      setTimeout(checkForNewContent, 600); // Reduced from 1000ms
    });
  }

  // Look for and click "Show more" buttons
  async clickShowMoreButton() {
    // Various selectors for "Show more" buttons on LinkedIn
    const showMoreSelectors = [
      'button[aria-label*="Show more"]',
      'button[aria-label*="See more"]',
      'button:contains("Show more results")',
      'button:contains("See more posts")',
      ".scaffold-finite-scroll__load-button",
      '.artdeco-button--secondary:contains("Show")',
      'button[data-test-pagination-page-btn="next"]',
    ];

    for (const selector of showMoreSelectors) {
      try {
        // Handle pseudo-selector for text content
        let button;
        if (selector.includes(":contains(")) {
          const textToFind = selector.match(/:contains\("([^"]+)"\)/)[1];
          const buttons = document.querySelectorAll("button");
          button = Array.from(buttons).find((btn) =>
            btn.textContent.toLowerCase().includes(textToFind.toLowerCase())
          );
        } else {
          button = document.querySelector(selector);
        }

        if (button && this.isElementVisible(button) && !button.disabled) {
          console.log(`Found and clicking show more button: ${selector}`);
          button.click();
          await this.sleep(1000); // Wait for button click to take effect
          return true;
        }
      } catch (error) {
        console.log(`Error checking selector ${selector}:`, error);
      }
    }

    return false;
  }

  // Check if element is visible on screen
  isElementVisible(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const isVisible =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.top <= window.innerHeight &&
      rect.left >= 0 &&
      rect.left <= window.innerWidth;

    // Also check if element is not hidden by CSS
    const style = window.getComputedStyle(element);
    const isDisplayed =
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0";

    return isVisible && isDisplayed;
  }

  // Sleep utility function
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Convert HTML content to clean markdown
  htmlToMarkdown(element) {
    if (!element) return "";

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true);

    // Remove comment nodes
    this.removeCommentNodes(clone);

    // Process the content
    let text = this.processElement(clone);

    // Clean up extra whitespace and newlines
    text = text.replace(/\n\s*\n\s*\n/g, "\n\n"); // Max 2 consecutive newlines
    text = text.replace(/^\s+|\s+$/g, ""); // Trim start/end

    return text;
  }

  // Remove HTML comment nodes
  removeCommentNodes(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );

    const comments = [];
    let node;
    while ((node = walker.nextNode())) {
      comments.push(node);
    }

    comments.forEach((comment) => comment.remove());
  }

  // Process individual elements and convert to markdown
  processElement(element) {
    let result = "";

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        switch (node.tagName.toLowerCase()) {
          case "a":
            const href = node.getAttribute("href");
            let linkText = "";

            // Handle nested link structure in LinkedIn
            const innerLink = node.querySelector("a");
            if (innerLink) {
              linkText = innerLink.textContent.trim();
            } else {
              // Check for nested spans with content
              const spanContent = node.querySelector("span span");
              if (spanContent) {
                linkText = spanContent.textContent.trim();
              } else {
                linkText = node.textContent.trim();
              }
            }

            if (href && linkText) {
              // Convert relative URLs to absolute
              const fullUrl = href.startsWith("http")
                ? href
                : `https://www.linkedin.com${href}`;
              result += `[${linkText}](${fullUrl})`;
            } else if (linkText) {
              result += linkText;
            }
            break;

          case "br":
            result += "\n";
            break;

          case "p":
            result += this.processElement(node) + "\n\n";
            break;

          case "div":
            result += this.processElement(node);
            break;

          case "span":
            // Handle special span classes
            if (node.classList.contains("white-space-pre")) {
              result += node.textContent; // Preserve spaces
            } else if (
              node.hasAttribute("dir") &&
              node.getAttribute("dir") === "ltr"
            ) {
              // This is likely the main content span, process its children
              result += this.processElement(node);
            } else {
              // For other spans, check if they contain actual text content or just nested elements
              const textContent = node.textContent.trim();
              if (textContent && !node.querySelector("a")) {
                // If it has text and no links, just add the text
                result += textContent;
              } else {
                // Otherwise process children
                result += this.processElement(node);
              }
            }
            break;

          default:
            result += this.processElement(node);
            break;
        }
      }
    }

    return result;
  }

  // Extract author information from a post
  extractAuthorInfo(postElement) {
    // Try to find author name and profile link
    const authorLink = postElement.querySelector('a[href*="/in/"]');
    if (authorLink) {
      return {
        name: authorLink.textContent.trim(),
        profileUrl: authorLink.href.startsWith("http")
          ? authorLink.href
          : `https://www.linkedin.com${authorLink.href}`,
      };
    }
    return null;
  }

  // Extract timestamp from a post
  extractTimestamp(postElement) {
    // Look for time elements or date indicators
    const timeElement = postElement.querySelector("time");
    if (timeElement) {
      return (
        timeElement.getAttribute("datetime") || timeElement.textContent.trim()
      );
    }

    // Fallback: look for relative time text
    const timeText = postElement.querySelector('[aria-label*="ago"]');
    if (timeText) {
      return timeText.textContent.trim();
    }

    return null;
  }

  // Extract reactions count from a post
  extractReactionsCount(postContainer) {
    try {
      // The selector provided has ember111 which might be dynamic, so let's make it more flexible
      const reactionsSelectors = [
        // Original specific selector
        "#ember111 > div.social-details-social-counts.social-details-social-counts--no-vertical-padding > div > div > ul > li.social-details-social-counts__item.social-details-social-counts__reactions.social-details-social-counts__item--height-two-x.social-details-social-counts__reactions--left-aligned > button > span",
        // More flexible selectors as fallbacks
        ".social-details-social-counts__reactions > button > span",
        ".social-details-social-counts__reactions button span",
        ".social-details-social-counts__item--reactions button span",
        'li[class*="reactions"] button span',
      ];

      for (const selector of reactionsSelectors) {
        const reactionsElement = postContainer.querySelector(selector);
        if (reactionsElement) {
          const text = reactionsElement.textContent.trim();
          // Extract number from text like "123 reactions" or just "123"
          const match = text.match(/(\d+(?:,\d+)*)/);
          return match ? match[1].replace(/,/g, "") : "0";
        }
      }
      return "0";
    } catch (error) {
      console.error("Error extracting reactions count:", error);
      return "0";
    }
  }

  // Extract comments count from a post
  extractCommentsCount(postContainer) {
    try {
      // The selector provided has ember111 which might be dynamic, so let's make it more flexible
      const commentsSelectors = [
        // Original specific selector
        "#ember111 > div.social-details-social-counts.social-details-social-counts--no-vertical-padding > div > div > ul > li.display-flex.flex-grow-1.max-full-width > ul > li.social-details-social-counts__item.social-details-social-counts__comments.social-details-social-counts__item--height-two-x.social-details-social-counts__item--right-aligned > button > span",
        // More flexible selectors as fallbacks
        ".social-details-social-counts__comments > button > span",
        ".social-details-social-counts__comments button span",
        ".social-details-social-counts__item--comments button span",
        'li[class*="comments"] button span',
      ];

      for (const selector of commentsSelectors) {
        const commentsElement = postContainer.querySelector(selector);
        if (commentsElement) {
          const text = commentsElement.textContent.trim();
          // Extract number from text like "45 comments" or just "45"
          const match = text.match(/(\d+(?:,\d+)*)/);
          return match ? match[1].replace(/,/g, "") : "0";
        }
      }
      return "0";
    } catch (error) {
      console.error("Error extracting comments count:", error);
      return "0";
    }
  }

  // Extract time ago information from a post
  extractTimeAgo(postContainer) {
    try {
      // The selector provided has ember16278 which might be dynamic, so let's make it more flexible
      const timeAgoSelectors = [
        // Original specific selector
        "#ember16278 > div > div > div.fie-impression-container > div.relative > div.PmmJpOCWkoAkFJmjbmlHzAtDWdYbNtRsPxA.display-flex.align-items-flex-start.update-components-actor--with-control-menu > div > div > span > span:nth-child(1)",
        // More flexible selectors as fallbacks
        ".update-components-actor span span:nth-child(1)",
        ".update-components-actor__meta span:first-child",
        ".feed-shared-actor__meta span:first-child",
        ".update-components-actor .visually-hidden + span",
        'span[aria-hidden="true"]:contains("ago")',
        'span:contains("hour"):first',
        'span:contains("day"):first',
        'span:contains("week"):first',
        'span:contains("month"):first',
        'span:contains("year"):first',
      ];

      for (const selector of timeAgoSelectors) {
        try {
          let timeElement;
          if (selector.includes(":contains(")) {
            // Handle pseudo-selector for text content
            const textToFind = selector.match(/:contains\("([^"]+)"\)/)[1];
            const spans = postContainer.querySelectorAll("span");
            timeElement = Array.from(spans).find(
              (span) =>
                span.textContent
                  .toLowerCase()
                  .includes(textToFind.toLowerCase()) &&
                span.textContent
                  .trim()
                  .match(/\d+\s*(minute|hour|day|week|month|year)s?\s*ago/i)
            );
          } else {
            timeElement = postContainer.querySelector(selector);
          }

          if (timeElement) {
            const timeText = timeElement.textContent.trim();
            // Validate that it contains time-related text
            if (
              timeText.match(
                /\d+\s*(minute|hour|day|week|month|year)s?\s*ago/i
              ) ||
              timeText.match(/^\d+[mhdwy]$/) ||
              timeText.includes("ago")
            ) {
              console.log(
                `Found time ago using selector: ${selector} -> ${timeText}`
              );
              return timeText;
            }
          }
        } catch (error) {
          console.log(`Error with time ago selector ${selector}:`, error);
        }
      }

      // Additional fallback: look for any element containing time patterns
      const allSpans = postContainer.querySelectorAll("span");
      for (const span of allSpans) {
        const text = span.textContent.trim();
        if (
          text.match(/\d+\s*(minute|hour|day|week|month|year)s?\s*ago/i) &&
          text.length < 20
        ) {
          console.log(`Found time ago via pattern match: ${text}`);
          return text;
        }
      }

      return "Unknown time";
    } catch (error) {
      console.error("Error extracting time ago:", error);
      return "Unknown time";
    }
  }

  // Extract repost flag from a post
  extractRepostFlag(postContainer) {
    try {
      // The selector provided has ember16343 which might be dynamic, so let's make it more flexible
      const repostSelectors = [
        // Original specific selector
        "#ember16343 > div > div > div.fie-impression-container > div.relative > div.update-components-header.update-components-header--with-control-menu.update-components-header--with-divider.update-components-header--with-image.pt2.t-12.t-black--light.t-normal",
        // More flexible selectors as fallbacks
        ".update-components-header.update-components-header--with-control-menu.update-components-header--with-divider",
        ".update-components-header--with-divider",
        ".update-components-header.pt2.t-12.t-black--light",
        ".update-components-reshare-header",
        ".feed-shared-update-v2__header",
        // Look for repost/reshare indicators by text content
        '*:contains("reposted")',
        '*:contains("shared")',
        '*:contains("reshared")',
      ];

      for (const selector of repostSelectors) {
        try {
          let element;
          if (selector.includes(":contains(")) {
            // Handle pseudo-selector for text content
            const textToFind = selector.match(/:contains\("([^"]+)"\)/)[1];
            const allElements = postContainer.querySelectorAll("*");
            element = Array.from(allElements).find((el) =>
              el.textContent.toLowerCase().includes(textToFind.toLowerCase())
            );
          } else {
            element = postContainer.querySelector(selector);
          }

          if (element) {
            console.log(`Found repost indicator using selector: ${selector}`);
            return 1; // Post is a repost
          }
        } catch (error) {
          console.log(`Error with repost selector ${selector}:`, error);
        }
      }

      // Additional check: look for common repost text patterns
      const textContent = postContainer.textContent.toLowerCase();
      const repostPatterns = [
        "reposted this",
        "shared this",
        "reshared this",
        "reposted by",
        "shared by",
        "originally posted by",
      ];

      for (const pattern of repostPatterns) {
        if (textContent.includes(pattern)) {
          console.log(`Found repost via text pattern: ${pattern}`);
          return 1; // Post is a repost
        }
      }

      return 0; // Post is not a repost
    } catch (error) {
      console.error("Error extracting repost flag:", error);
      return 0; // Default to not a repost on error
    }
  }

  // Extract a single post's content
  extractPostContent(postContainer) {
    // LinkedIn's new structure: find the commentary section
    const commentaryDiv = postContainer.querySelector(
      ".update-components-text.update-components-update-v2__commentary"
    );

    if (!commentaryDiv) {
      console.log("No commentary div found in post container");
      return null;
    }

    // Find the main content span within the commentary
    const contentSpan = commentaryDiv.querySelector('span[dir="ltr"]');
    if (!contentSpan) {
      console.log("No content span found in commentary div");
      return null;
    }

    const author = this.extractAuthorInfo(postContainer);
    const timestamp = this.extractTimestamp(postContainer);
    const content = this.htmlToMarkdown(contentSpan);

    // Extract engagement metrics
    const reactionsCount = this.extractReactionsCount(postContainer);
    const commentsCount = this.extractCommentsCount(postContainer);

    // Extract new fields
    const timeAgo = this.extractTimeAgo(postContainer);
    const repostFlag = this.extractRepostFlag(postContainer);

    if (!content.trim()) {
      console.log("Content is empty after processing");
      return null;
    }

    return {
      author,
      timestamp,
      content: content.trim(),
      reactionsCount,
      commentsCount,
      timeAgo,
      repostFlag,
    };
  }

  // Main extraction function
  extractAllPosts() {
    console.log("Starting LinkedIn post extraction...");

    // Find all post containers
    const postContainers = document.querySelectorAll(
      ".fie-impression-container"
    );
    console.log(`Found ${postContainers.length} post containers`);

    this.posts = [];

    postContainers.forEach((container, index) => {
      try {
        console.log(`Processing post ${index + 1}...`);

        // Log the structure for debugging
        const commentaryDiv = container.querySelector(
          ".update-components-text.update-components-update-v2__commentary"
        );
        console.log(
          `Post ${index + 1} - Found commentary div:`,
          !!commentaryDiv
        );

        if (commentaryDiv) {
          const contentSpan = commentaryDiv.querySelector('span[dir="ltr"]');
          console.log(`Post ${index + 1} - Found content span:`, !!contentSpan);

          if (contentSpan) {
            const textContent = contentSpan.textContent.trim();
            console.log(
              `Post ${index + 1} - Content preview:`,
              textContent.substring(0, 100) + "..."
            );
          }
        }

        const postData = this.extractPostContent(container);
        if (postData) {
          console.log(`Post ${index + 1} - Successfully extracted:`, {
            authorName: postData.author?.name,
            contentLength: postData.content.length,
            timestamp: postData.timestamp,
            timeAgo: postData.timeAgo,
            isRepost: postData.repostFlag === 1,
            reactionsCount: postData.reactionsCount,
            commentsCount: postData.commentsCount,
          });
          this.posts.push({
            id: index + 1,
            ...postData,
          });
        } else {
          console.log(`Post ${index + 1} - No content extracted`);
        }
      } catch (error) {
        console.error(`Error extracting post ${index + 1}:`, error);
      }
    });

    console.log(`Successfully extracted ${this.posts.length} posts`);
    return this.posts;
  }

  // Generate markdown content
  generateMarkdown() {
    const currentUrl = window.location.href;
    const currentDate = new Date().toISOString().split("T")[0];

    let markdown = `# LinkedIn Posts Export\n\n`;
    markdown += `**Source:** ${currentUrl}\n`;
    markdown += `**Exported:** ${currentDate}\n`;
    markdown += `**Total Posts:** ${this.posts.length}\n\n`;
    markdown += `---\n\n`;

    this.posts.forEach((post) => {
      markdown += `## Post ${post.id}\n\n`;

      if (post.author) {
        markdown += `**Author:** [${post.author.name}](${post.author.profileUrl})\n`;
      }

      if (post.timestamp) {
        markdown += `**Posted:** ${post.timestamp}\n`;
      }

      // Add time ago information
      if (post.timeAgo) {
        markdown += `**Time Ago:** ${post.timeAgo}\n`;
      }

      // Add repost flag
      markdown += `**Is Repost:** ${post.repostFlag === 1 ? "Yes" : "No"}\n`;

      // Add engagement metrics
      markdown += `**Reactions:** ${post.reactionsCount || "0"}\n`;
      markdown += `**Comments:** ${post.commentsCount || "0"}\n`;

      markdown += `\n${post.content}\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
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
    // New action for auto-scrolling and loading posts
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
console.log("LinkedIn Post Saver content script loaded and ready");

// Also add a way to check if content script is ready
window.linkedinPostSaverReady = true;
