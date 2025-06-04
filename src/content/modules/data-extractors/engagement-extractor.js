// Engagement metrics extraction functionality

import { SELECTORS } from "../../config/selectors.js";
import { trySelectors, extractNumber } from "../utils.js";

/**
 * Engagement Extractor class handles extraction of engagement metrics from posts
 */
export class EngagementExtractor {
  /**
   * Extract reactions count from a post
   * @param {Element} postContainer - Post container element
   * @returns {string} - Reactions count as string, "0" if not found
   */
  extractReactionsCount(postContainer) {
    try {
      const reactionsElement = trySelectors(postContainer, SELECTORS.REACTIONS);
      if (reactionsElement) {
        const text = reactionsElement.textContent.trim();
        return extractNumber(text);
      }
      return "0";
    } catch (error) {
      console.error("Error extracting reactions count:", error);
      return "0";
    }
  }

  /**
   * Extract comments count from a post
   * @param {Element} postContainer - Post container element
   * @returns {string} - Comments count as string, "0" if not found
   */
  extractCommentsCount(postContainer) {
    try {
      const commentsElement = trySelectors(postContainer, SELECTORS.COMMENTS);
      if (commentsElement) {
        const text = commentsElement.textContent.trim();
        return extractNumber(text);
      }
      return "0";
    } catch (error) {
      console.error("Error extracting comments count:", error);
      return "0";
    }
  }
}
