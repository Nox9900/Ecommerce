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

const ShopScreen = () => {
  const { theme } = useTheme();
  const { data: products, isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // filtering by category
    if (selectedCategoryId !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategoryId);
    }

    // filtering by searh query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
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
        <CategoryTabs selectedCategoryId={selectedCategoryId} onSelectCategory={setSelectedCategoryId} />

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
          {/* Only show promos/links if not searching to keep it clean, or keep them? 
              User didn't specify, but usually search results replace main feed. 
              For now, I'll keep them but usually you'd hide them. 
              I'll just filter the grid. 
          */}

          {/* Quick Links Grid */}
          {!searchQuery && (
            <AnimatedContainer animation="fadeDown">
              <QuickLinksGrid />
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
