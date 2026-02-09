// Using free Google Translate API alternative
// Install: npm install @vitalets/google-translate-api

import { translate } from '@vitalets/google-translate-api';

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'en', 'es')
 * @param {string} sourceLang - Source language code (optional, auto-detect if not provided)
 */
export const translateText = async (text, targetLang, sourceLang = 'auto') => {
  try {
    // Skip translation if source and target are the same
    if (sourceLang === targetLang) {
      return {
        translatedText: text,
        detectedLanguage: sourceLang,
      };
    }
    
    const result = await translate(text, { from: sourceLang, to: targetLang });
    
    return {
      translatedText: result.text,
      detectedLanguage: result.raw?.src || sourceLang,
    };
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return original text if translation fails
    return {
      translatedText: text,
      detectedLanguage: sourceLang,
    };
  }
};

/**
 * Translate message for multiple target languages
 * @param {string} text - Original text
 * @param {string[]} targetLanguages - Array of target language codes
 */
export const translateForMultipleLanguages = async (text, targetLanguages) => {
  const translations = {};
  
  for (const lang of targetLanguages) {
    const { translatedText } = await translateText(text, lang);
    translations[lang] = translatedText;
  }
  
  return translations;
};

// Supported languages list
export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
];
