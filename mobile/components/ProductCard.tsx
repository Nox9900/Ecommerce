import { Link, router } from "expo-router";
import { View, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/useTheme";
import { getTranslated } from "@/lib/i18n-utils";
import { AppText } from "./ui/AppText";

interface ProductCardProps {
    product: Product;
    index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
    if (!product) return null;

    const scale = useSharedValue(1);
    const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handleToggleWishlist = (e: any) => {
        e.stopPropagation();
        toggleWishlist(product._id);
    };

    const isWishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

    // Mock sold count based on price (just for visuals)
    const mockSold = Math.floor(product.price * 10 + Math.random() * 100);
    const productName = getTranslated(product, 'name', i18n.language);

    const handlePress = () => {
        router.push(`/product/${product._id}`);
    };

    const handleShopPress = (e: any) => {
        e.stopPropagation();
        if (typeof product.shop === 'object' && (product.shop as any)?._id) {
            router.push(`/shop/${(product.shop as any)._id}`);
        } else if (product.shop) {
            router.push(`/shop/${product.shop}`);
        }
    };

    return (
        <Pressable
            className="mb-2"
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityLabel={`${productName}, Price: ${product.price.toFixed(2)}`}
            accessibilityHint="Double tap to view product details"
            accessibilityRole="button"
        >
            <Animated.View
                className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm border border-black/5 dark:border-white/5 pb-2"
                style={animatedStyle}
            >
                <View className="relative">
                    <Image
                        source={{ uri: product.images[0] }}
                        className="w-full h-52 bg-gray-100 dark:bg-zinc-800"
                        resizeMode="cover"
                        accessibilityLabel={productName}
                    />
                </View>

                <View className="p-2">
                    {/* Title */}
                    <AppText
                        className="text-text-primary text-[13px] font-bold mb-1.5 leading-4"
                        numberOfLines={2}
                    >
                        {productName}
                    </AppText>

                    {/* Tags (Mock) */}
                    <View className="flex-row gap-1 mb-2">
                        <View className="border border-red-500/30 px-1 rounded-[2px]" accessibilityLabel="Free Return">
                            <AppText className="text-[9px] text-red-500 font-medium">Free Return</AppText>
                        </View>
                        <View className="border border-orange-500/30 px-1 rounded-[2px]" accessibilityLabel="Fast Shipping">
                            <AppText className="text-[9px] text-orange-500 font-medium">Fast Ship</AppText>
                        </View>
                    </View>

                    {/* Price and Sold */}
                    <View className="flex-row items-end justify-between">
                        <View className="flex-row items-baseline gap-1" accessibilityLabel={`Price: ${product.price.toFixed(2)}`}>
                            <AppText className="text-red-600 font-black text-xs">¥</AppText>
                            <AppText className="text-red-600 font-black text-lg -ml-0.5">{product.price.toFixed(0)}</AppText>
                            <AppText className="text-red-600 font-bold text-xs">.{(product.price % 1 * 100).toFixed(0)}</AppText>
                        </View>
                        <AppText className="text-[#9CA3AF] text-[10px] mb-0.5" accessibilityLabel={`Sold: ${mockSold}`}>
                            Sold {mockSold > 1000 ? (mockSold / 1000).toFixed(1) + 'k' : mockSold}
                        </AppText>
                    </View>

                    {/* Shop Name / Avatar Row */}
                    <Pressable
                        onPress={handleShopPress}
                        className="flex-row items-center mt-2 opacity-70"
                        accessibilityLabel={`Shop: ${typeof product.shop === 'object' ? (product.shop as any).name : "Official Store"}`}
                        accessibilityHint="Double tap to visit shop"
                        accessibilityRole="button"
                    >
                        <AppText className="text-[10px] text-text-tertiary truncate" numberOfLines={1}>
                            {(typeof product.shop === 'object' ? (product.shop as any).name : "Official Store") || "Official Store"} &gt;
                        </AppText>
                    </Pressable>

                </View>
            </Animated.View>
        </Pressable>
    );
};
