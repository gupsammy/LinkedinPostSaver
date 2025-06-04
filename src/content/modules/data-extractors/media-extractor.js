// Media type extraction functionality

import { SELECTORS } from "../../config/selectors.js";
import { MEDIA_TYPES } from "../../types/post-types.js";

/**
 * Media Extractor class handles detection of media types in posts
 */
export class MediaExtractor {
  /**
   * Extract media type from a post (Image, Video, Document, or None)
   * @param {Element} postContainer - Post container element
   * @returns {string} - Media type from MEDIA_TYPES enum
   */
  extractMediaType(postContainer) {
    try {
      // First, look for the main content container where media is housed
      let mediaContainer = null;
      for (const containerSelector of SELECTORS.MEDIA_CONTAINERS) {
        mediaContainer = postContainer.querySelector(containerSelector);
        if (mediaContainer) {
          console.log(`Found media container using: ${containerSelector}`);
          break;
        }
      }

      if (!mediaContainer) {
        console.log("No media container found");
        return MEDIA_TYPES.NONE;
      }

      // Check the media container itself first, then its children
      const elementsToCheck = [
        mediaContainer,
        ...mediaContainer.querySelectorAll("*"),
      ];

      for (const element of elementsToCheck) {
        const mediaType = this.detectMediaFromElement(element);
        if (mediaType !== MEDIA_TYPES.NONE) {
          return mediaType;
        }
      }

      // Fallback checks for edge cases
      return this.performFallbackMediaChecks(mediaContainer);
    } catch (error) {
      console.error("Error extracting media type:", error);
      return MEDIA_TYPES.NONE;
    }
  }

  /**
   * Detect media type from a specific element's class list
   * @param {Element} element - Element to check
   * @returns {string} - Detected media type or NONE
   */
  detectMediaFromElement(element) {
    const classList = element.className;
    if (!classList || typeof classList !== "string") {
      return MEDIA_TYPES.NONE;
    }

    // Use regex to find update-components patterns
    const componentMatches = classList.match(/update-components-[^\s]+/g);

    if (componentMatches && componentMatches.length > 0) {
      for (const match of componentMatches) {
        console.log(`Found component class: ${match}`);

        const componentType = this.extractComponentType(match);
        if (componentType) {
          const mediaType = this.mapComponentToMediaType(
            componentType,
            classList
          );
          if (mediaType !== MEDIA_TYPES.NONE) {
            return mediaType;
          }
        }
      }
    }

    return MEDIA_TYPES.NONE;
  }

  /**
   * Extract component type from update-components class
   * @param {string} match - Class name match
   * @returns {string} - Component type
   */
  extractComponentType(match) {
    if (match.includes("update-components-linkedin-video")) {
      return "linkedin-video";
    } else if (match.includes("update-components-document")) {
      return "document";
    } else if (match.includes("update-components-image")) {
      return "image";
    } else if (match.includes("update-components-video")) {
      return "video";
    } else if (match.includes("update-components-article")) {
      return "article";
    } else if (match.includes("update-components-poll")) {
      return "poll";
    } else if (match.includes("update-components-event")) {
      return "event";
    } else {
      // Fallback: extract the first word after update-components-
      const typeMatch = match.match(/update-components-([^-_\s]+)/);
      if (typeMatch && typeMatch[1]) {
        return typeMatch[1].toLowerCase();
      }
    }
    return "";
  }

  /**
   * Map component type to media type
   * @param {string} componentType - Component type
   * @param {string} classList - Full class list for additional checks
   * @returns {string} - Media type from MEDIA_TYPES enum
   */
  mapComponentToMediaType(componentType, classList) {
    console.log(`Extracted component type: ${componentType}`);

    switch (componentType) {
      case "image":
        // Further check for specific image types
        if (classList.includes("update-components-image--single-image")) {
          console.log("Detected: Single Image");
          return MEDIA_TYPES.IMAGE;
        } else if (
          classList.includes("update-components-image--multiple-images") ||
          classList.includes("update-components-image--carousel")
        ) {
          console.log("Detected: Multiple Images/Carousel");
          return MEDIA_TYPES.IMAGE;
        } else {
          console.log("Detected: Generic Image");
          return MEDIA_TYPES.IMAGE;
        }

      case "linkedin-video":
      case "linkedin":
      case "video":
        console.log("Detected: Video");
        return MEDIA_TYPES.VIDEO;

      case "document":
        console.log("Detected: Document");
        return MEDIA_TYPES.DOCUMENT;

      case "article":
        console.log("Detected: Article");
        return MEDIA_TYPES.ARTICLE;

      case "poll":
        console.log("Detected: Poll");
        return MEDIA_TYPES.POLL;

      case "event":
        console.log("Detected: Event");
        return MEDIA_TYPES.EVENT;

      default:
        // For future unknown types, return the component type capitalized
        console.log(`Detected: Unknown type - ${componentType}`);
        return componentType.charAt(0).toUpperCase() + componentType.slice(1);
    }
  }

  /**
   * Perform fallback checks for media when component detection fails
   * @param {Element} mediaContainer - Media container element
   * @returns {string} - Detected media type or NONE
   */
  performFallbackMediaChecks(mediaContainer) {
    // Check for video elements or video-related attributes
    const videoElements = mediaContainer.querySelectorAll(
      SELECTORS.MEDIA_FALLBACK.VIDEO
    );
    if (videoElements.length > 0) {
      console.log("Found video via fallback check");
      return MEDIA_TYPES.VIDEO;
    }

    // Check for image elements (but be more specific)
    const imageElements = mediaContainer.querySelectorAll(
      SELECTORS.MEDIA_FALLBACK.IMAGE
    );
    if (imageElements.length > 0) {
      // Make sure it's not just a profile picture or icon
      for (const img of imageElements) {
        if (this.isContentImage(img)) {
          console.log("Found content image via fallback check");
          return MEDIA_TYPES.IMAGE;
        }
      }
    }

    // Check for document indicators
    const documentElements = mediaContainer.querySelectorAll(
      SELECTORS.MEDIA_FALLBACK.DOCUMENT
    );
    if (documentElements.length > 0) {
      console.log("Found document via fallback check");
      return MEDIA_TYPES.DOCUMENT;
    }

    console.log("No media detected - post appears to be text-only");
    return MEDIA_TYPES.NONE;
  }

  /**
   * Check if an image element is content (not UI/profile picture)
   * @param {Element} img - Image element to check
   * @returns {boolean} - True if it's a content image
   */
  isContentImage(img) {
    const src = img.getAttribute("src") || "";
    const alt = img.getAttribute("alt") || "";

    // Skip profile pictures, icons, and UI elements
    return (
      !src.includes("profile-displayphoto") &&
      !src.includes("icon") &&
      !alt.toLowerCase().includes("profile") &&
      !img.closest(".update-components-actor")
    );
  }
}
