document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const translateBtn = document.getElementById('translateBtn');
  const listenBtn = document.getElementById('listenBtn');
  const translationResult = document.getElementById('translationResult');
  const speedControl = document.getElementById('speed');
  const saveBtn = document.getElementById('saveBtn');
  const toggleTheme = document.getElementById('toggleTheme');

  let isPlaying = false;
  let utterance = null;

  // Translation function
  async function translateText(text) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text: text
      });
      return response.translation;
    } catch (error) {
      console.error('Translation error:', error);
      return 'Translation failed. Please try again.';
    }
  }

  // Text-to-speech function
  function speak(text, isSomali = false) {
    if (utterance) {
      window.speechSynthesis.cancel();
    }

    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(speedControl.value);
    utterance.lang = isSomali ? 'so-SO' : 'en-US';

    utterance.onend = () => {
      isPlaying = false;
      listenBtn.textContent = 'Listen';
    };

    window.speechSynthesis.speak(utterance);
    isPlaying = true;
    listenBtn.textContent = 'Stop';
  }

  // Event listeners
  translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (text) {
      translationResult.innerHTML = '<p class="text-gray-500">Translating...</p>';
      const translation = await translateText(text);
      translationResult.textContent = translation;
    }
  });

  listenBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (text) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        isPlaying = false;
        listenBtn.textContent = 'Listen';
      } else {
        speak(text);
      }
    }
  });

  saveBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    const translation = translationResult.textContent;
    if (text && translation) {
      chrome.storage.local.get(['savedTranslations'], (result) => {
        const savedTranslations = result.savedTranslations || [];
        savedTranslations.push({ text, translation, timestamp: Date.now() });
        chrome.storage.local.set({ savedTranslations });
      });
    }
  });

  toggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
});