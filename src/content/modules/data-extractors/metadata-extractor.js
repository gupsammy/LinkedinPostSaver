// Metadata extraction functionality (timestamps, repost flags, etc.)

import {
  SELECTORS,
  REPOST_PATTERNS,
  TIME_PATTERN,
} from "../../config/selectors.js";
import { trySelectors, isTimeText, logExtraction } from "../utils.js";

/**
 * Metadata Extractor class handles extraction of post metadata
 */
export class MetadataExtractor {
  /**
   * Extract timestamp from a post
   * @param {Element} postElement - Post container element
   * @returns {string|null} - Timestamp or null if not found
   */
  extractTimestamp(postElement) {
    // Look for time elements or date indicators
    const timeElement = postElement.querySelector(SELECTORS.TIME_ELEMENT);
    if (timeElement) {
      return (
        timeElement.getAttribute("datetime") || timeElement.textContent.trim()
      );
    }

    // Fallback: look for relative time text
    const timeText = postElement.querySelector(SELECTORS.TIME_ARIA_LABEL);
    if (timeText) {
      return timeText.textContent.trim();
    }

    return null;
  }

  /**
   * Extract time ago information from a post
   * @param {Element} postContainer - Post container element
   * @returns {string} - Time ago text, "Unknown time" if not found
   */
  extractTimeAgo(postContainer) {
    try {
      // Try the configured selectors first
      for (const selector of SELECTORS.TIME_AGO) {
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
                span.textContent.trim().match(TIME_PATTERN)
            );
          } else {
            timeElement = postContainer.querySelector(selector);
          }

          if (timeElement) {
            const timeText = timeElement.textContent.trim();
            // Validate that it contains time-related text
            if (isTimeText(timeText)) {
              logExtraction("time ago", selector, timeText);
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
        if (text.match(TIME_PATTERN) && text.length < 20) {
          logExtraction("time ago", "pattern match", text);
          return text;
        }
      }

      return "Unknown time";
    } catch (error) {
      console.error("Error extracting time ago:", error);
      return "Unknown time";
    }
  }

  /**
   * Extract repost flag from a post
   * @param {Element} postContainer - Post container element
   * @returns {number} - 1 if post is a repost, 0 if not
   */
  extractRepostFlag(postContainer) {
    try {
      // Check configured selectors
      for (const selector of SELECTORS.REPOST_INDICATORS) {
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
            logExtraction("repost indicator", selector, "found");
            return 1; // Post is a repost
          }
        } catch (error) {
          console.log(`Error with repost selector ${selector}:`, error);
        }
      }

      // Additional check: look for common repost text patterns
      const textContent = postContainer.textContent.toLowerCase();
      for (const pattern of REPOST_PATTERNS) {
        if (textContent.includes(pattern)) {
          logExtraction("repost", `text pattern: ${pattern}`, "found");
          return 1; // Post is a repost
        }
      }

      return 0; // Post is not a repost
    } catch (error) {
      console.error("Error extracting repost flag:", error);
      return 0; // Default to not a repost on error
    }
  }
}
