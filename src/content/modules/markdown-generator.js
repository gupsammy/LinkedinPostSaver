// Markdown generation functionality

/**
 * Markdown Generator class handles creating the final markdown output
 */
export class MarkdownGenerator {
  /**
   * Generate markdown content from extracted posts
   * @param {Array<PostData>} posts - Array of extracted posts
   * @returns {string} - Complete markdown document
   */
  generateMarkdown(posts) {
    const currentUrl = window.location.href;
    const currentDate = new Date().toISOString().split("T")[0];

    let markdown = this.generateHeader(currentUrl, currentDate, posts.length);
    markdown += this.generatePostsContent(posts);

    return markdown;
  }

  /**
   * Generate markdown header with metadata
   * @param {string} url - Current page URL
   * @param {string} date - Current date
   * @param {number} totalPosts - Total number of posts
   * @returns {string} - Header markdown
   */
  generateHeader(url, date, totalPosts) {
    let header = `# LinkedIn Posts Export\n\n`;
    header += `**Source:** ${url}\n`;
    header += `**Exported:** ${date}\n`;
    header += `**Total Posts:** ${totalPosts}\n\n`;
    header += `---\n\n`;
    return header;
  }

  /**
   * Generate markdown content for all posts
   * @param {Array<PostData>} posts - Array of posts to convert
   * @returns {string} - Posts markdown content
   */
  generatePostsContent(posts) {
    let content = "";

    posts.forEach((post) => {
      content += this.generateSinglePost(post);
      content += `---\n\n`;
    });

    return content;
  }

  /**
   * Generate markdown for a single post
   * @param {PostData} post - Post data to convert
   * @returns {string} - Single post markdown
   */
  generateSinglePost(post) {
    let postMarkdown = `## Post ${post.id}\n\n`;

    // Add author information
    if (post.author) {
      postMarkdown += this.generateAuthorSection(post.author);
    }

    // Add metadata
    postMarkdown += this.generateMetadataSection(post);

    // Add engagement metrics
    postMarkdown += this.generateEngagementSection(post);

    // Add main content
    postMarkdown += `\n${post.content}\n\n`;

    return postMarkdown;
  }

  /**
   * Generate author section for a post
   * @param {AuthorInfo} author - Author information
   * @returns {string} - Author section markdown
   */
  generateAuthorSection(author) {
    let authorSection = "";

    if (author.profileUrl) {
      authorSection += `**Author:** [${author.name}](${author.profileUrl})\n`;
    } else {
      authorSection += `**Author:** ${author.name}\n`;
    }

    if (author.description) {
      authorSection += `**Author Description:** ${author.description}\n`;
    }

    return authorSection;
  }

  /**
   * Generate metadata section for a post
   * @param {PostData} post - Post data
   * @returns {string} - Metadata section markdown
   */
  generateMetadataSection(post) {
    let metadataSection = "";

    if (post.timestamp) {
      metadataSection += `**Posted:** ${post.timestamp}\n`;
    }

    if (post.timeAgo) {
      metadataSection += `**Time Ago:** ${post.timeAgo}\n`;
    }

    metadataSection += `**Is Repost:** ${
      post.repostFlag === 1 ? "Yes" : "No"
    }\n`;
    metadataSection += `**Media Type:** ${post.mediaType || "None"}\n`;

    return metadataSection;
  }

  /**
   * Generate engagement section for a post
   * @param {PostData} post - Post data
   * @returns {string} - Engagement section markdown
   */
  generateEngagementSection(post) {
    let engagementSection = "";

    engagementSection += `**Reactions:** ${post.reactionsCount || "0"}\n`;
    engagementSection += `**Comments:** ${post.commentsCount || "0"}\n`;

    return engagementSection;
  }

  /**
   * Generate a summary section (optional)
   * @param {Array<PostData>} posts - Array of posts
   * @returns {string} - Summary markdown
   */
  generateSummary(posts) {
    const totalPosts = posts.length;
    const postsWithImages = posts.filter((p) => p.mediaType === "Image").length;
    const postsWithVideos = posts.filter((p) => p.mediaType === "Video").length;
    const reposts = posts.filter((p) => p.repostFlag === 1).length;

    let summary = `## Summary\n\n`;
    summary += `- **Total Posts:** ${totalPosts}\n`;
    summary += `- **Posts with Images:** ${postsWithImages}\n`;
    summary += `- **Posts with Videos:** ${postsWithVideos}\n`;
    summary += `- **Reposts:** ${reposts}\n`;
    summary += `- **Original Posts:** ${totalPosts - reposts}\n\n`;

    return summary;
  }
}
