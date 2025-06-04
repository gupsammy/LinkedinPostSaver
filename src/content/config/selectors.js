// CSS Selectors Configuration for LinkedIn Post Extraction

export const SELECTORS = {
  // Post container selectors
  POST_CONTAINERS: ".fie-impression-container",

  // Content selectors
  COMMENTARY_DIV:
    ".update-components-text.update-components-update-v2__commentary",
  CONTENT_SPAN: 'span[dir="ltr"]',

  // Author selectors
  AUTHOR_NAME: [
    "div.fie-impression-container div.relative div.PmmJpOCWkoAkFJmjbmlHzAtDWdYbNtRsPxA.display-flex.align-items-flex-start.update-components-actor--with-control-menu div div a span.update-components-actor__title span.wXjhKTWXFJWFzxqYGEUMRicMCLRXJk.hoverable-link-text.t-14.t-bold.text-body-medium-bold.white-space-nowrap.t-black.update-components-actor__single-line-truncate span span:nth-child(1)",
    ".update-components-actor__title span span:nth-child(1)",
    ".update-components-actor__title span span:first-child",
    ".update-components-actor__title .hoverable-link-text span:first-child",
    ".update-components-actor__single-line-truncate span span:first-child",
  ],

  AUTHOR_DESCRIPTION: [
    "div.fie-impression-container div.relative div.PmmJpOCWkoAkFJmjbmlHzAtDWdYbNtRsPxA.display-flex.align-items-flex-start.update-components-actor--with-control-menu div div a span.update-components-actor__description.text-body-xsmall.t-black--light span:nth-child(1)",
    ".update-components-actor__description span:nth-child(1)",
    ".update-components-actor__description span:first-child",
    ".update-components-actor__description.text-body-xsmall span:first-child",
  ],

  AUTHOR_PROFILE_LINK: 'a[href*="/in/"]',

  // Engagement selectors
  REACTIONS: [
    "#ember111 > div.social-details-social-counts.social-details-social-counts--no-vertical-padding > div > div > ul > li.social-details-social-counts__item.social-details-social-counts__reactions.social-details-social-counts__item--height-two-x.social-details-social-counts__reactions--left-aligned > button > span",
    ".social-details-social-counts__reactions > button > span",
    ".social-details-social-counts__reactions button span",
    ".social-details-social-counts__item--reactions button span",
    'li[class*="reactions"] button span',
  ],

  COMMENTS: [
    "#ember111 > div.social-details-social-counts.social-details-social-counts--no-vertical-padding > div > div > ul > li.display-flex.flex-grow-1.max-full-width > ul > li.social-details-social-counts__item.social-details-social-counts__comments.social-details-social-counts__item--height-two-x.social-details-social-counts__item--right-aligned > button > span",
    ".social-details-social-counts__comments > button > span",
    ".social-details-social-counts__comments button span",
    ".social-details-social-counts__item--comments button span",
    'li[class*="comments"] button span',
  ],

  // Time and metadata selectors
  TIME_ELEMENT: "time",
  TIME_ARIA_LABEL: '[aria-label*="ago"]',

  TIME_AGO: [
    "#ember16278 > div > div > div.fie-impression-container > div.relative > div.PmmJpOCWkoAkFJmjbmlHzAtDWdYbNtRsPxA.display-flex.align-items-flex-start.update-components-actor--with-control-menu > div > div > span > span:nth-child(1)",
    ".update-components-actor span span:nth-child(1)",
    ".update-components-actor__meta span:first-child",
    ".feed-shared-actor__meta span:first-child",
    ".update-components-actor .visually-hidden + span",
    'span[aria-hidden="true"]:contains("ago")',
    'span:contains("hour"):first',
    'span:contains("day"):first',
    'span:contains("week"):first',
    'span:contains("month"):first',
    'span:contains("year"):first',
  ],

  // Repost selectors
  REPOST_INDICATORS: [
    "#ember16343 > div > div > div.fie-impression-container > div.relative > div.update-components-header.update-components-header--with-control-menu.update-components-header--with-divider.update-components-header--with-image.pt2.t-12.t-black--light.t-normal",
    ".update-components-header.update-components-header--with-control-menu.update-components-header--with-divider",
    ".update-components-header--with-divider",
    ".update-components-header.pt2.t-12.t-black--light",
    ".update-components-reshare-header",
    ".feed-shared-update-v2__header",
    '*:contains("reposted")',
    '*:contains("shared")',
    '*:contains("reshared")',
  ],

  // Media content selectors
  MEDIA_CONTAINERS: [
    ".feed-shared-update-v2__content",
    ".update-components-content",
    ".fie-impression-container > div:not(.relative)",
  ],

  MEDIA_FALLBACK: {
    VIDEO: "video, [data-video-id], [data-video-url]",
    IMAGE: "img[src], [data-image-id], [data-image-url]",
    DOCUMENT: '[data-document-id], .document-preview, [href$=".pdf"]',
  },

  // Auto-scroll selectors
  SHOW_MORE_BUTTONS: [
    'button[aria-label*="Show more"]',
    'button[aria-label*="See more"]',
    'button:contains("Show more results")',
    'button:contains("See more posts")',
    ".scaffold-finite-scroll__load-button",
    '.artdeco-button--secondary:contains("Show")',
    'button[data-test-pagination-page-btn="next"]',
  ],

  LOADING_INDICATORS:
    '.artdeco-spinner, .skeleton-loader, [data-placeholder="loading"]',
};

// Repost text patterns
export const REPOST_PATTERNS = [
  "reposted this",
  "shared this",
  "reshared this",
  "reposted by",
  "shared by",
  "originally posted by",
];

// Time pattern regex
export const TIME_PATTERN = /\d+\s*(minute|hour|day|week|month|year)s?\s*ago/i;
