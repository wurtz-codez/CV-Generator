import { BackgroundMessage } from '../types';
import { saveLastJD } from '../lib/storage';
import { streamCoverLetter } from '../lib/gemini';

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_JD') {
    handleExtractJD(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'GENERATE_LETTER') {
    handleGenerateLetter(message.resume, message.jd, message.apiKey, sendResponse);
    return true; // Keep channel open for async response
  }
});

async function handleExtractJD(sendResponse: (response?: any) => void) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) {
      sendResponse({ error: "No active tab" });
      return;
    }

    // Try to send message to content script
    chrome.tabs.sendMessage(
      tabs[0].id,
      { type: 'SCRAPE_PAGE' },
      async (response: { text: string; url: string } | undefined) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          sendResponse({ error: "Could not extract. Content script not loaded or page not supported." });
          return;
        }

        if (response && response.text) {
          const payload = {
            text: response.text,
            sourceUrl: response.url,
            extractedAt: Date.now()
          };
          await saveLastJD(payload);
          sendResponse({ success: true, data: payload });
        } else {
          sendResponse({ error: "No job description found on this page." });
        }
      }
    );
  } catch (err: any) {
    sendResponse({ error: err.message });
  }
}

async function handleGenerateLetter(resume: string, jd: string, apiKey: string, sendResponse: (response?: any) => void) {
  try {
    await streamCoverLetter(resume, jd, apiKey, (chunk) => {
      // Stream chunks back to popup
      chrome.runtime.sendMessage({ type: 'STREAM_CHUNK', chunk });
    });
    
    // Notify complete
    chrome.runtime.sendMessage({ type: 'STREAM_COMPLETE' });
    sendResponse({ success: true });
  } catch (err: any) {
    console.error("Generate error", err);
    let errorMessage = "Generation failed";
    if (err.message?.includes('401')) errorMessage = "Invalid API key";
    if (err.message?.includes('429')) errorMessage = "Rate limit hit. Wait a moment and retry.";
    chrome.runtime.sendMessage({ type: 'STREAM_ERROR', error: errorMessage });
    sendResponse({ error: errorMessage });
  }
}