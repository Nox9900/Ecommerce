import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
// import useCart from "@/hooks/useCart"; // Removed as now inside ProductCard
// import useWishlist from "@/hooks/useWishlist"; // Removed as now inside ProductCard
import { ProductCard } from "./ProductCard";

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
  scrollEnabled?: boolean;
}

const ProductsGrid = ({ products, isLoading, isError, scrollEnabled = false }: ProductsGridProps) => {

  const renderProduct = ({ item: product, index }: { item: Product; index: number }) => (
    <ProductCard product={product} index={index} />
  );

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-text-secondary mt-4">Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-text-primary font-semibold mt-4">Failed to load products</Text>
        <Text className="text-text-secondary text-sm mt-2">Please try again later</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color={"#666"} />
      <Text className="text-text-primary font-semibold mt-4">No products found</Text>
      <Text className="text-text-secondary text-sm mt-2">Try adjusting your filters</Text>
    </View>
  );
}
