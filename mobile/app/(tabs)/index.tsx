import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";
import { View, ScrollView, RefreshControl, Alert } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { useTheme } from "@/lib/useTheme";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { router, useLocalSearchParams } from "expo-router";

// New Components
import ShopHeader from "@/components/shop/ShopHeader";
import CategoryTabs from "@/components/shop/CategoryTabs";
import QuickLinksGrid from "@/components/shop/QuickLinksGrid";
import PromoBanners from "@/components/shop/PromoBanners";
import SwipeableCategoryView from "@/components/shop/SwipeableCategoryView";
import useCategories from "@/hooks/useCategories";
import { getTranslated } from "@/lib/i18n-utils";
import { useTranslation } from "react-i18next";
import FilterModal from "@/components/shop/FilterModal";

const ShopScreen = () => {
  const { theme } = useTheme();
  const params = useLocalSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterParams, setFilterParams] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: 0,
    sort: "latest"
  });

  // Sync params.q to searchQuery
  useEffect(() => {
    if (typeof params.q === 'string') {
      setSearchQuery(params.q);
    } else if (params.q === undefined && searchQuery !== "") {
      // Optional: clear search if param is removed? 
      // Usually navigation back preserves params or clears them.
      // If we want to support clearing via back button?
      // Let's assume explicit clear sets param to empty string or we handle it in updated params.
    }
  }, [params.q]);

  // Hooks
  const { t, i18n } = useTranslation();
  const { data: categories } = useCategories();

  // Derived State
  const activeCategory = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return categories?.find((c) => c._id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  // Determine effective query params
  const queryParams = useMemo(() => {
    const params: any = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategoryId !== "all" && activeCategory) params.category = activeCategory.name;

    if (filterParams.minPrice) params.minPrice = parseFloat(filterParams.minPrice);
    if (filterParams.maxPrice) params.maxPrice = parseFloat(filterParams.maxPrice);
    if (filterParams.minRating > 0) params.minRating = filterParams.minRating;
    if (filterParams.sort) params.sort = filterParams.sort;

    return params;
  }, [searchQuery, selectedCategoryId, activeCategory, filterParams]);

  const { data: products, isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useProducts(queryParams);

  // Categories Setup
  const allCategories = useMemo(() => {
    const translatedCategories = (categories || []).map(cat => ({
      ...cat,
      name: getTranslated(cat, 'name', i18n.language)
    }));
    return [
      { _id: "all", name: t('common.all'), icon: "" },
      ...translatedCategories
    ];
  }, [categories, i18n.language]);

  const currentCategoryIndex = useMemo(() => {
    return allCategories.findIndex(cat => cat._id === selectedCategoryId);
  }, [allCategories, selectedCategoryId]);

  const subcategories = useMemo(() => {
    if (selectedCategoryId === "all") {
      const allSubcats = categories?.reduce((acc: any[], cat: any) => [...acc, ...(cat.subcategories || [])], []) || [];
      return [...allSubcats].sort(() => Math.random() - 0.5).slice(0, 15);
    }
    return activeCategory?.subcategories || [];
  }, [categories, activeCategory, selectedCategoryId]);

  // Handlers
  const handleQuickLinkPress = (link: any) => {
    if (link.name) {
      router.push({
        pathname: "/subcategory/[id]",
        params: { id: link._id, name: link.name }
      });
      return;
    }
    if (link.label === "9.9 Sale" || link.label === "Limited") {
      setSearchQuery(link.label === "9.9 Sale" ? "sale" : "limited");
      return;
    }
    const matchingCategory = categories?.find(
      (c) => c.name.toLowerCase() === link.label.toLowerCase()
    );
    if (matchingCategory) {
      setSelectedCategoryId(matchingCategory._id);
      return;
    }
    if (link.label === "More") {
      setSelectedCategoryId("all");
      return;
    }
    Alert.alert("Coming Soon", `${link.label} feature is coming soon!`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchProducts();
    setRefreshing(false);
  };

  const handleCategorySwipe = (index: number) => {
    const newCategoryId = allCategories[index]._id;
    setSelectedCategoryId(newCategoryId);
    if (searchQuery) setSearchQuery("");
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilterParams(newFilters);
  };

  // Render logic
  const isFiltering = !!(searchQuery || filterParams.minPrice || filterParams.maxPrice || filterParams.minRating > 0 || filterParams.sort !== "latest");

  return (
    <SafeScreen>
      <View className="flex-1 bg-white dark:bg-background">
        <ShopHeader
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onFilterPress={() => setIsFilterModalVisible(true)}
        />

        <CategoryTabs selectedCategoryId={selectedCategoryId} onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          setSearchQuery("");
        }} />

        {isFiltering ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? "#fff" : "#000"} />
            }
          >
            <AnimatedContainer animation="fadeUp" delay={200} className="px-2 mt-2">
              <ProductsGrid
                products={products || []}
                isLoading={productsLoading}
                isError={productsError}
                showVendorSlider={false}
              />
            </AnimatedContainer>
          </ScrollView>
        ) : (
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
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? "#fff" : "#000"} />
                }
              >
                <AnimatedContainer animation="fadeDown">
                  <QuickLinksGrid
                    items={category._id === selectedCategoryId ? subcategories : []}
                    onLinkPress={handleQuickLinkPress}
                  />
                </AnimatedContainer>

                <AnimatedContainer animation="fadeDown" delay={100}>
                  <PromoBanners />
                </AnimatedContainer>

                <AnimatedContainer animation="fadeUp" delay={200} className="px-2 mt-2">
                  <ProductsGrid
                    products={products || []}
                    isLoading={productsLoading}
                    isError={productsError}
                    showVendorSlider={true}
                  />
                </AnimatedContainer>
              </ScrollView>
            ))}
          </SwipeableCategoryView>
        )}

        <FilterModal
          visible={isFilterModalVisible}
          onClose={() => setIsFilterModalVisible(false)}
          onApply={handleApplyFilters}
          initialFilters={filterParams}
        />
      </View>
    </SafeScreen>
  );
};

export default ShopScreen;
