import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import SafeScreen from "@/components/SafeScreen";
import SearchHistory from "@/components/shop/SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useTheme } from "@/lib/useTheme";
import { AppText } from "@/components/ui/AppText";

export default function SearchScreen() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const params = useLocalSearchParams();
    const initialQuery = typeof params.q === 'string' ? params.q : "";

    const [query, setQuery] = useState(initialQuery);
    const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        // Auto-focus on mount
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSearchSubmit = (term: string) => {
        if (!term.trim()) return;
        addToHistory(term);
        // Navigate back to Shop (Home) with query param
        // We use 'replace' to avoid building up history stack of search pages? 
        // Actually, push is better for 'back' behavior if user wants to change search.
        // But since this IS the search page, we want to go back to results.
        // Using `router.navigate` to existing tab with params.
        router.navigate({ pathname: "/(tabs)", params: { q: term } });
    };

    const clearQuery = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-white dark:bg-background">
                {/* Header */}
                <View className="flex-row items-center px-4 py-2 border-b border-black/5 dark:border-white/5 gap-2">
                    <TouchableOpacity onPress={() => router.back()} className="p-1">
                        <Ionicons name="arrow-back" size={24} className="text-text-primary" />
                    </TouchableOpacity>

                    <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-white/10 rounded-full px-3 ">
                        <Ionicons name="search-outline" size={20} color={theme === 'dark' ? "#9CA3AF" : "#525252"} />
                        <TextInput
                            ref={inputRef}
                            className="flex-1 ml-2 text-base text-text-primary h-full"
                            placeholder={t('common.search')}
                            placeholderTextColor={theme === 'dark' ? "#9CA3AF" : "#737373"}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={() => handleSearchSubmit(query)}
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={clearQuery}>
                                <Ionicons name="close-circle" size={18} color={theme === 'dark' ? "#9CA3AF" : "#525252"} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content */}
                <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                    {/* History */}
                    <SearchHistory
                        history={history}
                        onSelect={handleSearchSubmit}
                        onClear={clearHistory}
                        onRemove={removeFromHistory}
                        visible={true}
                    />
                </ScrollView>
            </View>
        </SafeScreen>
    );
}
