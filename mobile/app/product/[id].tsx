import SafeScreen from "@/components/SafeScreen";
import { ProductCard } from "@/components/ProductCard";
import useCart from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import useProducts from "@/hooks/useProducts";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  FlatList,
} from "react-native";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { addToCart, isAddingToCart } = useCart();

  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();
  const { getToken } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [startingChat, setStartingChat] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      { productId: product._id, quantity },
      {
        onSuccess: () => Alert.alert("Success", `${product.name} added to cart!`),
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
        },
      }
    );
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.name} - $${product.price.toFixed(2)}`,
        title: product.name,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleChatWithVendor = async () => {
    if (!product || startingChat) return;

    // Check if vendor exists
    if (!product.vendor) {
      Alert.alert("Error", "Vendor information not available");
      return;
    }

    try {
      setStartingChat(true);
      const token = await getToken();
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/chats`,
        { participantId: product.vendor }, // Assuming product.vendor is the ID or contains _id
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const conversation = response.data;
      router.push(`/chat/${conversation._id}` as any);
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to start chat with vendor");
    } finally {
      setStartingChat(false);
    }
  };

  // Filter related products by category
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.category === product.category && p._id !== product._id)
      .slice(0, 6); // Limit to 6 related products
  }, [product, allProducts]);

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = product.stock > 0;

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* HEADER */}
        <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-14 pb-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-full items-center justify-center border border-white/10"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-full items-center justify-center border border-white/10"
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* <TouchableOpacity
              className="bg-black/40 backdrop-blur-md w-12 h-12 rounded-full items-center justify-center border border-white/10"
              onPress={() => router.push("/chat/seller" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity> */}

            <TouchableOpacity
              className={`w-12 h-12 rounded-full items-center justify-center border border-white/10 ${isInWishlist(product._id) ? "bg-accent/20" : "bg-black/40 backdrop-blur-md"
                }`}
              onPress={() => toggleWishlist(product._id)}
              disabled={isAddingToWishlist || isRemovingFromWishlist}
              activeOpacity={0.7}
            >
              {isAddingToWishlist || isRemovingFromWishlist ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={isInWishlist(product._id) ? "heart" : "heart-outline"}
                  size={22}
                  color={isInWishlist(product._id) ? "#F43F5E" : "#FFFFFF"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* IMAGE GALLERY */}
          <View className="relative h-[450px]">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setSelectedImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {product.images.map((image: string, index: number) => (
                <View key={index} style={{ width, height: 450 }}>
                  <Image source={image} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={500} />
                  <View className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                </View>
              ))}
            </ScrollView>

            {/* Image Indicators */}
            <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-2">
              {product.images.map((_: any, index: number) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${index === selectedImageIndex ? "bg-white w-6" : "bg-white/30 w-1.5"
                    }`}
                />
              ))}
            </View>
          </View>

          {/* PRODUCT INFO */}
          <View className="px-6 -mt-8 pt-8 bg-background rounded-t-3xl">
            {/* Category & Rating */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-primary font-bold tracking-wider uppercase text-xs">{product.category}</Text>
              <View className="flex-row items-center bg-surface-light px-2.5 py-1 rounded-full border border-white/5">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-white font-bold ml-1 text-xs">
                  {product.averageRating.toFixed(1)} <Text className="text-text-tertiary">({product.totalReviews})</Text>
                </Text>
              </View>
            </View>

            {/* Product Name */}
            <Text className="text-text-primary text-3xl font-bold mb-2 leading-tight">{product.name}</Text>

            {/* Price & Stock */}
            <View className="flex-row items-end justify-between mb-6">
              <Text className="text-white text-4xl font-bold tracking-tight">
                <Text className="text-2xl text-primary">$</Text>
                {product.price.toFixed(2)}
              </Text>

              {inStock ? (
                <View className="flex-row items-center bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                  <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-500 font-bold text-xs uppercase tracking-wide">In Stock</Text>
                </View>
              ) : (
                <View className="flex-row items-center bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                  <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                  <Text className="text-red-500 font-bold text-xs uppercase tracking-wide">Sold Out</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-text-primary text-lg font-bold mb-3">Description</Text>
              <Text className="text-text-secondary text-base leading-7">{product.description}</Text>
            </View>

            {/* Reviews & Ratings Section */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary text-lg font-bold">Reviews</Text>
                <TouchableOpacity
                  className="flex-row items-center bg-primary/20 px-4 py-2 rounded-full border border-primary/30"
                  onPress={() => Alert.alert("Write Review", "Review modal coming soon!")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color="#6366F1" style={{ marginRight: 6 }} />
                  <Text className="text-primary font-bold text-sm">Write Review</Text>
                </TouchableOpacity>
              </View>

              {/* Rating Summary */}
              <View className="bg-surface-light p-5 rounded-2xl border border-white/5 mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="mr-6">
                    <Text className="text-white text-5xl font-bold">{product.averageRating.toFixed(1)}</Text>
                    <View className="flex-row mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.round(product.averageRating) ? "star" : "star-outline"}
                          size={16}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-secondary text-sm">Based on {product.totalReviews} reviews</Text>
                    <Text className="text-text-tertiary text-xs mt-1">Verified purchases only</Text>
                  </View>
                </View>
              </View>

              {/* Recent Reviews Preview */}
              <Text className="text-text-tertiary text-sm text-center">
                Tap "Write Review" to be the first to review this product
              </Text>
            </View>

            {/* Quantity Selector */}
            {inStock && (
              <View className="mb-8 p-4 bg-surface-light rounded-2xl border border-white/5 flex-row items-center justify-between">
                <Text className="text-text-primary font-bold">Quantity</Text>
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-white/10"
                  >
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                  <Text className="text-xl font-bold text-white w-6 text-center">{quantity}</Text>
                  <TouchableOpacity
                    onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                  >
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <View className="mt-8 mb-4">
                <View className="flex-row items-center justify-between px-6 mb-4">
                  <Text className="text-text-primary text-xl font-bold">You May Also Like</Text>
                  <TouchableOpacity onPress={() => router.push("/(tabs)/" as any)}>
                    <Text className="text-primary font-semibold text-sm">See All</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={relatedProducts}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 12 }}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item, index }) => (
                    <View style={{ width: width * 0.45 }}>
                      <ProductCard product={item} index={index} />
                    </View>
                  )}
                />
              </View>
            )}

          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/5 px-4 pt-4 pb-8">
          <View className="flex-row items-center gap-2">
            {/* Chat Button */}
            <TouchableOpacity
              className="bg-surface-light rounded-full p-4 items-center justify-center border border-white/10"
              activeOpacity={0.85}
              onPress={handleChatWithVendor}
              disabled={startingChat}
            >
              {startingChat ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Ionicons name="chatbubble-ellipses" size={22} color="#6366F1" />
              )}
              {startingChat ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Ionicons name="chatbubble-ellipses" size={22} color="#6366F1" />
              )}
            </TouchableOpacity>

            {/* Spacer */}
            <View className="flex-1" />

            {/* Buy Now Button - Smaller */}
            <TouchableOpacity
              className={`rounded-full px-5 py-3 flex-row items-center justify-center border-2 ${!inStock ? "bg-surface-light border-white/10" : "bg-transparent border-primary"
                }`}
              activeOpacity={0.85}
              onPress={() => {
                if (inStock) {
                  Alert.alert("Buy Now", "Proceeding to checkout...");
                }
              }}
              disabled={!inStock}
            >
              <Ionicons name="flash" size={16} color={!inStock ? "#94A3B8" : "#6366F1"} style={{ marginRight: 4 }} />
              <Text className={`font-bold text-xs ${!inStock ? "text-text-secondary" : "text-primary"}`}>
                {!inStock ? "Sold Out" : "Buy"}
              </Text>
            </TouchableOpacity>

            {/* Add to Cart Button - Smaller */}
            <TouchableOpacity
              className={`rounded-full px-5 py-3 flex-row items-center justify-center shadow-lg ${!inStock ? "bg-surface-light" : "bg-primary shadow-primary/25"
                }`}
              activeOpacity={0.85}
              onPress={handleAddToCart}
              disabled={!inStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Ionicons name="cart" size={16} color={!inStock ? "#94A3B8" : "white"} style={{ marginRight: 4 }} />
              )}
              {(isAddingToCart || !isAddingToCart) && (
                <Text className={`font-bold text-xs ${!inStock ? "text-text-secondary" : "text-white"} ${isAddingToCart ? 'hidden' : ''}`}>
                  Cart
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Product not found</Text>
        <Text className="text-text-secondary text-center mt-2">
          This product may have been removed or doesn&apos;t exist
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1DB954" />
        <Text className="text-text-secondary mt-4">Loading product...</Text>
      </View>
    </SafeScreen>
  );
}
