import SafeScreen from "@/components/SafeScreen";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GlassView } from "@/components/ui/GlassView";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/components/Header";
import LoadingUI from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/Error";
import EmptyUI from "@/components/ui/Empty";

function WishlistScreen() {
  const { wishlist, isLoading, isError, removeFromWishlist, isRemovingFromWishlist } =
    useWishlist();
  const { addToCart, isAddingToCart } = useCart();
  const insets = useSafeAreaInsets();

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    Alert.alert("Remove from wishlist", `Remove ${productName} from wishlist`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromWishlist(productId),
      },
    ]);
  };

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(
      { productId, quantity: 1 },
      {
        onSuccess: () => Alert.alert("Success", `${productName} added to cart!`),
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
        },
      }
    );
  };

  if (isLoading) return <LoadingUI title="Loading" subtitle="Loading your wishlist" />;
  if (isError) return <ErrorUI title="Something went wrong" subtitle="We couldn't retrieve your saved items. Please try again." buttonTitle="Go Back" buttonAction={() => router.back()} />;

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <Header primaryText="Wishlist" secondaryText="All the items you liked" />

      {wishlist.length === 0 ? (
        <EmptyUI title="Your wishlist is empty" subtitle="Start building your dream collection! Add products you love to keep an eye on them." buttonTitle="Explore" buttonAction={() => router.push("/(tabs)/" as any)} />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="px-6 py-6">
            {wishlist.map((item, index) => (
              <AnimatedContainer animation="fadeUp" delay={index * 100} key={item._id}>
                <TouchableOpacity
                  className="mb-6 flex-row"
                  onPress={() => router.push(`/product/${item._id}` as any)}
                  activeOpacity={0.7}
                >
                  <View className="relative">
                    <View className="shadow-lg shadow-black/20">
                      <Image
                        source={item.images[0]}
                        style={{ height: 100, width: 100, borderRadius: 20 }}
                        contentFit="cover"
                        transition={500}
                      />
                    </View>
                  </View>

                  <View className="flex-1 ml-5 pt-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text className="text-text-primary font-bold text-lg flex-1 mr-2" numberOfLines={2}>
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item._id, item.name);
                        }}
                        className="p-1 -mr-1"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text className="text-text-primary font-black text-lg mb-2">
                      <Text className="text-primary text-sm">$</Text>{item.price.toFixed(2)}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      {/* Stock Badge */}
                      <View
                        className="px-3 py-1 rounded-lg border flex-row items-center"
                        style={{
                          backgroundColor: (item.stock > 0 ? "#22C55E" : "#EF4444") + "10",
                          borderColor: (item.stock > 0 ? "#22C55E" : "#EF4444") + "30"
                        }}
                      >
                        <View className={`w-1.5 h-1.5 rounded-full mr-2 ${item.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                        <Text
                          className="text-[10px] font-black uppercase tracking-wider"
                          style={{ color: item.stock > 0 ? "#22C55E" : "#EF4444" }}
                        >
                          {item.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Text>
                      </View>

                      {/* Add to Cart Button (Small) */}
                      {item.stock > 0 && (
                        <TouchableOpacity
                          className="w-8 h-8 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item._id, item.name);
                          }}
                        >
                          <Ionicons name="cart-outline" size={16} className="text-text-primary" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <View className="h-[1px] bg-black/5 dark:bg-white/5 w-full mb-6" />
              </AnimatedContainer>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default WishlistScreen;
