import { Link } from "expo-router";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types"; // Import Product type correctly

interface ProductCardProps {
    product: Product;
    index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
    if (!product) return null;

    const scale = useSharedValue(1);
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
    const { isAddingToCart, addToCart } = useCart();

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handleAddToCart = (e: any) => {
        e.stopPropagation(); // Prevent navigation
        addToCart({ productId: product._id, quantity: 1 });
    };

    const handleToggleWishlist = (e: any) => {
        e.stopPropagation();
        toggleWishlist(product._id);
    };

    const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

    return (
        <Link href={`/product/${product._id}`} asChild>
            <Pressable
                className="flex-1 m-2"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Animated.View
                    className="bg-surface rounded-xl overflow-hidden shadow-lg border border-white/5"
                    style={animatedStyle}
                >
                    <View className="relative">
                        <Image
                            source={{ uri: product.images[0] }}
                            className="w-full h-48 bg-gray-800"
                            resizeMode="cover"
                        />

                        <Pressable
                            onPress={handleToggleWishlist}
                            className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full p-2"
                        >
                            {isWishlistLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons
                                    name={isInWishlist(product._id) ? "heart" : "heart-outline"}
                                    size={17}
                                    color={isInWishlist(product._id) ? "#EF4444" : "white"}
                                />
                            )}
                        </Pressable>

                        {product.averageRating > 0 && (
                            <View className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-2 py-1 flex-row items-center">
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text className="text-white text-xs font-bold ml-1">{product.averageRating.toFixed(1)}</Text>
                            </View>
                        )}
                    </View>

                    <View className="p-4">
                        <Text className="text-text-tertiary text-xs font-medium uppercase tracking-wider mb-1">
                            {typeof product.shop === 'object' ? product.shop.name : (product.category || "Collection")}
                        </Text>
                        <Text
                            className="text-text-primary text-base font-bold mb-2 h-11"
                            numberOfLines={2}
                        >
                            {product.name}
                        </Text>
                        <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-primary-light text-lg font-bold">
                                ${product.price.toFixed(2)}
                            </Text>
                            <Pressable
                                onPress={handleAddToCart}
                                className="bg-primary/20 p-2 rounded-full active:bg-primary/40"
                                disabled={isAddingToCart}
                            >
                                {isAddingToCart ? (
                                    <ActivityIndicator size="small" color="#6366F1" />
                                ) : (
                                    <Ionicons name="add" size={20} color="#818CF8" />
                                )}
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </Link>
    );
};
