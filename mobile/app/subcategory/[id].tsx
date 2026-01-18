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

    // Generate sibling list including "All"
    const { siblings, activeSub } = useMemo(() => {
        if (!parentCategory) return { siblings: [], activeSub: null };

        const currentSub = parentCategory.subcategories?.find(sub => sub._id === currentSubId);

        const allSiblings = [
            { _id: "all", name: "All " + parentCategory.name, color: activeSubColor },
            ...(parentCategory.subcategories || [])
        ];

        return {
            siblings: allSiblings,
            activeSub: currentSub || (currentSubId === "all" ? { _id: "all", name: "All " + parentCategory.name, color: activeSubColor } : null)
        };
    }, [parentCategory, currentSubId, activeSubColor]);

    // Update screen title/name if it wasn't provided but we found the subcategory in our data
    useEffect(() => {
        if (!currentSubName && activeSub) {
            setCurrentSubName(activeSub.name);
        }
    }, [activeSub, currentSubName]);

    const filteredProducts = useMemo(() => {
        if (!products || !parentCategory) return [];

        let filtered = products;

        // Base filter: Always limit to the parent category first
        filtered = filtered.filter(p =>
            p.category?.toLowerCase() === parentCategory.name.toLowerCase()
        );

        // If a specific subcategory (not "All") is selected, filter further
        if (currentSubId !== "all" && currentSubName) {
            filtered = filtered.filter(p => {
                const matchesSubcategory = p.subcategory?.toLowerCase() === currentSubName.toLowerCase();

                // If the product explicitly has this subcategory, it's a perfect match
                if (matchesSubcategory) return true;

                // Fallback: check if the subcategory name is in the title/desc
                return p.name.toLowerCase().includes(currentSubName.toLowerCase()) ||
                    p.description.toLowerCase().includes(currentSubName.toLowerCase());
            });
        }

        // Search query filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, currentSubName, currentSubId, parentCategory, searchQuery]);

    const handleSubcategoryPress = (sub: any) => {
        setCurrentSubId(sub._id);
        setCurrentSubName(sub.name);
        setSearchQuery(""); // Clear search when switching subcategories
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

                <ScrollView
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
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => (
                                <AnimatedContainer key={product._id || `product-${index}`} animation="fadeUp" delay={index * 50}>
                                    <ProductListRow product={product} index={index} />
                                </AnimatedContainer>
                            ))
                        ) : (
                            <View className="py-20 items-center px-10">
                                <Text className="text-gray-400 text-center font-medium">
                                    No products found for "{currentSubName}" in the subsidy program yet.
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeScreen>
    );
}
