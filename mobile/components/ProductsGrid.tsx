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
import VendorShopSlider from "./shop/VendorShopSlider";
import { useMemo } from "react";

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
  scrollEnabled?: boolean;
  showVendorSlider?: boolean;
}

type GridRow =
  | { type: 'product-row'; products: Product[]; id: string }
  | { type: 'vendor-slider'; id: string };

const ProductsGrid = ({
  products,
  isLoading,
  isError,
  scrollEnabled = false,
  showVendorSlider = false
}: ProductsGridProps) => {

  // Prepare grid rows with vendor slider inserted at random position
  const gridRows = useMemo<GridRow[]>(() => {
    if (!products || products.length === 0) return [];

    const rows: GridRow[] = [];
    let vendorSliderInserted = false;

    // Determine random insertion point (between products 6-10 means row 3-5)
    let insertAtRow = -1;
    if (showVendorSlider && products.length > 6) {
      const minRow = 3; // After 6 products (3 rows)
      const maxRow = Math.min(5, Math.ceil(products.length / 2)); // After 10 products (5 rows)
      insertAtRow = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
    }

    // Group products into rows of 2
    for (let i = 0; i < products.length; i += 2) {
      const currentRow = Math.floor(i / 2);

      // Insert vendor slider before this row if needed
      if (insertAtRow === currentRow && !vendorSliderInserted) {
        rows.push({
          type: 'vendor-slider',
          id: 'vendor-slider'
        });
        vendorSliderInserted = true;
      }

      const rowProducts = products.slice(i, i + 2);
      rows.push({
        type: 'product-row',
        products: rowProducts,
        id: `row-${i}`
      });
    }

    return rows;
  }, [products, showVendorSlider]);

  const renderRow = ({ item }: { item: GridRow }) => {
    if (item.type === 'vendor-slider') {
      return (
        <View className="w-full mb-4">
          <VendorShopSlider />
        </View>
      );
    }

    // Render product row
    return (
      <View className="flex-row justify-between px-2">
        {item.products.map((product, index) => (
          <View key={product._id} style={{ width: '49%' }}>
            <ProductCard
              product={product}
              index={gridRows.slice(0, gridRows.indexOf(item))
                .filter(r => r.type === 'product-row')
                .reduce((acc, r) => acc + (r as any).products.length, 0) + index
              }
            />
          </View>
        ))}
        {/* Add spacer if only one product in the row */}
        {item.products.length === 1 && <View style={{ width: '49%' }} />}
      </View>
    );
  };

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
      data={gridRows}
      renderItem={renderRow}
      keyExtractor={(item) => item.id}
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
