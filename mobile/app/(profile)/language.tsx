import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View, ScrollView, I18nManager, DevSettings, NativeModules } from "react-native";
import { AppText } from "@/components/ui/AppText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import Header from "@/components/Header";

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
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const changeLanguage = async (lng: string) => {
        try {
            const isRTL = lng === 'ar';

            // 1. Save language preference directly to storage
            // This is picked up by i18n.ts on the next app boot
            await AsyncStorage.setItem('user-language', lng);

            // 2. Set RTL state safely
            try {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);
            } catch (i18nError) {
                console.warn("I18nManager error:", i18nError);
            }

            // 3. Reload the application
            // We use a small timeout to ensure the storage operation is flushed
            // and to avoid race conditions with the current event loop.
            setTimeout(async () => {
                try {
                    if (__DEV__) {
                        // Use DevSettings in development (Expo Go)
                        // DevSettings might not be directly exported in some versions, check NativeModules fallback
                        if (DevSettings && DevSettings.reload) {
                            DevSettings.reload();
                        } else if (NativeModules.DevSettings && NativeModules.DevSettings.reload) {
                            NativeModules.DevSettings.reload();
                        } else {
                            // Fallback or error
                            await Updates.reloadAsync();
                        }
                    } else {
                        await Updates.reloadAsync();
                    }
                } catch (reloadError) {
                    console.error("Failed to reload app:", reloadError);
                }
            }, 50);
        } catch (error) {
            console.error("Error changing language:", error);
        }
    };

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <Header primaryText={t('profile.language')} secondaryText={t('language.title')} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 py-8">
                    <AnimatedContainer animation="fadeUp" delay={100}>
                        <View className="border-black/10 dark:border-white/10 overflow-hidden">
                            {LANGUAGES.map((lang, index) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    className={`flex-row items-center justify-between p-6 ${index !== LANGUAGES.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""
                                        }`}
                                    onPress={() => changeLanguage(lang.code)}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center gap-5">
                                        <View className="w-12 h-12 rounded-2xl items-center justify-center border border-black/5 dark:border-white/5">
                                            <AppText className="text-2xl">{lang.icon}</AppText>
                                        </View>
                                        <AppText className="text-text-primary text-base font-bold">{t(lang.label)}</AppText>
                                    </View>
                                    {i18n.language === lang.code ? (
                                        <View className="w-8 h-8 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30">
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        </View>
                                    ) : (
                                        <View className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </AnimatedContainer>

                    <AnimatedContainer animation="fadeUp" delay={300} className="mt-10 px-4">
                        <View className="bg-primary/5 rounded-3xl p-5 border border-primary/10 flex-row items-center">
                            <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
                            <AppText className="text-text-tertiary text-xs ml-3 flex-1 leading-5">
                                {t('language.info')}
                            </AppText>
                        </View>
                    </AnimatedContainer>
                </View>
            </ScrollView>
        </View>
    );
}
