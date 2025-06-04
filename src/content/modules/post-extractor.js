// Main post extraction orchestrator

import { SELECTORS } from "../config/selectors.js";
import { PostData, EXTRACTION_PHASES } from "../types/post-types.js";
import { HtmlProcessor } from "./html-processor.js";
import { AuthorExtractor } from "./data-extractors/author-extractor.js";
import { EngagementExtractor } from "./data-extractors/engagement-extractor.js";
import { MetadataExtractor } from "./data-extractors/metadata-extractor.js";
import { MediaExtractor } from "./data-extractors/media-extractor.js";

/**
 * Post Extractor class orchestrates the extraction of all post data
 */
export class PostExtractor {
  constructor() {
    this.posts = [];
    this.htmlProcessor = new HtmlProcessor();
    this.authorExtractor = new AuthorExtractor();
    this.engagementExtractor = new EngagementExtractor();
    this.metadataExtractor = new MetadataExtractor();
    this.mediaExtractor = new MediaExtractor();
  }

  /**
   * Extract a single post's content
   * @param {Element} postContainer - Post container element
   * @returns {PostData|null} - Extracted post data or null if extraction failed
   */
  extractPostContent(postContainer) {
    // LinkedIn's new structure: find the commentary section
    const commentaryDiv = postContainer.querySelector(SELECTORS.COMMENTARY_DIV);

    if (!commentaryDiv) {
      console.log("No commentary div found in post container");
      return null;
    }

    // Find the main content span within the commentary
    const contentSpan = commentaryDiv.querySelector(SELECTORS.CONTENT_SPAN);
    if (!contentSpan) {
      console.log("No content span found in commentary div");
      return null;
    }

    // Extract all post data using specialized extractors
    const author = this.authorExtractor.extractAuthorInfo(postContainer);
    const timestamp = this.metadataExtractor.extractTimestamp(postContainer);
    const content = this.htmlProcessor.htmlToMarkdown(contentSpan);

    // Extract engagement metrics
    const reactionsCount =
      this.engagementExtractor.extractReactionsCount(postContainer);
    const commentsCount =
      this.engagementExtractor.extractCommentsCount(postContainer);

    // Extract additional metadata
    const timeAgo = this.metadataExtractor.extractTimeAgo(postContainer);
    const repostFlag = this.metadataExtractor.extractRepostFlag(postContainer);
    const mediaType = this.mediaExtractor.extractMediaType(postContainer);

    if (!content.trim()) {
      console.log("Content is empty after processing");
      return null;
    }

    return new PostData({
      author,
      timestamp,
      content: content.trim(),
      reactionsCount,
      commentsCount,
      timeAgo,
      repostFlag,
      mediaType,
    });
  }

  /**
   * Main extraction function to extract all posts on the page
   * @returns {Array<PostData>} - Array of extracted posts
   */
  extractAllPosts() {
    console.log("Starting LinkedIn post extraction...");

    // Find all post containers
    const postContainers = document.querySelectorAll(SELECTORS.POST_CONTAINERS);
    console.log(`Found ${postContainers.length} post containers`);

    this.posts = [];

    postContainers.forEach((container, index) => {
      try {
        console.log(`Processing post ${index + 1}...`);

        // Log the structure for debugging
        const commentaryDiv = container.querySelector(SELECTORS.COMMENTARY_DIV);
        console.log(
          `Post ${index + 1} - Found commentary div:`,
          !!commentaryDiv
        );

        if (commentaryDiv) {
          const contentSpan = commentaryDiv.querySelector(
            SELECTORS.CONTENT_SPAN
          );
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
            authorDescription: postData.author?.description,
            contentLength: postData.content.length,
            timestamp: postData.timestamp,
            timeAgo: postData.timeAgo,
            isRepost: postData.repostFlag === 1,
            mediaType: postData.mediaType,
            reactionsCount: postData.reactionsCount,
            commentsCount: postData.commentsCount,
          });

          // Add ID to the post data
          postData.id = index + 1;
          this.posts.push(postData);
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

  /**
   * Get the extracted posts
   * @returns {Array<PostData>} - Array of extracted posts
   */
  getPosts() {
    return this.posts;
  }

  /**
   * Clear extracted posts
   */
  clearPosts() {
    this.posts = [];
  }
}
