import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Volume2, Languages, Save, ArrowUpDown, Globe2, Copy, Star, History, X, Timer, Eye, EyeOff, Palette, Pause } from 'lucide-react';
import axios from 'axios';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'so', name: 'Somali' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'sw', name: 'Swahili' },
  { code: 'am', name: 'Amharic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ur', name: 'Urdu' },
  { code: 'fa', name: 'Persian' },
  { code: 'it', name: 'Italian' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
];

const TRANSLATE_API_URL = 'https://api.mymemory.translated.net/get';
const MAX_CHARS = 5000;

interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  translationTime?: number;
  isFavorite?: boolean;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favorites, setFavorites] = useState<Translation[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [translationStartTime, setTranslationStartTime] = useState<number | null>(null);
  const [translationTime, setTranslationTime] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [isTextHidden, setIsTextHidden] = useState(false);
  const [textSpacing, setTextSpacing] = useState(1);
  const [audioPosition, setAudioPosition] = useState<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const savedTranslations = localStorage.getItem('recentTranslations');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedTranslations) {
      setRecentTranslations(JSON.parse(savedTranslations));
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    setCharCount(inputText.length);

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [inputText]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setTranslationStartTime(Date.now());
    setTranslationTime(null);
    setIsTranslating(true);

    try {
      const langPair = `${sourceLang === 'auto' ? 'en' : sourceLang}|${targetLang}`;
      const response = await axios.get(TRANSLATE_API_URL, {
        params: {
          q: inputText,
          langpair: langPair,
          de: 'support@yourdomain.com',
        }
      });

      const endTime = Date.now();
      const timeElapsed = endTime - (translationStartTime || endTime);
      setTranslationTime(timeElapsed);

      if (response.data?.responseData?.translatedText) {
        let translatedText = response.data.responseData.translatedText;
        translatedText = translatedText.replace(/[\[\]{}]/g, '');
        setTranslation(translatedText);

        const newTranslation: Translation = {
          id: Date.now().toString(),
          sourceText: inputText,
          translatedText,
          sourceLang,
          targetLang,
          timestamp: Date.now(),
          translationTime: timeElapsed,
        };

        const updatedTranslations = [newTranslation, ...recentTranslations].slice(0, 10);
        setRecentTranslations(updatedTranslations);
        localStorage.setItem('recentTranslations', JSON.stringify(updatedTranslations));
      } else if (response.data?.responseStatus === 429) {
        setTranslation('Daily translation limit reached. Please try again tomorrow.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslation('Translation failed. Please try again later.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!text) return;
    
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setAudioPosition(window.speechSynthesis.speaking ? utteranceRef.current?.currentTime || 0 : 0);
      return;
    }

    try {
      if (audioPosition > 0 && utteranceRef.current) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      const normalizedLang = lang.toLowerCase().split('-')[0];
      const voice = availableVoices.find(v => 
        v.lang.toLowerCase().startsWith(normalizedLang)
      );

      if (voice) {
        utterance.voice = voice;
      } else {
        utterance.lang = lang;
      }

      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setAudioPosition(0);
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setIsPlaying(false);
      };

      utterance.onresume = () => {
        setIsPlaying(true);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setAudioPosition(0);
        utteranceRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } catch (error) {
      console.error('Speech synthesis initialization error:', error);
      setIsPlaying(false);
      setAudioPosition(0);
      utteranceRef.current = null;
    }
  };

  const swapLanguages = () => {
    if (sourceLang !== 'auto') {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setInputText(translation);
      setTranslation('');
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleFavorite = (translation: Translation) => {
    const isFavorite = favorites.some(f => f.id === translation.id);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(f => f.id !== translation.id);
    } else {
      updatedFavorites = [...favorites, { ...translation, isFavorite: true }];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className={`min-h-screen gradient-bg animate-gradient ${isDark ? 'dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="glass-morphism rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400 flex items-center gap-3">
              <Globe2 className="w-8 h-8" />
              Universal Translator
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Translation History"
              >
                <History className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <select
                value={sourceLang}
                onChange={(e) => {
                  setSourceLang(e.target.value);
                  setInputText('');
                  setTranslation('');
                }}
                className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              <button
                onClick={swapLanguages}
                disabled={sourceLang === 'auto'}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <select
                value={targetLang}
                onChange={(e) => {
                  setTargetLang(e.target.value);
                  setTranslation('');
                }}
                className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all"
              >
                {LANGUAGES.filter(lang => lang.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => {
                  const newText = e.target.value;
                  if (newText.length <= MAX_CHARS) {
                    setInputText(newText);
                  }
                }}
                className={`w-full h-36 p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all resize-none ${
                  charCount >= MAX_CHARS * 0.9 ? 'border-yellow-500' : ''
                } ${charCount >= MAX_CHARS ? 'border-red-500' : ''}`}
                placeholder={`Enter text in ${sourceLang === 'auto' ? 'any language' : LANGUAGES.find(l => l.code === sourceLang)?.name}...`}
                dir="auto"
              />
              <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                <span className={`text-sm ${
                  charCount >= MAX_CHARS ? 'text-red-500' :
                  charCount >= MAX_CHARS * 0.9 ? 'text-yellow-500' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {charCount}/{MAX_CHARS}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getWordCount(inputText)} words
                </span>
                <button
                  onClick={() => handleSpeak(inputText, sourceLang)}
                  disabled={!inputText}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim() || charCount > MAX_CHARS}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all ${
                  (isTranslating || !inputText.trim() || charCount > MAX_CHARS) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <Languages className="w-5 h-5" />
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
              <button
                onClick={() => toggleFavorite({
                  id: Date.now().toString(),
                  sourceText: inputText,
                  translatedText: translation,
                  sourceLang,
                  targetLang,
                  timestamp: Date.now()
                })}
                disabled={!translation}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                title="Save to Favorites"
              >
                <Star className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsTextHidden(!isTextHidden)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  {isTextHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isTextHidden ? 'Show Text' : 'Hide Text'}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Spacing:</span>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={textSpacing}
                    onChange={(e) => setTextSpacing(parseFloat(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            <div className="relative mt-2">
              <div 
                className={`p-8 bg-gray-50 dark:bg-gray-700 rounded-xl min-h-[100px] text-gray-800 dark:text-gray-200 leading-relaxed ${
                  isTextHidden ? 'filter blur-sm' : ''
                }`}
                dir="auto"
                style={{
                  letterSpacing: `${0.025 * textSpacing}em`,
                  wordSpacing: `${0.05 * textSpacing}em`,
                  lineHeight: `${1.5 * textSpacing}`
                }}
              >
                {translation || 'Translation will appear here...'}
                {translationTime && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Timer className="w-4 h-4" />
                    {(translationTime / 1000).toFixed(2)}s
                  </div>
                )}
              </div>
              {translation && (
                <div className="absolute bottom-4 right-4 flex gap-4 items-center">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getWordCount(translation)} words
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {translation.length} characters
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(translation)}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => handleSpeak(translation, targetLang)}
                      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors flex items-center gap-1"
                      title={isPlaying ? "Pause" : "Listen"}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showHistory && (
              <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">History</h2>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Favorites</h3>
                    {favorites.length === 0 ? (
                      <p className="text-gray-500 text-sm">No favorite translations yet</p>
                    ) : (
                      favorites.map(fav => (
                        <div key={fav.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2">
                          <p className="text-sm font-medium">{fav.sourceText}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{fav.translatedText}</p>
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => toggleFavorite(fav)}
                              className="text-yellow-500"
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Recent</h3>
                    {recentTranslations.map(item => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2">
                        <p className="text-sm font-medium">{item.sourceText}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.translatedText}</p>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => toggleFavorite(item)}
                            className={favorites.some(f => f.id === item.id) ? 'text-yellow-500' : 'text-gray-400'}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;