import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useMemo, useState } from "react";
import { useTheme } from "@/lib/useTheme";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

// New Components
import ShopHeader from "@/components/shop/ShopHeader";
import CategoryTabs from "@/components/shop/CategoryTabs";
import QuickLinksGrid from "@/components/shop/QuickLinksGrid";
import PromoBanners from "@/components/shop/PromoBanners";
import useCategories from "@/hooks/useCategories";
import { Alert } from "react-native";

const ShopScreen = () => {
  const { theme } = useTheme();
  const { data: products, isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const { data: categories } = useCategories();

  const activeCategory = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return categories?.find((c) => c._id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const subcategories = useMemo(() => {
    if (selectedCategoryId === "all") {
      return categories?.reduce((acc: any[], cat: any) => [...acc, ...(cat.subcategories || [])], []) || [];
    }
    return activeCategory?.subcategories || [];
  }, [categories, activeCategory, selectedCategoryId]);

  const handleQuickLinkPress = (link: any) => {
    // If it's a subcategory from the database
    if (link.name) {
      setSearchQuery(link.name);
      return;
    }

    // 1. Search Logic
    if (link.label === "9.9 Sale" || link.label === "Limited") {
      setSearchQuery(link.label === "9.9 Sale" ? "sale" : "limited");
      return;
    }

    // 2. Category Logic
    const matchingCategory = categories?.find(
      (c) => c.name.toLowerCase() === link.label.toLowerCase()
    );

    if (matchingCategory) {
      setSelectedCategoryId(matchingCategory._id);
      return;
    }

    // 3. Specials / Utilities
    if (link.label === "More") {
      setSelectedCategoryId("all");
      return;
    }

    // placeholder for others
    Alert.alert("Coming Soon", `${link.label} feature is coming soon!`);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // filtering by category
    if (selectedCategoryId !== "all" && activeCategory) {
      filtered = filtered.filter((product) => product.category === activeCategory.name);
    }

    // filtering by searh query (acts as subcategory filter if user clicked subcategory)
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategoryId, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchProducts();
    setRefreshing(false);
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-white dark:bg-background">
        {/* Sticky Header */}
        <ShopHeader onSearch={setSearchQuery} />

        {/* Sticky Categories */}
        <CategoryTabs selectedCategoryId={selectedCategoryId} onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          setSearchQuery(""); // Reset search when switching categories
        }} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme === 'dark' ? "#fff" : "#000"}
            />
          }
        >
          {/* Quick Links Grid */}
          {!searchQuery && (
            <AnimatedContainer animation="fadeDown">
              <QuickLinksGrid
                items={subcategories}
                onLinkPress={handleQuickLinkPress}
              />
            </AnimatedContainer>
          )}

          {/* Promo Banners */}
          {!searchQuery && (
            <AnimatedContainer animation="fadeDown" delay={100}>
              <PromoBanners />
            </AnimatedContainer>
          )}

          {/* Waterfall Feed */}
          <AnimatedContainer animation="fadeUp" delay={200} className="px-2 mt-2">
            <ProductsGrid
              products={filteredProducts || []}
              isLoading={productsLoading}
              isError={productsError}
            />
          </AnimatedContainer>
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default ShopScreen;
