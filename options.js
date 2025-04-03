document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkMode');
  const offlineModeToggle = document.getElementById('offlineMode');
  const speechRateInput = document.getElementById('speechRate');
  const voiceSelect = document.getElementById('voiceSelect');
  const savedTranslationsContainer = document.getElementById('savedTranslations');

  // Load saved settings
  chrome.storage.local.get([
    'darkMode',
    'offlineMode',
    'speechRate',
    'selectedVoice',
    'savedTranslations'
  ], (result) => {
    darkModeToggle.checked = result.darkMode || false;
    offlineModeToggle.checked = result.offlineMode || false;
    speechRateInput.value = result.speechRate || 1;
    voiceSelect.value = result.selectedVoice || 'en-US';

    // Display saved translations
    const savedTranslations = result.savedTranslations || [];
    displaySavedTranslations(savedTranslations);
  });

  // Save settings when changed
  darkModeToggle.addEventListener('change', () => {
    chrome.storage.local.set({ darkMode: darkModeToggle.checked });
  });

  offlineModeToggle.addEventListener('change', () => {
    chrome.storage.local.set({ offlineMode: offlineModeToggle.checked });
  });

  speechRateInput.addEventListener('change', () => {
    chrome.storage.local.set({ speechRate: speechRateInput.value });
  });

  voiceSelect.addEventListener('change', () => {
    chrome.storage.local.set({ selectedVoice: voiceSelect.value });
  });

  // Display saved translations
  function displaySavedTranslations(translations) {
    savedTranslationsContainer.innerHTML = translations.length ? '' :
      '<p class="text-gray-500">No saved translations yet</p>';

    translations.reverse().forEach(({ text, translation, timestamp }) => {
      const div = document.createElement('div');
      div.className = 'bg-gray-50 p-3 rounded';
      div.innerHTML = `
        <p class="font-medium">${text}</p>
        <p class="text-gray-600">${translation}</p>
        <p class="text-xs text-gray-400">${new Date(timestamp).toLocaleString()}</p>
      `;
      savedTranslationsContainer.appendChild(div);
    });
  }
});