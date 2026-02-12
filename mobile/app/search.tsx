import { View, TextInput, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import SafeScreen from "@/components/SafeScreen";
import SearchHistory from "@/components/shop/SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useTheme } from "@/lib/useTheme";
import { AppText } from "@/components/ui/AppText";
import ProductsGrid from "@/components/ProductsGrid";
import useProducts from "@/hooks/useProducts";

export default function SearchScreen() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const params = useLocalSearchParams();
    const initialQuery = typeof params.q === 'string' ? params.q : "";

    const [query, setQuery] = useState(initialQuery);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [hasSearched, setHasSearched] = useState(!!initialQuery);
    const [refreshing, setRefreshing] = useState(false);

    const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();
    const inputRef = useRef<TextInput>(null);

    // Fetch products based on search query
    const queryParams = searchQuery ? { q: searchQuery } : {};
    const { data: products, isLoading, isError, refetch } = useProducts(queryParams);


    useEffect(() => {
        // Auto-focus on mount only if there's no initial query
        if (!initialQuery) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    // Debounced search: automatically search after user stops typing for 500ms
    useEffect(() => {
        if (query.trim().length >= 2) {
            const debounceTimer = setTimeout(() => {
                setSearchQuery(query.trim());
                setHasSearched(true);
            }, 500);
            return () => clearTimeout(debounceTimer);
        } else if (query.trim().length === 0 && hasSearched) {
            // Clear search when query is empty
            setSearchQuery("");
            setHasSearched(false);
        }
    }, [query]);

    // Sync params.q to query
    useEffect(() => {
        if (typeof params.q === 'string') {
            setQuery(params.q);
            setSearchQuery(params.q);
            setHasSearched(true);
        }
    }, [params.q]);

    const handleSearchSubmit = (term: string) => {
        if (!term.trim()) return;
        addToHistory(term);
        setSearchQuery(term);
        setHasSearched(true);
        // Keep user on this page instead of navigating away
    };

    const clearQuery = () => {
        setQuery("");
        setSearchQuery("");
        setHasSearched(false);
        inputRef.current?.focus();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-white dark:bg-background">
                {/* Header */}
                <View className="flex-row items-center px-4 py-2 border-b border-black/5 dark:border-white/5 gap-2">
                    <TouchableOpacity onPress={() => router.back()} className="p-1">
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "#9CA3AF" : "#525252"} />
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
                {!hasSearched || !searchQuery ? (
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
                ) : (
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={theme === 'dark' ? "#fff" : "#000"}
                            />
                        }
                    >
                        <View className="px-2 mt-2">
                            <ProductsGrid
                                products={products || []}
                                isLoading={isLoading}
                                isError={isError}
                                showVendorSlider={false}
                            />
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeScreen>
    );
}
