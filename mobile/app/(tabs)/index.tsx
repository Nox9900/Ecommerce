import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";
import useCategories from "@/hooks/useCategories";
import { useRandomShops } from "@/hooks/useShops";
import ShopCard from "@/components/ShopCard";

import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";

import { Hero } from "@/components/Hero";
import { useTheme } from "@/lib/useTheme";

const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { theme } = useTheme();

  const { data: products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: randomShops, isLoading: shopsLoading } = useRandomShops(5);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // filtering by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // filtering by searh query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* STICKY HEADER */}
        <View className="px-5 pb-4 pt-4 bg-background border-b border-white/5">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-text-primary text-2xl font-bold tracking-tight">Discover</Text>
              <Text className="text-text-secondary text-sm">Find your perfect item</Text>
            </View>

            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className={`p-2.5 rounded-full border ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}
                activeOpacity={0.7}
                onPress={() => setIsSearchExpanded(!isSearchExpanded)}
              >
                <Ionicons name="search-outline" size={20} color={theme === 'dark' ? "#fff" : "#000"} />
              </TouchableOpacity>

              <TouchableOpacity
                className={`p-2.5 rounded-full border ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={20} color={theme === 'dark' ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* EXPANDABLE SEARCH BAR */}
          {isSearchExpanded && (
            <View className="bg-surface-light flex-row items-center px-4 py-3.5 rounded-2xl border border-white/5">
              <Ionicons color={"#94A3B8"} size={20} name="search-outline" />
              <TextInput
                placeholder="Search products..."
                placeholderTextColor={"#64748B"}
                className="flex-1 ml-3 text-base text-text-primary"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => {
                setSearchQuery("");
                setIsSearchExpanded(false);
              }}>
                <Ionicons name="close-circle" size={20} color={"#64748B"} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >

          {/* CATEGORY FILTER */}
        <View className="mb-8 pl-5">
            <Text className="mt-2 text-text-primary text-lg font-bold mb-4">Categories</Text>
            {categoriesLoading ? (
              <ActivityIndicator color={theme === 'dark' ? "#fff" : "#000"} style={{ alignSelf: "flex-start" }} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {/* All Category */}
                <TouchableOpacity
                  onPress={() => setSelectedCategory("All")}
                  className={`mr-3 px-3 py-2 rounded-xl items-center border ${selectedCategory === "All"
                    ? "bg-primary border-primary"
                    : theme === 'dark'
                      ? "bg-surface-light border-white/10"
                      : "bg-surface-light border-black/5"
                    }`}
                  style={{ minWidth: 64 }}
                >
                  <Ionicons
                    name="apps-outline"
                    size={20}
                    color={
                      selectedCategory === "All"
                        ? theme === 'dark' ? "#262626" : "#FAFAFA"
                        : theme === 'dark' ? "#A3A3A3" : "#737373"
                    }
                    style={{ marginBottom: 4 }}
                  />
                  <Text className={`text-xs font-semibold ${selectedCategory === "All" ? "text-primary-foreground" : "text-text-secondary"}`}>
                    All
                  </Text>
                </TouchableOpacity>

                {categories?.map((category) => {
                  const isSelected = selectedCategory === category.name;
                  return (
                    <TouchableOpacity
                      key={category._id}
                      onPress={() => setSelectedCategory(category.name)}
                      className={`mr-3 px-3 py-2 rounded-xl items-center border ${isSelected
                        ? "bg-primary border-primary"
                        : theme === 'dark'
                          ? "bg-surface-light border-white/10"
                          : "bg-surface-light border-black/5"
                        }`}
                      style={{ minWidth: 64 }}
                    >
                      {category.icon && (
                        <Ionicons
                          name={category.icon as any}
                          size={20}
                          color={
                            isSelected
                              ? theme === 'dark' ? "#262626" : "#FAFAFA"
                              : theme === 'dark' ? "#A3A3A3" : "#737373"
                          }
                          style={{ marginBottom: 4 }}
                        />
                      )}
                      <Text className={`text-xs font-semibold text-center ${isSelected ? "text-primary-foreground" : "text-text-secondary"}`}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View className="px-5 mb-5 mt-6">
            <Hero />
          </View>

          {/* RANDOM SHOPS SECTION */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="text-text-primary text-lg font-bold">Shops to Explore</Text>
              <TouchableOpacity>
                <Text className="text-text-secondary text-sm font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            {shopsLoading ? (
              <ActivityIndicator color={theme === 'dark' ? "#fff" : "#000"} style={{ alignSelf: "flex-start", marginLeft: 20 }} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
              >
                {Array.isArray(randomShops) && randomShops.map((shop) => (
                  <ShopCard key={shop._id} shop={shop} />
                ))}
              </ScrollView>
            )}
          </View> 

          <View className=" mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="px-5 text-text-primary text-lg font-bold">Featured</Text>
            </View>

            {/* PRODUCTS GRID */}
            <ProductsGrid products={filteredProducts} isLoading={productsLoading} isError={productsError} />
          </View>
        </ScrollView>
      </View>
    </SafeScreen>
  );
};

export default ShopScreen;
