// HTML to Markdown conversion functionality

import { makeAbsoluteUrl } from "./utils.js";

/**
 * HTML Processor class handles conversion of HTML content to clean markdown
 */
export class HtmlProcessor {
  /**
   * Convert HTML content to clean markdown
   * @param {Element} element - DOM element to convert
   * @returns {string} - Markdown formatted text
   */
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

  /**
   * Remove HTML comment nodes
   * @param {Element} element - Element to clean
   */
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

  /**
   * Process individual elements and convert to markdown
   * @param {Element} element - Element to process
   * @returns {string} - Processed text content
   */
  processElement(element) {
    let result = "";

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        result += this.processElementNode(node);
      }
    }

    return result;
  }

  /**
   * Process a specific element node based on its tag type
   * @param {Element} node - Element node to process
   * @returns {string} - Processed content for the node
   */
  processElementNode(node) {
    switch (node.tagName.toLowerCase()) {
      case "a":
        return this.processLinkElement(node);
      case "br":
        return "\n";
      case "p":
        return this.processElement(node) + "\n\n";
      case "div":
        return this.processElement(node);
      case "span":
        return this.processSpanElement(node);
      default:
        return this.processElement(node);
    }
  }

  /**
   * Process link (anchor) elements
   * @param {Element} node - Link element to process
   * @returns {string} - Markdown formatted link or text
   */
  processLinkElement(node) {
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
      const fullUrl = makeAbsoluteUrl(href);
      return `[${linkText}](${fullUrl})`;
    } else if (linkText) {
      return linkText;
    }

    return "";
  }

  /**
   * Process span elements with special handling for different types
   * @param {Element} node - Span element to process
   * @returns {string} - Processed span content
   */
  processSpanElement(node) {
    // Handle special span classes
    if (node.classList.contains("white-space-pre")) {
      return node.textContent; // Preserve spaces
    } else if (node.hasAttribute("dir") && node.getAttribute("dir") === "ltr") {
      // This is likely the main content span, process its children
      return this.processElement(node);
    } else {
      // For other spans, check if they contain actual text content or just nested elements
      const textContent = node.textContent.trim();
      if (textContent && !node.querySelector("a")) {
        // If it has text and no links, just add the text
        return textContent;
      } else {
        // Otherwise process children
        return this.processElement(node);
      }
    }
  }
}
