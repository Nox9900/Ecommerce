import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View, ScrollView, I18nManager } from "react-native";
import * as Updates from "expo-updates";

const LANGUAGES = [
    { code: 'en', label: 'language.english', icon: '🇺🇸' },
    { code: 'fr', label: 'language.french', icon: '🇫🇷' },
    { code: 'es', label: 'language.spanish', icon: '🇪🇸' },
    { code: 'ar', label: 'language.arabic', icon: '🇸🇦' },
    { code: 'zh', label: 'language.chinese', icon: '🇨🇳' },
    { code: 'ru', label: 'language.russian', icon: '🇷🇺' },
];

export default function LanguageScreen() {
    const { t, i18n } = useTranslation();

    const changeLanguage = async (lng: string) => {
        const isRTL = lng === 'ar';

        await i18n.changeLanguage(lng);

        // Explicitly set RTL state based on language
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);

        // Force app reload to apply new language and RTL globally
        await Updates.reloadAsync();
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Header */}
                <View className="flex-row items-center px-6 py-4 border-b border-surface-light">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#64748B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-text-primary ml-2">{t('language.title')}</Text>
                </View>

                <ScrollView className="flex-1 px-6 pt-6">
                    <View className="bg-surface-light rounded-3xl overflow-hidden border border-white/5">
                        {LANGUAGES.map((lang, index) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`flex-row items-center justify-between p-5 ${index !== LANGUAGES.length - 1 ? "border-b border-white/5" : ""
                                    }`}
                                onPress={() => changeLanguage(lang.code)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center gap-4">
                                    <Text className="text-2xl">{lang.icon}</Text>
                                    <Text className="text-text-primary text-base font-medium">{t(lang.label)}</Text>
                                </View>
                                {i18n.language === lang.code && (
                                    <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </SafeScreen>
    );
}
