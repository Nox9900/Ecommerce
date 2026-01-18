import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import { useTheme } from "@/lib/useTheme";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";
import useCategories from "@/hooks/useCategories";
import SubcategoryHeader from "@/components/shop/SubcategoryHeader";
import ProductListRow from "@/components/shop/ProductListRow";
import PromoBanners from "@/components/shop/PromoBanners";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import SwipeableCategoryView from "@/components/shop/SwipeableCategoryView";

export default function SubcategoryScreen() {
    const { id: initialId, name: initialName } = useLocalSearchParams<{ id: string; name: string }>();
    const { theme } = useTheme();
    const { data: products, isLoading: productsLoading, isError: productsError, refetch } = useProducts();
    const { data: categories } = useCategories();

    // Internal state for the current subcategory being viewed
    const [currentSubId, setCurrentSubId] = useState(initialId);
    const [currentSubName, setCurrentSubName] = useState(initialName || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Find the parent category
    const parentCategory = useMemo(() => {
        if (!categories || !currentSubId) return null;
        return categories.find(cat =>
            cat.subcategories?.some(sub => sub._id === currentSubId)
        ) || null;
    }, [categories, currentSubId]);

    // Identify the active subcategory color or fallback
    const activeSubColor = useMemo(() => {
        if (!parentCategory) return "#EF4444";
        const sub = parentCategory.subcategories?.find(s => s._id === currentSubId);
        return sub?.color || parentCategory.color || "#EF4444";
    }, [parentCategory, currentSubId]);

    // Generate sibling list
    const { siblings, activeSub } = useMemo(() => {
        if (!parentCategory) return { siblings: [], activeSub: null };

        const currentSub = parentCategory.subcategories?.find(sub => sub._id === currentSubId);

        return {
            siblings: parentCategory.subcategories || [],
            activeSub: currentSub || null
        };
    }, [parentCategory, currentSubId]);

    const currentIndex = useMemo(() => {
        return siblings.findIndex(s => s._id === currentSubId);
    }, [siblings, currentSubId]);

    // Update screen title/name if it wasn't provided but we found the subcategory in our data
    useEffect(() => {
        if (!currentSubName && activeSub) {
            setCurrentSubName(activeSub.name);
        }
    }, [activeSub, currentSubName]);

    // Products grouped by sibling subcategory
    const productsBySibling = useMemo(() => {
        if (!products || !parentCategory) return [];

        return siblings.map(sub => {
            let filtered = products;

            // Base filter: Always limit to the parent category first
            filtered = filtered.filter(p =>
                p.category?.toLowerCase() === parentCategory.name.toLowerCase()
            );

            // Filter by subcategory
            filtered = filtered.filter(p => {
                const matchesSubcategory = p.subcategory?.toLowerCase() === sub.name.toLowerCase();
                if (matchesSubcategory) return true;
                return p.name.toLowerCase().includes(sub.name.toLowerCase()) ||
                    p.description.toLowerCase().includes(sub.name.toLowerCase());
            });

            // Apply search query if present
            if (searchQuery.trim()) {
                filtered = filtered.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            return filtered;
        });
    }, [products, parentCategory, siblings, searchQuery]);

    const handleSubcategoryPress = (sub: any) => {
        setCurrentSubId(sub._id || "");
        setCurrentSubName(sub.name || "");
        setSearchQuery(""); // Clear search when switching subcategories
    };

    const handleSubcategorySwipe = (index: number) => {
        const sub = siblings[index];
        if (sub) {
            setCurrentSubId(sub._id || "");
            setCurrentSubName(sub.name || "");
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-[#F8F9FA] dark:bg-background">
                {/* Fixed Premium Header */}
                <SubcategoryHeader
                    title={currentSubName}
                    onSearch={setSearchQuery}
                    subcategories={siblings}
                    currentSubcategoryId={currentSubId}
                    onSubcategoryPress={handleSubcategoryPress}
                    activeColor={activeSubColor}
                />

                {searchQuery.trim() ? (
                    // Search layout: Single ScrollView
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 50 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="mt-2">
                            {productsBySibling[currentIndex]?.length > 0 ? (
                                productsBySibling[currentIndex].map((product, index) => (
                                    <AnimatedContainer key={product._id || `product-${index}`} animation="fadeUp" delay={index * 50}>
                                        <ProductListRow product={product} index={index} />
                                    </AnimatedContainer>
                                ))
                            ) : (
                                <View className="py-20 items-center px-10">
                                    <Text className="text-gray-400 text-center font-medium">
                                        No products found for "{searchQuery}"
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                ) : (
                    // Normal layout: Swipeable subcategories
                    <SwipeableCategoryView
                        currentIndex={currentIndex}
                        onIndexChange={handleSubcategorySwipe}
                    >
                        {siblings.map((sub, index) => (
                            <ScrollView
                                key={sub._id || `sub-${index}`}
                                className="flex-1"
                                contentContainerStyle={{ paddingBottom: 50 }}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        tintColor={theme === 'dark' ? "#fff" : "#000"}
                                    />
                                }
                            >
                                {/* Branded Section Title */}
                                <View className="px-4 py-3 bg-white dark:bg-zinc-900 mb-2 mt-px flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-1.5">
                                        <View
                                            className="w-1 h-4 rounded-full"
                                            style={{ backgroundColor: activeSubColor }}
                                        />
                                        <Text className="text-lg font-black dark:text-white" style={{ color: activeSubColor }}>
                                            10 Billion Subsidy
                                        </Text>
                                        <Text className="text-xs text-gray-400 font-medium ml-1">Up To 50% Off</Text>
                                    </View>
                                </View>

                                {/* Promo Banners (Dynamic) */}
                                <PromoBanners />

                                {/* Product List (Premium Rows) */}
                                <View className="mt-2">
                                    {productsLoading ? (
                                        <View className="py-20 items-center">
                                            <Text className="text-gray-400">Loading premium deals...</Text>
                                        </View>
                                    ) : (productsBySibling[index] || []).length > 0 ? (
                                        (productsBySibling[index] || []).map((product, pIndex) => (
                                            <AnimatedContainer key={product._id || `product-${index}-${pIndex}`} animation="fadeUp" delay={pIndex * 50}>
                                                <ProductListRow product={product} index={pIndex} />
                                            </AnimatedContainer>
                                        ))
                                    ) : (
                                        <View className="py-20 items-center px-10">
                                            <Text className="text-gray-400 text-center font-medium">
                                                No products found for "{sub.name}" in the subsidy program yet.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        ))}
                    </SwipeableCategoryView>
                )}
            </View>
        </SafeScreen>
    );
}
