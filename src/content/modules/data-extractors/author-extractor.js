// Author information extraction functionality

import { SELECTORS } from "../../config/selectors.js";
import { trySelectors, makeAbsoluteUrl, logExtraction } from "../utils.js";
import { AuthorInfo } from "../../types/post-types.js";

/**
 * Author Extractor class handles extraction of author information from posts
 */
export class AuthorExtractor {
  /**
   * Extract author information from a post
   * @param {Element} postElement - Post container element
   * @returns {AuthorInfo|null} - Author information or null if not found
   */
  extractAuthorInfo(postElement) {
    let authorName = null;
    let authorDescription = null;
    let profileUrl = null;

    // Extract author name
    const nameElement = trySelectors(postElement, SELECTORS.AUTHOR_NAME);
    if (nameElement) {
      authorName = nameElement.textContent.trim();
      logExtraction("author name", "selector match", authorName);
    }

    // Extract author description
    const descElement = trySelectors(postElement, SELECTORS.AUTHOR_DESCRIPTION);
    if (descElement) {
      authorDescription = descElement.textContent.trim();
      logExtraction("author description", "selector match", authorDescription);
    }

    // Try to find profile link
    const authorLink = postElement.querySelector(SELECTORS.AUTHOR_PROFILE_LINK);
    if (authorLink) {
      profileUrl = makeAbsoluteUrl(authorLink.href);

      // If we didn't find name through specific selectors, try the link text as fallback
      if (!authorName) {
        authorName = authorLink.textContent.trim();
        logExtraction("author name", "profile link fallback", authorName);
      }
    }

    // Return author info if we found at least a name
    if (authorName) {
      return new AuthorInfo(authorName, authorDescription, profileUrl);
    }

    return null;
  }
}
