import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";
import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import { useMemo, useState } from "react";
import { useTheme } from "@/lib/useTheme";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { router } from "expo-router";

// New Components
import ShopHeader from "@/components/shop/ShopHeader";
import CategoryTabs from "@/components/shop/CategoryTabs";
import QuickLinksGrid from "@/components/shop/QuickLinksGrid";
import PromoBanners from "@/components/shop/PromoBanners";
import SwipeableCategoryView from "@/components/shop/SwipeableCategoryView";
import useCategories from "@/hooks/useCategories";

const ShopScreen = () => {
  const { theme } = useTheme();
  const { data: products, isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const { data: categories } = useCategories();

  // Build all categories including "all"
  const allCategories = useMemo(() => {
    return [
      { _id: "all", name: "All", icon: "" },
      ...(categories || [])
    ];
  }, [categories]);

  // Get current category index for swipe navigation
  const currentCategoryIndex = useMemo(() => {
    return allCategories.findIndex(cat => cat._id === selectedCategoryId);
  }, [allCategories, selectedCategoryId]);

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
      router.push({
        pathname: "/subcategory/[id]",
        params: { id: link._id, name: link.name }
      });
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

  // Group products by category for swipe navigation
  const productsByCategory = useMemo(() => {
    if (!products) return [];

    return allCategories.map(category => {
      let filtered = products;

      // Filter by category (except "all")
      if (category._id !== "all") {
        filtered = filtered.filter((product) => product.category === category.name);
      }

      // Apply search filter if active
      if (searchQuery.trim()) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return filtered;
    });
  }, [products, allCategories, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchProducts();
    setRefreshing(false);
  };

  const handleCategorySwipe = (index: number) => {
    const newCategoryId = allCategories[index]._id;
    setSelectedCategoryId(newCategoryId);
  };

  // If search is active, show single scrollable view with filtered results
  if (searchQuery.trim()) {
    const filteredProducts = products?.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
            {/* Waterfall Feed */}
            <AnimatedContainer animation="fadeUp" delay={200} className="px-2 mt-2">
              <ProductsGrid
                products={filteredProducts}
                isLoading={productsLoading}
                isError={productsError}
              />
            </AnimatedContainer>
          </ScrollView>
        </View>
      </SafeScreen>
    );
  }

  // Normal mode with swipeable categories
  return (
    <SafeScreen>
      <View className="flex-1 bg-white dark:bg-background">
        {/* Sticky Header */}
        <ShopHeader onSearch={setSearchQuery} />

        {/* Sticky Categories */}
        <CategoryTabs selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />

        {/* Swipeable Category Pages */}
        <SwipeableCategoryView
          currentIndex={currentCategoryIndex}
          onIndexChange={handleCategorySwipe}
        >
          {allCategories.map((category, index) => (
            <ScrollView
              key={category._id}
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
              <AnimatedContainer animation="fadeDown">
                <QuickLinksGrid
                  items={index === currentCategoryIndex ? subcategories : []}
                  onLinkPress={handleQuickLinkPress}
                />
              </AnimatedContainer>

              {/* Promo Banners */}
              <AnimatedContainer animation="fadeDown" delay={100}>
                <PromoBanners />
              </AnimatedContainer>

              {/* Waterfall Feed */}
              <AnimatedContainer animation="fadeUp" delay={200} className="px-2 mt-2">
                <ProductsGrid
                  products={productsByCategory[index] || []}
                  isLoading={productsLoading}
                  isError={productsError}
                />
              </AnimatedContainer>
            </ScrollView>
          ))}
        </SwipeableCategoryView>
      </View>
    </SafeScreen>
  );
};

export default ShopScreen;
