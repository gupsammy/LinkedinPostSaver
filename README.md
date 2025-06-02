# LinkedIn Post Saver Chrome Extension

A Chrome extension that saves all LinkedIn posts from the current page as a formatted markdown file.

## Features

- **Extract All Posts**: Saves all visible posts from the current LinkedIn page
- **Markdown Format**: Clean, readable markdown output with proper formatting
- **Preserve Links**: Maintains all links to profiles and external URLs
- **Author Information**: Includes author names and profile links when available
- **Timestamps**: Preserves post timestamps when available
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
- `background.js`
- `content.js`
- `popup.html`
- `popup.js`
- Icon files (16x16, 48x48, 128x128 pixels)

## Usage

### Method 1: Extension Popup

1. **Navigate to LinkedIn**: Open any LinkedIn feed page (home, company page, etc.)
2. **Click Extension Icon**: Click the LinkedIn Post Saver icon in your Chrome toolbar
3. **Save Posts**: Click "Save Posts to File" in the popup
4. **Choose Location**: Select where to save the markdown file
5. **Done!**: Your posts are now saved as a formatted markdown file

### Method 2: Right-Click Context Menu ⭐ NEW!

1. **Navigate to LinkedIn**: Open any LinkedIn feed page
2. **Right-Click**: Right-click anywhere on the LinkedIn page
3. **Select "Save LinkedIn Posts"**: Click the context menu option
4. **Choose Location**: Select where to save the markdown file
5. **Done!**: Posts are saved without opening the popup

> **Tip**: The context menu option only appears on LinkedIn pages for a cleaner experience!

## Output Format

The generated markdown file includes:

```markdown
# LinkedIn Posts Export

**Source:** [LinkedIn URL]
**Exported:** [Date]
**Total Posts:** [Number]

---

## Post 1

**Author:** [Author Name](Profile Link)
**Posted:** [Timestamp]

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
- `host_permissions`: Access to LinkedIn.com

### Architecture

- **Content Script** (`content.js`): Extracts posts from LinkedIn's DOM
- **Background Service Worker** (`background.js`): Handles file downloads
- **Popup Interface** (`popup.html/js`): User interface for triggering extraction

### LinkedIn Post Structure

The extension targets posts within `.fie-impression-container` elements and extracts content from nested `<span dir="ltr">` elements, preserving:

- Text content
- Links to profiles and external URLs
- Line breaks and formatting
- Author information
- Timestamps

## Troubleshooting

### Extension Not Working

1. **Check LinkedIn Page**: Make sure you're on a LinkedIn page with posts
2. **Refresh Page**: Try refreshing the LinkedIn page and try again
3. **Check Permissions**: Ensure the extension has permission to access LinkedIn
4. **Developer Console**: Check browser console for error messages

### No Posts Found

1. **Scroll Down**: Make sure posts are loaded and visible on the page
2. **Check Page Type**: Works best on feed pages, profile activity, etc.
3. **Wait for Loading**: Ensure all posts have finished loading

### Download Issues

1. **Pop-up Blockers**: Disable pop-up blockers for Chrome
2. **Download Settings**: Check Chrome's download settings
3. **Storage Space**: Ensure you have sufficient disk space

## Limitations

- Only extracts posts visible on the current page
- Doesn't automatically scroll to load more posts
- Some embedded content (videos, images) may not be preserved
- Dependent on LinkedIn's HTML structure (may break with site updates)

## Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any personal data
- **Local Processing**: All post extraction happens locally in your browser
- **No External Requests**: No data is sent to external servers
- **File-Only Output**: Results are only saved to your local file system

## Development

### Building from Source

1. Clone the repository
2. Load the extension folder in Chrome Developer Mode
3. Make changes to the source files
4. Reload the extension in `chrome://extensions/`

### Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This extension is not affiliated with LinkedIn. Use responsibly and in accordance with LinkedIn's Terms of Service.
