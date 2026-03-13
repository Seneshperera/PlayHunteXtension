chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "find-video-source",
    title: "Find Video Source",
    contexts: ["video", "page", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "find-video-source") {
    // We can interact with content script if needed.
    chrome.tabs.sendMessage(tab.id, { action: "START_SELECTION" });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CAPTURE_VISIBLE_TAB") {
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 }, (dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true; // Keep channel open for async response
  }
});
