import { ExtractorMessage } from '../types';

function extractJobDescription(): { text: string; url: string } {
  const selectors = [
    '.job-description__content', // LinkedIn
    '.jobs-description__content', // LinkedIn
    '#jobDescriptionText', // Indeed
    '.jobsearch-jobDescriptionText', // Indeed
    '.job-desc', // Naukri
    '.dang-inner-html', // Naukri
    '#content .body', // Greenhouse
    '.job__description', // Greenhouse
    '.posting-description', // Lever
    '.section-wrapper', // Lever
    '[data-automation-id="jobPostingDescription"]', // Workday
  ];

  let targetNode: Element | null = null;

  for (const selector of selectors) {
    targetNode = document.querySelector(selector);
    if (targetNode) break;
  }

  // Fallback if no specific selector matched
  if (!targetNode) {
    let maxLen = 0;
    
    // Simple heuristic: find a container with a lot of text that looks like a JD
    const allDivs = document.querySelectorAll('div');
    for (const div of Array.from(allDivs)) {
      const textLen = (div.innerText || '').length;
      // Heuristic: If it has paragraphs/lists inside and is long
      if (textLen > 200 && textLen > maxLen) {
        // Only select if it doesn't contain the whole body (avoid document wrapper)
        if (div.innerText.length < document.body.innerText.length * 0.8) {
          maxLen = textLen;
          targetNode = div;
        }
      }
    }
  }

  if (!targetNode) {
    return { text: "", url: window.location.href };
  }

  // Get inner text, replacing multiple whitespace/newlines
  let text = (targetNode as HTMLElement).innerText || "";
  text = text.replace(/\s+/g, ' ').trim();

  return { text, url: window.location.href };
}

chrome.runtime.onMessage.addListener(
  (message: ExtractorMessage, _sender, sendResponse) => {
    if (message.type === 'SCRAPE_PAGE') {
      const result = extractJobDescription();
      sendResponse(result);
    }
    return true;
  }
);