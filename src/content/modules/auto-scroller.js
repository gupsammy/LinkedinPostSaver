// Auto-scrolling functionality for LinkedIn Post Loading

import { SELECTORS } from "../config/selectors.js";
import { sleep, isElementVisible } from "./utils.js";
import { ScrollProgress, EXTRACTION_PHASES } from "../types/post-types.js";

/**
 * Auto-Scroller class handles the automatic scrolling and loading of LinkedIn posts
 */
export class AutoScroller {
  constructor() {
    this.isScrolling = false;
    this.scrollTimeout = null;
  }

  /**
   * Auto-scroll and load all posts before extraction
   * @param {Function} progressCallback - Callback function for progress updates
   * @returns {Promise<number>} - Total number of posts found
   */
  async autoScrollAndLoadAllPosts(progressCallback) {
    console.log("Starting auto-scroll to load all posts...");

    let currentPostCount = 0;
    let scrollAttempt = 0;

    this.isScrolling = true;

    try {
      // Initial count
      currentPostCount = this.getPostCount();
      progressCallback &&
        progressCallback(
          new ScrollProgress(
            EXTRACTION_PHASES.SCROLLING,
            currentPostCount,
            "Starting to load posts..."
          )
        );

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
          await sleep(800);
        }

        // Count posts again
        currentPostCount = this.getPostCount();

        progressCallback &&
          progressCallback(
            new ScrollProgress(
              EXTRACTION_PHASES.SCROLLING,
              currentPostCount,
              `Loaded ${currentPostCount} posts (attempt ${scrollAttempt})...`
            )
          );

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
        if (scrollAttempt > 500) {
          console.log("Maximum scroll attempts reached for safety");
          break;
        }
      }

      console.log(
        `Auto-scroll completed. Total posts found: ${currentPostCount}`
      );

      progressCallback &&
        progressCallback(
          new ScrollProgress(
            EXTRACTION_PHASES.COMPLETED,
            currentPostCount,
            `Finished loading all posts. Found ${currentPostCount} posts total.`
          )
        );

      return currentPostCount;
    } catch (error) {
      console.error("Error during auto-scroll:", error);
      throw error;
    } finally {
      this.isScrolling = false;
    }
  }

  /**
   * Get current number of posts on page
   * @returns {number} - Number of post containers found
   */
  getPostCount() {
    return document.querySelectorAll(SELECTORS.POST_CONTAINERS).length;
  }

  /**
   * Scroll down the page (faster)
   * @returns {Promise<void>}
   */
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
    await sleep(200);
  }

  /**
   * Check if we can scroll further down
   * @returns {boolean} - True if more scrolling is possible
   */
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

  /**
   * Check if there's a visible "Show more" button
   * @returns {boolean} - True if visible show more button exists
   */
  hasVisibleShowMoreButton() {
    for (const selector of SELECTORS.SHOW_MORE_BUTTONS) {
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

        if (button && isElementVisible(button) && !button.disabled) {
          console.log(`Found visible show more button: ${selector}`);
          return true;
        }
      } catch (error) {
        console.log(`Error checking selector ${selector}:`, error);
      }
    }

    return false;
  }

  /**
   * Wait for new content to load (faster)
   * @returns {Promise<void>}
   */
  async waitForNewContent() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 6; // Reduced from 10

      const checkForNewContent = () => {
        attempts++;

        // Check if there are any loading indicators
        const loadingIndicators = document.querySelectorAll(
          SELECTORS.LOADING_INDICATORS
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

  /**
   * Look for and click "Show more" buttons
   * @returns {Promise<boolean>} - True if button was clicked
   */
  async clickShowMoreButton() {
    for (const selector of SELECTORS.SHOW_MORE_BUTTONS) {
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

        if (button && isElementVisible(button) && !button.disabled) {
          console.log(`Found and clicking show more button: ${selector}`);
          button.click();
          await sleep(1000); // Wait for button click to take effect
          return true;
        }
      } catch (error) {
        console.log(`Error checking selector ${selector}:`, error);
      }
    }

    return false;
  }

  /**
   * Stop scrolling (if needed)
   */
  stopScrolling() {
    this.isScrolling = false;
  }
}
