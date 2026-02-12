import SafeScreen from "@/components/SafeScreen";
import { ProductCard } from "@/components/ProductCard";
import useCart from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import useProducts from "@/hooks/useProducts";
import useWishlist from "@/hooks/useWishlist";
import { useProductReviews } from "@/hooks/useReviews";
import { useOrders } from "@/hooks/useOrders";
import { useAddresses } from "@/hooks/useAddressess";
import { useStripe } from "@stripe/stripe-react-native";
import { useApi } from "@/lib/api";
import ReviewModal from "@/components/ReviewModal";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import VariantSelectionModal from "@/components/VariantSelectionModal";
import { Address } from "@/types";
import { useTranslation } from "react-i18next";
import { getTranslated } from "@/lib/i18n-utils";
import { UserAvatar } from "@/components/UserAvatar";
import * as Sentry from "@sentry/react-native";
import { Ionicons } from "@expo/vector-icons";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useRef } from "react";
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
  Modal,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Skeleton, ProductCardSkeleton } from "@/components/common/Skeleton";
import { useToast } from "@/context/ToastContext";

const { width } = Dimensions.get("window");

const ProductDetailSkeleton = () => {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background">
      <Skeleton width="100%" height={400} borderRadius={0} />
      <View className="px-6 pt-6 gap-4">
        <Skeleton width={100} height={24} borderRadius={20} />
        <Skeleton width="90%" height={32} />
        <Skeleton width="40%" height={24} />
        <View className="h-1 bg-black/5 dark:bg-white/5 my-4" />
        <View className="flex-row gap-4">
          <Skeleton width={80} height={80} borderRadius={12} />
          <Skeleton width={80} height={80} borderRadius={12} />
          <Skeleton width={80} height={80} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={100} borderRadius={12} />
      </View>
    </View>
  );
};

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { addToCart, isAddingToCart, clearCart } = useCart();
  const { addresses } = useAddresses();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const api = useApi();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();
  const { getToken } = useAuth();
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'cart' | 'buy'>('buy');
  const [viewerImageIndex, setViewerImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [startingChat, setStartingChat] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { data: reviews } = useProductReviews(id);
  const { data: orders } = useOrders();

  // Find a delivered order for this product that hasn't been reviewed yet
  const eligibleOrder = useMemo(() => {
    if (!orders) return null;
    return orders.find(
      (order) =>
        order.status === "delivered" &&
        order.orderItems.some((item) => item.product._id === id) &&
        !order.hasReviewed
    );
  }, [orders, id]);

  // Variant Matching Logic
  const selectedVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;

    // Check if all required attributes have a selected value
    const attributeNames = (product.attributes || []).map(a => a.name);
    const allOptionsSelected = attributeNames.every(name => selectedOptions[name]);

    if (!allOptionsSelected) return null;

    // Find variant that matches all selected options
    return product.variants.find(variant => {
      return attributeNames.every(name => variant.options[name] === selectedOptions[name]);
    });
  }, [product, selectedOptions]);

  const currentPrice = selectedVariant ? selectedVariant.price : product?.price ?? 0;
  const currentImage = selectedVariant?.image || (product?.images && product.images.length > 0 ? product.images[0] : null);
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const inStock = currentStock > 0;

  const handleAddToCart = () => {
    if (!product) return;
    setModalMode('cart');
    setIsVariantModalVisible(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
    setModalMode('buy');
    setIsVariantModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    if (!product) return;
    setAddressModalVisible(false);

    Sentry.logger.info("Direct Buy initiated", {
      productId: product._id,
      variantId: selectedVariant?._id,
      quantity,
      total: currentPrice * quantity,
    });

    try {
      setPaymentLoading(true);

      const items = [{
        product: product,
        quantity,
        variantId: selectedVariant?._id,
        selectedOptions
      }];

      const { data } = await api.post("/payment/create-intent", {
        cartItems: items,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phoneNumber: selectedAddress.phoneNumber,
        },
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "E-Commerce App",
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setPaymentLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert("Payment cancelled", presentError.message);
      } else {
        Alert.alert(t('common.success'), t('common.payment_success'));
        // Optionally navigate to orders or stay on page
      }
    } catch (error) {
      console.error("Direct buy payment failed:", error);
      Alert.alert(t('common.error'), t('common.error_desc'));
    } finally {
      setPaymentLoading(false);
    }
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
      // Ensure we're sending the vendor ID string, not the object
      const vendorId = typeof product.vendor === 'object' ? (product.vendor as any)._id : product.vendor;
      const { data: conversation } = await api.post("/chats", { participantId: vendorId });

      router.push({
        pathname: `/chat/${conversation._id}`,
        params: {
          productId: product._id,
          productName: product.name,
          productImage: product.images[0]
        }
      } as any);
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

  const { showToast } = useToast();

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <ErrorUI />;


  return (
    <SafeScreen>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View
        className={`absolute left-0 right-0 z-50 px-6 flex-row items-center justify-between pb-3 transition-all duration-300 ${isScrolled ? (theme === 'dark' ? "bg-background border-white/10" : "bg-white border-black/5") : "bg-transparent"
          }`}
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center border backdrop-blur-md ${isScrolled
            ? (theme === 'dark' ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10")
            : "bg-black/30 border-white/20"
            }`}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={isScrolled ? (theme === 'dark' ? "#fff" : "#000") : "#fff"}
          />
        </TouchableOpacity>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center border backdrop-blur-md ${isScrolled
              ? (theme === 'dark' ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10")
              : "bg-black/30 border-white/20"
              }`}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={isScrolled ? (theme === 'dark' ? "#fff" : "#000") : "#fff"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center border backdrop-blur-md ${isInWishlist(product._id)
              ? "bg-red-500/20 border-red-500/50"
              : isScrolled
                ? (theme === 'dark' ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10")
                : "bg-black/30 border-white/20"
              }`}
            onPress={() => toggleWishlist(product._id)}
            disabled={isAddingToWishlist || isRemovingFromWishlist}
            activeOpacity={0.7}
          >
            {isAddingToWishlist || isRemovingFromWishlist ? (
              <ActivityIndicator size="small" color={isScrolled ? (theme === 'dark' ? "#fff" : "#000") : "#fff"} />
            ) : (
              <Ionicons
                name={isInWishlist(product._id) ? "heart" : "heart-outline"}
                size={20}
                color={isInWishlist(product._id) ? "#EF4444" : (isScrolled ? (theme === 'dark' ? "#fff" : "#000") : "#fff")}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        onScroll={(e) => {
          const scrollY = e.nativeEvent.contentOffset.y;
          const newIsScrolled = scrollY > 50;
          if (newIsScrolled !== isScrolled) {
            setIsScrolled(newIsScrolled);
          }
        }}
        scrollEventThrottle={32}
      >
        {/* IMAGE GALLERY */}
        <View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              if (index !== selectedImageIndex) {
                setSelectedImageIndex(index);
              }
            }}
            scrollEventThrottle={32}
          >
            {product.images.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  setViewerImageIndex(index);
                  setIsImageViewerVisible(true);
                }}
                style={{ width, height: 400 }}
              >
                <OptimizedImage
                  source={image}
                  width={width * 2} // Retina width 
                  height={800} // 400 * 2
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Page Indicators - Simple dot overlay */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${index === selectedImageIndex ? "bg-white w-4" : "bg-white/40 w-1.5"}`}
              />
            ))}
          </View>
        </View>

        {/* Thumbnails Strip - Placed directly above content */}
        <View className={`pt-4 pb-2 px-4 ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
          >
            {product.images.map((image: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedImageIndex(index);
                  scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
                }}
                className={`w-16 h-16 overflow-hidden ${selectedImageIndex === index ? "border-b-2 border-primary" : ""}`}
                style={{
                  transform: [{ scale: selectedImageIndex === index ? 1.05 : 1 }],
                }}
              >
                <OptimizedImage
                  source={image}
                  width={128} // 64px * 2
                  height={128}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                {selectedImageIndex !== index && (
                  <View className="absolute inset-0 bg-black/10" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CONTENT CONTAINER */}
        <View className={`px-6 pt-6 ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>


          {/* Category & Rating */}
          <AnimatedContainer animation="fadeUp" delay={200} className="flex-row items-center justify-between mb-3">
            <View className={`px-3 py-1 rounded-full border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"}`}>
              <Text className="text-text-secondary font-bold tracking-wider uppercase text-[10px]">{product.category}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-text-primary font-bold ml-1.5 text-base">
                {product.averageRating.toFixed(1)} <Text className="text-text-tertiary text-sm font-medium">({product.totalReviews} reviews)</Text>
              </Text>
            </View>
          </AnimatedContainer>

          {/* Product Name */}
          <AnimatedContainer animation="fadeUp" delay={300}>
            <Text className="text-text-primary text-3xl font-black mb-4 leading-tight tracking-tight">
              {getTranslated(product, 'name', i18n.language)}
            </Text>
          </AnimatedContainer>

          {/* Price & Stock */}
          <AnimatedContainer animation="fadeUp" delay={400} className="flex-row items-end justify-between mb-8 pb-8 border-b border-black/5 dark:border-white/5">
            <View>
              <Text className="text-text-tertiary text-sm font-medium mb-1">Price</Text>
              <Text className="text-text-primary text-4xl font-black tracking-tight">
                <Text className="text-2xl text-primary font-bold">$</Text>
                {currentPrice.toFixed(2)}
              </Text>
            </View>

            {inStock ? (
              <View className="items-end">
                <View className="flex-row items-center bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 mb-1">
                  <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wide">In Stock</Text>
                </View>
                <Text className="text-text-tertiary text-xs">{currentStock} items left</Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                <View className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-600 dark:text-green-400 font-bold text-xs uppercase tracking-wide">Sold Out</Text>
              </View>
            )}
          </AnimatedContainer>





          {/* Description */}
          <AnimatedContainer animation="fadeUp" delay={500} className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">Description</Text>
            <Text className="text-text-secondary text-base leading-7">
              {getTranslated(product, 'description', i18n.language)}
            </Text>
          </AnimatedContainer>

          {/* Reviews & Ratings Section */}
          <AnimatedContainer animation="fadeUp" delay={600} className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text-primary text-lg font-bold">Reviews</Text>
              {eligibleOrder && (
                <TouchableOpacity
                  className="flex-row items-center bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
                  onPress={() => setIsReviewModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color="#6366F1" style={{ marginRight: 6 }} />
                  <Text className="text-primary font-bold text-sm">Write Review</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Rating Summary Check */}
            {reviews && reviews.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 pt-2 pb-4">
                {reviews.map((review: any) => (
                  <View key={review._id} className={`w-72 mr-4 p-4 rounded-2xl border ${theme === 'dark' ? "bg-surface-light border-white/5" : "bg-gray-50 border-black/5"}`}>
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-2">
                        <UserAvatar
                          source={review.userId.image || review.userId.imageUrl} // Handle different field names if necessary, assuming one of them
                          name={review.userId.name}
                          size={32}
                          className="bg-primary/20"
                        />
                        <Text className="text-text-primary font-bold text-sm" numberOfLines={1}>{review.userId.name}</Text>
                      </View>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= review.rating ? "star" : "star-outline"}
                            size={12}
                            color="#F59E0B"
                          />
                        ))}
                      </View>
                    </View>
                    <Text className="text-text-secondary text-sm leading-5" numberOfLines={3}>
                      {review.comment || "No comment provided"}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className={`p-6 rounded-2xl items-center justify-center border border-dashed ${theme === 'dark' ? "border-white/10" : "border-black/10"}`}>
                <Text className="text-text-tertiary text-sm">No reviews yet. Be the first!</Text>
              </View>
            )}
          </AnimatedContainer>



          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <AnimatedContainer animation="fadeUp" delay={800} className="mt-4 mb-4">
              <View className="flex-row items-center justify-between px-0 mb-4">
                <Text className="text-text-primary text-xl font-bold">You May Also Like</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                  <Text className="text-primary font-semibold text-sm">See All</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap justify-between">
                {relatedProducts.map((item, index) => (
                  <View key={item._id} style={{ width: '48%', marginBottom: 16 }}>
                    <ProductCard product={item} index={index} />
                  </View>
                ))}
              </View>
            </AnimatedContainer>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        className={`flex-row items-center justify-between gap-8 absolute bottom-0 left-0 right-0 px-4 pt-4 border-t ${theme === 'dark' ? 'bg-background border-white/5' : 'bg-surface border-black/5'}`}
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center gap-2">
          {/* Chat Button */}
          <TouchableOpacity
            className={`rounded-2xl p-3.5 items-center justify-center border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"}`}
            activeOpacity={0.7}
            onPress={handleChatWithVendor}
            disabled={startingChat}
          >
            {startingChat ? (
              <ActivityIndicator size="small" color={theme === 'dark' ? "#fff" : "#000"} />
            ) : (
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme === 'dark' ? "#fff" : "#000"} />
            )}
          </TouchableOpacity>

          {/* Visit Store Button */}
          {product.vendor && (
            <TouchableOpacity
              className={`rounded-2xl p-3.5 items-center justify-center border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"}`}
              activeOpacity={0.7}
              onPress={() => {
                const vendorId = typeof product.vendor === 'object' ? (product.vendor as any)._id : product.vendor;
                router.push(`/vendor/${vendorId}`);
              }}
            >
              <Ionicons name="storefront-outline" size={24} color={theme === 'dark' ? "#fff" : "#000"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Buy Now & Add to Cart Container */}
        <View className="flex-1 flex-row gap-3 justify-end">
          {/* Add to Cart - Secondary/Outlined */}
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-3.5 flex-row items-center justify-center border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"}`}
            activeOpacity={0.7}
            onPress={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator color={theme === 'dark' ? "#fff" : "#000"} size="small" />
            ) : (
              <>
                <Ionicons name="cart-outline" size={20} color={theme === 'dark' ? "#fff" : "#000"} style={{ marginRight: 8 }} />
                <Text className={`font-bold text-sm ${theme === 'dark' ? "text-white" : "text-black"}`}>Cart</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Buy Now - Primary/Filled */}
          <TouchableOpacity
            className={`flex-1 rounded-2xl py-3.5 flex-row items-center justify-center border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"}`}
            activeOpacity={0.7}
            onPress={handleBuyNow}
            disabled={!inStock || paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator size="small" color={theme === 'dark' ? "#fff" : "#000"} />
            ) : (
              <Text className={`font-bold text-sm ${!inStock ? "text-text-tertiary" : (theme === 'dark' ? "text-white" : "text-black")}`}>
                {!inStock ? "Sold Out" : "Buy Now"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>


      {/* Full Screen Image Viewer & Review Modal (Unchanged parts...) */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View className="flex-1 bg-black justify-center">
          <TouchableOpacity
            className="absolute top-14 right-6 z-20 bg-white/20 w-10 h-10 rounded-full items-center justify-center"
            onPress={() => setIsImageViewerVisible(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            initialScrollIndex={viewerImageIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ width, height: '100%', justifyContent: 'center' }}>
                <OptimizedImage
                  source={item}
                  width={width * 2} // Retina width
                  style={{ width: '100%', height: '70%' }}
                  contentFit="contain"
                />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      </Modal>

      {eligibleOrder && (
        <ReviewModal
          isVisible={isReviewModalVisible}
          onClose={() => setIsReviewModalVisible(false)}
          productId={product._id}
          orderId={eligibleOrder._id}
          productName={product.name}
        />
      )}

      <VariantSelectionModal
        visible={isVariantModalVisible}
        onClose={() => setIsVariantModalVisible(false)}
        product={product}
        initialSelectedOptions={selectedOptions}
        confirmTitle={modalMode === 'cart' ? "Add to Cart" : "Buy Now"}
        onConfirm={(options, qty) => {
          setSelectedOptions(options);
          setQuantity(qty);
          setIsVariantModalVisible(false);

          if (modalMode === 'cart') {
            // Add to cart logic
            // Need to find variantId first
            const variant = product.variants?.find((v: any) => {
              const attributeNames = (product.attributes || []).map((a: any) => a.name);
              return attributeNames.every((name: string) => v.options[name] === options[name]);
            });

            addToCart(
              {
                productId: product._id,
                quantity: qty,
                selectedOptions: options,
                variantId: variant?._id
              },
              {
                onSuccess: () => showToast({ message: `${product.name} added to cart!`, type: 'success' }),
                onError: (error: any) => {
                  showToast({ message: error?.response?.data?.message || "Failed to add to cart", type: 'error' });
                },
              }
            );

          } else {
            // Buy Now Logic - Check addresses
            if (!addresses || addresses.length === 0) {
              Alert.alert("Address Required", "Please add a shipping address in your profile before buying.");
              router.push("/(tabs)/profile" as any);
              return;
            }
            setAddressModalVisible(true);
          }
        }}
      />

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
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
