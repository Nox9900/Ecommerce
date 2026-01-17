import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

interface ShopHeaderProps {
    onSearch?: (query: string) => void;
}

export default function ShopHeader({ onSearch }: ShopHeaderProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useTranslation();

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (onSearch) onSearch(text);
    };

    const toggleSearch = () => {
        if (isSearchActive) {
            // Clear search when closing
            handleSearchChange("");
            setIsSearchActive(false);
        } else {
            setIsSearchActive(true);
        }
    };

    return (
        <View
            className="bg-white dark:bg-background pt-2 pb-2 px-6 border-b border-black/5 dark:border-white/5"
            style={{ paddingTop: insets.top }}
        >
            <View className="flex-row items-center justify-between h-12">
                {isSearchActive ? (
                    // Search Mode
                    <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-white/10 rounded-full">
                        <Ionicons name="search-outline" size={20} color="#9CA3AF" className="ml-2" />
                        <TextInput
                            className="flex-1 p-2 text-base text-text-primary"
                            placeholder={t('common.search')}
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            autoFocus
                        />
                        <TouchableOpacity onPress={toggleSearch}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" className="mr-2" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Normal Mode
                    <>
                        <View>
                            <Text className="text-text-primary text-2xl font-bold">{t('common.discover')}</Text>
                            <Text className="text-text-primary text-sm">{t('common.discover_desc')}</Text>
                        </View>

                        <View className="flex-row items-center gap-4">
                            <TouchableOpacity
                                onPress={toggleSearch}
                                className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/5 dark:border-white/10"
                            >
                                <Ionicons name="search-outline" size={22} className="text-text-primary" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push("/(profile)/notifications" as any)}
                                className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/5 dark:border-white/10"
                            >
                                <Ionicons name="notifications-outline" size={22} className="text-text-primary" />
                                {/* Optional notification badge could go here */}
                                {/* <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" /> */}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}
