// Data structure definitions for LinkedIn Post Extraction

/**
 * Author information structure
 */
export class AuthorInfo {
  constructor(name = null, description = null, profileUrl = null) {
    this.name = name;
    this.description = description;
    this.profileUrl = profileUrl;
  }
}

/**
 * Post data structure
 */
export class PostData {
  constructor({
    id = null,
    author = null,
    timestamp = null,
    content = "",
    reactionsCount = "0",
    commentsCount = "0",
    timeAgo = "Unknown time",
    repostFlag = 0,
    mediaType = "None",
  } = {}) {
    this.id = id;
    this.author = author;
    this.timestamp = timestamp;
    this.content = content;
    this.reactionsCount = reactionsCount;
    this.commentsCount = commentsCount;
    this.timeAgo = timeAgo;
    this.repostFlag = repostFlag;
    this.mediaType = mediaType;
  }
}

/**
 * Progress update structure for auto-scrolling
 */
export class ScrollProgress {
  constructor(phase = "", postsFound = 0, message = "") {
    this.phase = phase;
    this.postsFound = postsFound;
    this.message = message;
  }
}

/**
 * Media types enum
 */
export const MEDIA_TYPES = {
  NONE: "None",
  IMAGE: "Image",
  VIDEO: "Video",
  DOCUMENT: "Document",
  ARTICLE: "Article",
  POLL: "Poll",
  EVENT: "Event",
};

/**
 * Extraction phases enum
 */
export const EXTRACTION_PHASES = {
  SCROLLING: "scrolling",
  EXTRACTING: "extracting",
  COMPLETED: "completed",
  ERROR: "error",
};
