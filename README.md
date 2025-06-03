# LinkedIn Post Saver Chrome Extension

A Chrome extension that saves **ALL** LinkedIn posts from the current page as a formatted markdown file using intelligent auto-scroll technology.

## 🆕 New Features

- **✨ Intelligent Auto-Scroll**: Automatically scrolls through the page to load ALL available posts
- **🔄 "Show More" Button Detection**: Automatically finds and clicks "Show more results" buttons
- **📊 Real-time Progress**: Live updates showing how many posts have been loaded
- **⚡ Comprehensive Loading**: Ensures no posts are missed by loading the complete feed

## Features

- **Extract All Posts**: Automatically loads and saves ALL posts from the current LinkedIn page
- **Intelligent Auto-Scroll**: Progressively scrolls and loads more content until no more posts are available
- **Smart Button Detection**: Automatically clicks "Show more results" buttons when infinite scroll isn't available
- **Markdown Format**: Clean, readable markdown output with proper formatting
- **Preserve Links**: Maintains all links to profiles and external URLs
- **Author Information**: Includes author names and profile links when available
- **Timestamps**: Preserves post timestamps when available
- **Engagement Metrics**: Includes reaction and comment counts
- **Real-time Progress**: Shows loading progress with post count updates
- **Easy Download**: One-click download as `.md` file

## Installation

### Install from Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your Chrome toolbar

### Required Files

Make sure your extension folder contains:

- `manifest.json`
- `src/background/background.js`
- `src/content/content.js`
- `src/popup/popup.html`
- `src/popup/popup.js`
- Icon files (16x16, 48x48, 128x128 pixels)

## Usage

### Method 1: Extension Popup (Recommended)

1. **Navigate to LinkedIn**: Open any LinkedIn feed page (home, company page, profile activity, etc.)
2. **Click Extension Icon**: Click the LinkedIn Post Saver icon in your Chrome toolbar
3. **Auto-Loading Process**: The extension will:
   - Start auto-scrolling to load all posts
   - Show real-time progress (e.g., "Loading posts... (47 found)")
   - Automatically click "Show more results" buttons
   - Continue until all posts are loaded
4. **Extraction & Download**: Once loading is complete, posts are extracted and downloaded
5. **Done!**: Your complete post collection is saved as a formatted markdown file

### Method 2: Right-Click Context Menu

1. **Navigate to LinkedIn**: Open any LinkedIn feed page
2. **Right-Click**: Right-click anywhere on the LinkedIn page
3. **Select "Save LinkedIn Posts (Auto-Scroll)"**: Click the context menu option
4. **Auto-Loading**: The extension automatically loads all posts in the background
5. **Notification**: You'll receive a notification when the process is complete
6. **Done!**: Posts are saved without opening the popup

> **⏱️ Time Estimate**: The auto-scroll process typically takes 15-45 seconds depending on the number of posts available. Pages with hundreds of posts may take longer.

## Auto-Scroll Technology

### How It Works

1. **Progressive Scrolling**: The extension scrolls down the page in increments
2. **Load Detection**: Waits for new posts to load after each scroll
3. **Button Detection**: Searches for and clicks "Show more results" buttons automatically
4. **Completion Detection**: Stops when no new posts are found after multiple attempts
5. **Smart Waiting**: Adapts to LinkedIn's loading patterns and network speed

### Supported LinkedIn Pages

- ✅ Home feed (`linkedin.com/feed/`)
- ✅ Company pages (`linkedin.com/company/[name]/posts/`)
- ✅ Profile activity (`linkedin.com/in/[username]/recent-activity/`)
- ✅ Hashtag feeds (`linkedin.com/feed/hashtag/[tag]/`)
- ✅ Search results (`linkedin.com/search/results/content/`)

### Loading Strategies

The extension uses multiple strategies to ensure complete post loading:

1. **Infinite Scroll Detection**: Monitors scroll position and document height
2. **Button Clicking**: Finds and clicks various "Show more" button types
3. **Loading Indicators**: Waits for LinkedIn's loading spinners to disappear
4. **Post Count Monitoring**: Tracks the number of posts before and after each action
5. **Timeout Protection**: Prevents infinite loops with reasonable time limits

## Output Format

The generated markdown file includes comprehensive information:

```markdown
# LinkedIn Posts Export

**Source:** [LinkedIn URL]
**Exported:** [Date]
**Total Posts:** [Number]

---

## Post 1

**Author:** [Author Name](Profile Link)
**Posted:** [Timestamp]
**Reactions:** [Count]
**Comments:** [Count]

[Post content with preserved formatting and links]

---

## Post 2

...
```

## Technical Details

### Permissions Required

- `activeTab`: Access to the current LinkedIn tab
- `downloads`: Download generated markdown files
- `scripting`: Inject content scripts into LinkedIn pages
- `contextMenus`: Add right-click context menu option
- `notifications`: Show completion notifications
- `host_permissions`: Access to LinkedIn.com

### Architecture

- **Content Script** (`content.js`):
  - Auto-scroll functionality
  - Post extraction from LinkedIn's DOM
  - Progress reporting
  - Button detection and clicking
- **Background Service Worker** (`background.js`):
  - File downloads
  - Context menu handling
  - Notification management
- **Popup Interface** (`popup.html/js`):
  - User interface for triggering extraction
  - Real-time progress display
  - Status updates

### Auto-Scroll Algorithm

```javascript
1. Count initial posts
2. Scroll down by viewport height
3. Wait for new content to load
4. Look for and click "Show more" buttons
5. Count posts again
6. If new posts found, repeat from step 2
7. If no new posts after 3 attempts, complete
8. Extract all loaded posts
```

### LinkedIn Post Structure

The extension targets posts within `.fie-impression-container` elements and extracts content from nested `<span dir="ltr">` elements, preserving:

- Text content with formatting
- Links to profiles and external URLs
- Line breaks and paragraph structure
- Author information and profile links
- Timestamps and relative dates
- Engagement metrics (reactions, comments)

## Troubleshooting

### Auto-Scroll Issues

1. **Slow Loading**: If posts load slowly, the extension will wait longer between scrolls
2. **Network Issues**: Poor internet connection may cause timeouts - try refreshing and retrying
3. **LinkedIn Changes**: If LinkedIn updates their structure, some posts might be missed

### Extension Not Working

1. **Check LinkedIn Page**: Make sure you're on a LinkedIn page with posts
2. **Refresh Page**: Try refreshing the LinkedIn page and try again
3. **Check Permissions**: Ensure the extension has permission to access LinkedIn
4. **Developer Console**: Check browser console for error messages

### Auto-Scroll Not Loading All Posts

1. **Try Manual Scroll**: Scroll down manually first, then use the extension
2. **Check Page Type**: Some LinkedIn pages have different loading mechanisms
3. **Network Speed**: Slow connections may need multiple attempts

### No Posts Found

1. **Wait for Page Load**: Ensure the LinkedIn page has fully loaded before using the extension
2. **Check Page Type**: Works best on feed pages, profile activity, company posts, etc.
3. **Login Status**: Make sure you're logged into LinkedIn

### Download Issues

1. **Pop-up Blockers**: Disable pop-up blockers for Chrome
2. **Download Settings**: Check Chrome's download settings
3. **Storage Space**: Ensure you have sufficient disk space

## Performance

### Optimization Features

- **Efficient DOM Querying**: Uses optimized selectors for fast post detection
- **Intelligent Waiting**: Adapts wait times based on content loading patterns
- **Memory Management**: Processes posts in batches to prevent memory issues
- **Progress Streaming**: Real-time updates without blocking the UI

### Typical Performance

- **Small feeds** (< 50 posts): 10-20 seconds
- **Medium feeds** (50-200 posts): 20-60 seconds
- **Large feeds** (200+ posts): 1-2 minutes
- **Very large feeds** (500+ posts): 2-3 minutes

## Limitations

- Auto-scroll speed is limited by LinkedIn's loading mechanisms
- Some embedded content (videos, images) may not be preserved in markdown
- Dependent on LinkedIn's HTML structure (may break with major site updates)
- Rate limiting: LinkedIn may temporarily slow down loading for very large feeds
- Private posts or restricted content will only be saved if you have access

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any personal data
- **Local Processing**: All post extraction and auto-scrolling happens locally in your browser
- **No External Requests**: No data is sent to external servers during operation
- **File-Only Output**: Results are only saved to your local file system
- **Secure Processing**: All operations respect LinkedIn's security measures

## Development

### Building from Source

1. Clone the repository
2. Load the extension folder in Chrome Developer Mode
3. Make changes to the source files
4. Reload the extension in `chrome://extensions/`

### Debugging Auto-Scroll

To debug the auto-scroll functionality:

1. Open Developer Tools (`F12`)
2. Go to the Console tab
3. Use the extension - you'll see detailed logs of the auto-scroll process
4. Check for any error messages or warnings

### Contributing

Feel free to submit issues and enhancement requests! Areas for contribution:

- **New LinkedIn page types**: Support for additional LinkedIn page formats
- **Performance improvements**: Faster loading and processing
- **Enhanced markdown**: Better formatting and content preservation
- **UI improvements**: Better progress indication and user experience

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This extension is not affiliated with LinkedIn. Use responsibly and in accordance with LinkedIn's Terms of Service. The auto-scroll feature is designed to respect LinkedIn's loading mechanisms and doesn't attempt to bypass any restrictions.

## Changelog

### Version 1.0

- ✨ Added intelligent auto-scroll functionality
- ✨ Added "Show more" button detection and clicking
- ✨ Added real-time progress updates
- ✨ Added comprehensive post loading
- ✨ Enhanced context menu with auto-scroll
- ✨ Added notification system
- 🔧 Improved error handling and stability
- 🔧 Enhanced user interface with progress indicators
- 📝 Updated documentation with auto-scroll details
