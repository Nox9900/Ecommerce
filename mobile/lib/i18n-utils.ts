import { I18n } from "i18n-js";

// Helper to get translated content from an object with a 'translations' field
export const getTranslated = (data: any, field: string, currentLang: string, fallbackToEn: boolean = true): string => {
    if (!data) return "";

    // 1. Try to get translation for current language
    if (data.translations && data.translations[currentLang] && data.translations[currentLang][field]) {
        return data.translations[currentLang][field];
    }

    // 2. Fallback to English translation if enabled and available
    if (fallbackToEn && currentLang !== 'en' && data.translations && data.translations['en'] && data.translations['en'][field]) {
        return data.translations['en'][field];
    }

    // 3. Fallback to the root field (original data)
    if (data[field]) {
        return data[field];
    }

    return "";
};
