// Handle context menu creation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translateSelection',
    title: 'Translate to Somali',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translateSelection') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'translate',
      text: info.selectionText
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    // For demo, using a mock translation
    // In production, this would call Google Translate API
    const mockTranslation = `[Somali Translation of: ${request.text}]`;
    sendResponse({ translation: mockTranslation });
  }
  return true;
});