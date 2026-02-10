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
import { Address } from "@/types";
import { useTranslation } from "react-i18next";
import { getTranslated } from "@/lib/i18n-utils";
import { UserAvatar } from "@/components/UserAvatar";
import * as Sentry from "@sentry/react-native";
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
  Modal,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

const { width } = Dimensions.get("window");

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

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
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

    // If product has variants but none is selected yet, prompt user
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      Alert.alert("Selection Required", "Please select all options before adding to cart.");
      return;
    }

    addToCart(
      {
        productId: product._id,
        quantity,
        selectedOptions,
        variantId: selectedVariant?._id
      },
      {
        onSuccess: () => Alert.alert("Success", `${product.name} added to cart!`),
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add to cart");
        },
      }
    );
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check variant selection
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      Alert.alert("Selection Required", "Please select all options before buying.");
      return;
    }

    // Check addresses
    if (!addresses || addresses.length === 0) {
      Alert.alert("Address Required", "Please add a shipping address in your profile before buying.");
      router.push("/(tabs)/profile");
      return;
    }

    setAddressModalVisible(true);
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
      const { data: conversation } = await api.post("/chats", { participantId: product.vendor });

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

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;


  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View
        className={`absolute left-0 right-0 z-50 px-6 flex-row items-center justify-between pb-3 transition-all duration-300 ${isScrolled ? (theme === 'dark' ? "bg-black border-white/10" : "bg-white border-black/5") : "bg-transparent"
          }`}
        style={{ paddingTop: insets.top + 10 }}
      >
        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center border backdrop-blur-md ${isScrolled
            ? (theme === 'dark' ? "bg-white/10 border-white/10" : "bg-black/5 border-black/10")
            : "bg-black/30 border-white/20"
            }`}
          onPress={() => router.back()}
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
          setIsScrolled(scrollY > 50);
        }}
        scrollEventThrottle={16}
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
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  setViewerImageIndex(index);
                  setIsImageViewerVisible(true);
                }}
                style={{ width, height: 450 }}
              >
                <Image source={image} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={500} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.4)']}
                  className="absolute inset-0"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-2">
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === selectedImageIndex ? "bg-white w-6" : "bg-white/40 w-1.5"
                  }`}
              />
            ))}
          </View>
        </View>

        {/* CONTENT CONTAINER */}
        <View className={`px-6 -mt-8 pt-8 rounded-[32px] overflow-hidden ${theme === 'dark' ? 'bg-background' : 'bg-white'}`}>


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

          {/* ATTRIBUTE SELECTORS */}
          {product.attributes && product.attributes.length > 0 && (
            <AnimatedContainer animation="fadeDown" delay={100} className="mb-6 gap-6">
              {product.attributes.map((attr) => (
                <View key={attr.name} className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text-primary font-bold text-sm uppercase tracking-wider opacity-60">
                      {attr.name}
                    </Text>
                    {selectedOptions[attr.name] && (
                      <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-2 py-0.5 rounded-md"
                      >
                        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                          {selectedOptions[attr.name]}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {attr.values.map((value) => {
                      const isSelected = selectedOptions[attr.name] === value;
                      return (
                        <TouchableOpacity
                          key={value}
                          onPress={() => setSelectedOptions(prev => ({ ...prev, [attr.name]: value }))}
                          activeOpacity={0.7}
                        >
                          <LinearGradient
                            colors={isSelected ? ['#6366F1', '#8B5CF6'] : [theme === 'dark' ? '#18181B' : '#F4F4F5', theme === 'dark' ? '#18181B' : '#F4F4F5']}
                            className={`px-5 py-2.5 rounded-xl border ${isSelected
                              ? "border-transparent"
                              : theme === 'dark' ? "border-white/10" : "border-black/5"
                              }`}
                          >
                            <Text className={`text-sm font-semibold ${isSelected ? "text-white" : "text-text-secondary"}`}>
                              {value}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </AnimatedContainer>
          )}

          {/* PRODUCT VARIANTS */}
          {product.variants && product.variants.length > 0 && (
            <AnimatedContainer animation="fadeUp" delay={450} className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary text-lg font-bold">Available Variants</Text>
                <View className={`px-3 py-1 rounded-full border ${theme === 'dark' ? "bg-primary/10 border-primary/20" : "bg-primary/5 border-primary/10"}`}>
                  <Text className="text-primary font-bold text-xs">{product.variants.length} Options</Text>
                </View>
              </View>

              <View className="gap-3">
                {product.variants.map((variant, index) => {
                  const isSelectedVariant = selectedVariant?._id === variant._id;
                  const variantInStock = variant.stock > 0;

                  return (
                    <TouchableOpacity
                      key={variant._id || index}
                      activeOpacity={0.7}
                      onPress={() => setSelectedOptions(variant.options)}
                      className={`p-4 rounded-2xl border ${isSelectedVariant
                        ? "border-primary/50 bg-primary/5"
                        : theme === 'dark'
                          ? "bg-surface-light border-white/5"
                          : "bg-gray-50 border-black/5"
                        }`}
                    >
                      <View className="flex-row items-start justify-between">
                        {/* Variant Info */}
                        <View className="flex-1 mr-3">
                          {/* Variant Name */}
                          <View className="flex-row items-center mb-2">
                            {isSelectedVariant && (
                              <View className="w-2 h-2 bg-primary rounded-full mr-2" />
                            )}
                            <Text className="text-text-primary font-bold text-base flex-1">
                              {variant.name || 'Variant'}
                            </Text>
                          </View>

                          {/* Variant Options */}
                          {variant.options && Object.keys(variant.options).length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mb-3">
                              {Object.entries(variant.options).map(([key, value]) => (
                                <View
                                  key={key}
                                  className={`px-2 py-1 rounded-md border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-black/10"}`}
                                >
                                  <Text className="text-text-tertiary text-xs">
                                    <Text className="font-semibold">{key}:</Text> {value}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}

                          {/* Price & Stock Row */}
                          <View className="flex-row items-center justify-between">
                            {/* Price */}
                            <View className="flex-row items-baseline gap-1">
                              <Text className="text-primary text-xl font-black">
                                ${variant.price.toFixed(2)}
                              </Text>
                              {variant.price !== product.price && (
                                <Text className="text-text-tertiary text-sm line-through">
                                  ${product.price.toFixed(2)}
                                </Text>
                              )}
                            </View>

                            {/* Stock Status */}
                            <View className={`flex-row items-center px-2 py-1 rounded-full border ${variantInStock
                              ? "bg-green-500/10 border-green-500/20"
                              : "bg-red-500/10 border-red-500/20"
                              }`}>
                              <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${variantInStock ? "bg-green-500" : "bg-red-500"
                                }`} />
                              <Text className={`text-xs font-semibold ${variantInStock ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                }`}>
                                {variantInStock ? `${variant.stock} in stock` : 'Out of stock'}
                              </Text>
                            </View>
                          </View>

                          {/* SKU */}
                          {variant.sku && (
                            <Text className="text-text-tertiary text-xs mt-2">
                              SKU: <Text className="font-mono">{variant.sku}</Text>
                            </Text>
                          )}
                        </View>

                        {/* Variant Image (if available) */}
                        {variant.image && (
                          <View className="w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                            <Image
                              source={variant.image}
                              style={{ width: '100%', height: '100%' }}
                              contentFit="cover"
                              transition={300}
                            />
                          </View>
                        )}
                      </View>

                      {/* Selected Badge */}
                      {isSelectedVariant && (
                        <View className="mt-3 pt-3 border-t border-primary/20">
                          <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={16} color="#6366F1" />
                            <Text className="text-primary text-xs font-bold ml-1.5 uppercase tracking-wide">
                              Currently Selected
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </AnimatedContainer>
          )}

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

          {/* Quantity Selector */}
          {inStock && (
            <AnimatedContainer animation="fadeUp" delay={700} className={`mb-8 p-4 rounded-2xl border flex-row items-center justify-between ${theme === 'dark' ? "bg-surface-light border-white/5" : "bg-gray-50 border-black/5"}`}>
              <Text className="text-text-primary font-bold">Quantity</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${theme === 'dark' ? "bg-black/20 border-white/10" : "bg-white border-black/10"}`}
                >
                  <Ionicons name="remove" size={20} color={theme === 'dark' ? "#fff" : "#000"} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-primary w-6 text-center">{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </AnimatedContainer>
          )}

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <AnimatedContainer animation="fadeUp" delay={800} className="mt-4 mb-4">
              <View className="flex-row items-center justify-between px-0 mb-4">
                <Text className="text-text-primary text-xl font-bold">You May Also Like</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/" as any)}>
                  <Text className="text-primary font-semibold text-sm">See All</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => (
                  <View style={{ width: width * 0.45 }}>
                    <ProductCard product={item} index={index} />
                  </View>
                )}
              />
            </AnimatedContainer>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className={`flex-row items-center justify-between gap-4 absolute bottom-0 left-0 right-0 px-4 pt-4 pb-6 border-t ${theme === 'dark' ? 'bg-background border-white/5' : 'bg-white border-black/5'}`}>
        <View className="flex-row items-center gap-2">
          {/* Chat Button */}
          <TouchableOpacity
            className={`rounded-full p-2 items-center justify-center border ${theme === 'dark' ? "bg-surface-light border-white/10" : "bg-gray-100 border-black/5"}`}
            activeOpacity={0.85}
            onPress={handleChatWithVendor}
            disabled={startingChat}
          >
            {startingChat ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme === 'dark' ? "#fff" : "#000"} />
            )}
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Buy Now & Add to Cart Container */}
        <View className="flex-1 flex-row gap-3">
          {/* Buy Now*/}
          <TouchableOpacity
            className={`flex-1 rounded-xl py-3.5 flex-row items-center justify-center border ${!inStock || paymentLoading
              ? (theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-100 border-black/5")
              : (theme === 'dark' ? "bg-white border-white" : "bg-black border-black")}`}
            activeOpacity={0.85}
            onPress={handleBuyNow}
            disabled={!inStock || paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator size="small" color={theme === 'dark' ? "black" : "white"} />
            ) : (
              <Text className={`font-bold text-sm ${!inStock ? "text-text-secondary" : (theme === 'dark' ? "text-black" : "text-white")}`}>
                {!inStock ? "Sold Out" : "Buy Now"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Add to Cart */}
          <TouchableOpacity
            className={`flex-1 rounded-xl py-3.5 flex-row items-center justify-center shadow-lg ${!inStock || isAddingToCart
              ? "bg-primary/50 shadow-none"
              : "bg-primary shadow-primary/30"}`}
            activeOpacity={0.85}
            onPress={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator color={theme === 'dark' ? "black" : "white"} size="small" />
            ) : (
              <>
                <Ionicons name="cart" size={18} color={theme === 'dark' ? "black" : "white"} style={{ marginRight: 8 }} />
                <Text className={`font-bold text-sm ${theme === 'dark' ? "text-black" : "text-white"}`}>Cart</Text>
              </>
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
                <Image
                  source={item}
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

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </View>
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
