import { Link } from "expo-router";
import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Product } from "@/types";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/useTheme";
import { AppText } from "../ui/AppText";

interface ProductListRowProps {
    product: Product;
    index: number;
}

export default function ProductListRow({ product, index }: ProductListRowProps) {
    if (!product) return null;

    const scale = useSharedValue(1);
    const { t } = useTranslation();
    const { theme } = useTheme();

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    // Use real product data with sensible fallbacks
    const soldCount = product.soldCount || 0;
    const originalPrice = product.originalPrice || (product.price * 1.2);
    const subsidyAmount = (originalPrice - product.price).toFixed(1);
    const brandName = product.brand || "Official";

    return (
        <Link href={`/product/${product._id}`} asChild>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="mb-3 px-3"
            >
                <Animated.View
                    style={animatedStyle}
                    className="flex-row bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5"
                >
                    {/* Image Section */}
                    <View className="relative">
                        <Image
                            source={{ uri: product.images[0] }}
                            className="w-36 h-36 bg-gray-100 dark:bg-zinc-800"
                            resizeMode="cover"
                        />
                        {/* Status Label (Dynamic based on sold count) */}
                        {soldCount > 100 && (
                            <View className="absolute bottom-0 left-0 right-0 bg-red-500/80 py-0.5 items-center">
                                <AppText className="text-white text-[9px] font-bold flex-row items-center">
                                    🔥 {soldCount > 1000 ? 'Top Seller' : 'Hot Selling Right Now'}
                                </AppText>
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <View className="flex-1 p-3 justify-between">
                        <View>
                            {/* Tags */}
                            <View className="flex-row items-center gap-1 mb-1.5 flex-wrap">
                                <View className="bg-black dark:bg-white px-1 py-0.5 rounded-sm">
                                    <AppText className="text-[9px] text-white dark:text-black font-bold uppercase">{brandName}</AppText>
                                </View>
                                {product.isSubsidy !== false && (
                                    <>
                                        <View className="bg-red-500 px-1 py-0.5 rounded-sm">
                                            <AppText className="text-[9px] text-white font-bold">10B Subsidy</AppText>
                                        </View>
                                        <View className="border border-red-500 px-1 py-0.5 rounded-sm">
                                            <AppText className="text-[9px] text-red-500 font-bold">Price Match</AppText>
                                        </View>
                                    </>
                                )}
                            </View>

                            {/* Title */}
                            <AppText
                                className="text-text-primary text-[14px] font-semibold leading-5"
                                numberOfLines={2}
                            >
                                {product.name}
                            </AppText>

                            {/* Trust Badge */}
                            <View className="flex-row items-center mt-1.5 opacity-60">
                                <Ionicons name="shield-checkmark" size={12} color="#D97706" />
                                <AppText className="text-[10px] text-orange-600 font-medium ml-0.5">Official 100% Genuine</AppText>
                            </View>
                        </View>

                        <View>
                            {/* Price Section */}
                            <View className="flex-row items-baseline gap-1">
                                <Ionicons name="flash" size={14} color="#EF4444" />
                                <AppText className="text-red-500 text-xs font-bold">Low Price ¥</AppText>
                                <AppText className="text-red-500 text-2xl font-black -ml-1">{product.price.toFixed(0)}</AppText>
                                <AppText className="text-red-500 text-sm font-bold -ml-1">.{(product.price % 1 * 100).toFixed(0)}</AppText>
                                {parseFloat(subsidyAmount) > 0 && (
                                    <AppText className="text-gray-400 text-[10px] ml-1">Subsidy ¥{subsidyAmount}</AppText>
                                )}
                            </View>

                            {/* Stats */}
                            <View className="flex-row items-center justify-between mt-1">
                                <AppText className="text-[#9CA3AF] text-[10px]">
                                    Total {soldCount > 10000 ? (soldCount / 10000).toFixed(1) + 'w' : soldCount}+ Sold
                                </AppText>
                                <View className="flex-row items-center">
                                    <AppText className="text-[#9CA3AF] text-[10px]">Net Low ¥{originalPrice.toFixed(0)}</AppText>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </Link>
    );
}
