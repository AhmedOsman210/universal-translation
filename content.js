// Inject translation popup
function createTranslationPopup() {
  const popup = document.createElement('div');
  popup.id = 'somali-translator-popup';
  popup.className = 'fixed hidden p-4 bg-white rounded-lg shadow-lg z-50';
  document.body.appendChild(popup);
  return popup;
}

// Handle text selection and translation
let popup = createTranslationPopup();

document.addEventListener('mouseup', async () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position popup near selected text
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    popup.innerHTML = 'Translating...';
    popup.classList.remove('hidden');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text: selectedText
      });
      popup.textContent = response.translation;
    } catch (error) {
      popup.textContent = 'Translation failed';
    }
  } else {
    popup.classList.add('hidden');
  }
});

// Hide popup when clicking outside
document.addEventListener('mousedown', (e) => {
  if (!popup.contains(e.target)) {
    popup.classList.add('hidden');
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    // Handle translation request
    console.log('Translation requested:', request.text);
  }
  return true;
});