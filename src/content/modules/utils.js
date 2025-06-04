// Utility functions for LinkedIn Post Extraction

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after the specified time
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if element is visible on screen
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if element is visible
 */
export function isElementVisible(element) {
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

/**
 * Extract numbers from text (handles comma-separated numbers)
 * @param {string} text - Text containing numbers
 * @returns {string} - Extracted number as string, "0" if no match
 */
export function extractNumber(text) {
  const match = text.match(/(\d+(?:,\d+)*)/);
  return match ? match[1].replace(/,/g, "") : "0";
}

/**
 * Try multiple selectors until one returns an element
 * @param {Element} container - Container to search within
 * @param {Array<string>} selectors - Array of CSS selectors to try
 * @param {boolean} includeTextSearch - Whether to handle :contains() pseudo-selectors
 * @returns {Element|null} - First matching element or null
 */
export function trySelectors(container, selectors, includeTextSearch = false) {
  for (const selector of selectors) {
    try {
      let element;

      if (includeTextSearch && selector.includes(":contains(")) {
        // Handle pseudo-selector for text content
        const textToFind = selector.match(/:contains\("([^"]+)"\)/)[1];
        const elements = container.querySelectorAll(
          selector.split(":contains(")[0] || "*"
        );
        element = Array.from(elements).find((el) =>
          el.textContent.toLowerCase().includes(textToFind.toLowerCase())
        );
      } else {
        element = container.querySelector(selector);
      }

      if (element && element.textContent.trim()) {
        console.log(`Found element using selector: ${selector}`);
        return element;
      }
    } catch (error) {
      console.log(`Error with selector ${selector}:`, error);
    }
  }
  return null;
}

/**
 * Convert relative LinkedIn URLs to absolute URLs
 * @param {string} href - URL href attribute
 * @returns {string} - Absolute URL
 */
export function makeAbsoluteUrl(href) {
  if (!href) return null;
  return href.startsWith("http") ? href : `https://www.linkedin.com${href}`;
}

/**
 * Log extraction details for debugging
 * @param {string} type - Type of extraction (e.g., "author", "reactions")
 * @param {string} selector - Selector that worked
 * @param {string} value - Extracted value
 */
export function logExtraction(type, selector, value) {
  console.log(`Found ${type} using selector: ${selector} -> ${value}`);
}

/**
 * Validate that text contains time-related patterns
 * @param {string} text - Text to validate
 * @returns {boolean} - True if text appears to be time-related
 */
export function isTimeText(text) {
  return (
    text.match(/\d+\s*(minute|hour|day|week|month|year)s?\s*ago/i) ||
    text.match(/^\d+[mhdwy]$/) ||
    text.includes("ago")
  );
}
