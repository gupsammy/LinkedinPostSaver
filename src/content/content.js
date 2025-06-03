// LinkedIn Post Saver Content Script

class LinkedInPostExtractor {
  constructor() {
    this.posts = [];
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
  } else if (request.action !== "ping") {
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
