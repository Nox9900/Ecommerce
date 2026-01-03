import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";

import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";

import { Hero } from "@/components/Hero";
// ... imports

const CATEGORIES = [
  { name: "All", icon: "apps-outline" as const },
  { name: "Electronics", icon: "laptop-outline" as const },
  { name: "Accessories", icon: "laptop" as const },
  { name: "Fashion", icon: "shirt-outline" as const },
  { name: "Sports", icon: "basketball-outline" as const },
  { name: "Books", icon: "book-outline" as const },
];

const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: products, isLoading, isError } = useProducts();

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
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-primary text-2xl font-bold tracking-tight">Discover</Text>
              <Text className="text-text-secondary text-sm">Find your perfect item</Text>
            </View>

            <TouchableOpacity className="bg-surface-light p-2.5 rounded-full border border-white/10" activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={20} color={"#fff"} />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR */}
          <View className="bg-surface-light flex-row items-center px-4 py-3.5 rounded-2xl border border-white/5">
            <Ionicons color={"#94A3B8"} size={20} name="search-outline" />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={"#64748B"}
              className="flex-1 ml-3 text-base text-text-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* HERO SECTION */}
        <View className="px-5 mb-8">
          <Hero />
        </View>

        {/* CATEGORY FILTER */}
        <View className="mb-8 pl-5">
          <Text className="text-text-primary text-lg font-bold mb-4">Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`mr-3 px-5 py-2.5 rounded-full flex-row items-center border ${isSelected ? "bg-primary border-primary" : "bg-surface-light border-white/5"}`}
                >
                  {category.icon && (
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={isSelected ? "#fff" : "#94A3B8"}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text className={`text-sm font-semibold ${isSelected ? "text-white" : "text-text-secondary"}`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">Featured</Text>
            <Text className="text-primary text-sm font-medium">See All</Text>
          </View>

          {/* PRODUCTS GRID */}
          <ProductsGrid products={filteredProducts} isLoading={isLoading} isError={isError} />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;
