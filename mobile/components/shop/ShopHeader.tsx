import { View, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useNotifications } from "@/context/NotificationContext";
import { AppText } from "../ui/AppText";

interface ShopHeaderProps {
    searchQuery?: string;
    onSearch?: (query: string) => void;
    onFilterPress?: () => void;
}

export default function ShopHeader({
    searchQuery = "",
    onSearch,
    onFilterPress,
}: ShopHeaderProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { unreadCount } = useNotifications();

    const handleSearchPress = () => {
        router.push({ pathname: "/search", params: { q: searchQuery } });
    };

    const handleClearSearch = () => {
        if (onSearch) onSearch("");
    };

    return (
        <View
            className="bg-white dark:bg-background pt-2 pb-2 px-4 border-b border-black/5 dark:border-white/5 z-50"
        >
            <View className="flex-row items-center justify-between h-12">
                {searchQuery ? (
                    // Active Search Mode (Display Result Header)
                    <View className="flex-1 flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={handleSearchPress}
                            className="flex-1 flex-row items-center bg-gray-100 dark:bg-white/10 rounded-full h-10 px-3"
                        >
                            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                            <AppText className="flex-1 ml-2 text-base text-text-primary" numberOfLines={1}>
                                {searchQuery}
                            </AppText>
                            {/* We keep the Close button as a separate touchable to avoid navigating when clearing */}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleClearSearch} className="p-1">
                            <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onFilterPress}
                            className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/5 dark:border-white/10"
                        >
                            <Ionicons name="options-outline" size={20} className="text-text-primary" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Default Header Mode
                    <>
                        <View>
                            <AppText className="text-text-primary text-2xl font-bold">{t('common.discover')}</AppText>
                            <AppText className="text-text-primary text-sm">{t('common.discover_desc')}</AppText>
                        </View>

                        <View className="flex-row items-center gap-3">
                            <TouchableOpacity
                                onPress={handleSearchPress}
                                className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/5 dark:border-white/10"
                            >
                                <Ionicons name="search-outline" size={22} className="text-text-primary" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={onFilterPress}
                                className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/5 dark:border-white/10"
                            >
                                <Ionicons name="options-outline" size={22} className="text-text-primary" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push("/(profile)/notifications" as any)}
                                className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/5 dark:border-white/10"
                            >
                                <Ionicons name="notifications-outline" size={22} className="text-text-primary" />
                                {unreadCount > 0 && (
                                    <View className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white dark:border-black">
                                        <AppText className="text-[9px] text-white font-bold">{unreadCount > 99 ? '99+' : unreadCount}</AppText>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}
