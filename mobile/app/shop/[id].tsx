import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import ProductsGrid from "@/components/ProductsGrid";
import { useTranslation } from "react-i18next";
import { GlassView } from "@/components/ui/GlassView";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/lib/useTheme";

interface Shop {
    _id: string;
    name: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
}

const ShopScreen = () => {
    const { id } = useLocalSearchParams();
    const api = useApi();
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = useTheme();

    const [shop, setShop] = useState<Shop | null>(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchShopData = async () => {
        try {
            const [shopRes, productsRes] = await Promise.all([
                api.get(`/shops/${id}`),
                api.get(`/shops/${id}/products`)
            ]);
            setShop(shopRes.data.shop);
            setProducts(shopRes.data.products);
        } catch (error) {
            console.error("Error fetching shop data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchShopData();
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchShopData();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    if (!shop) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-text-primary text-xl font-bold mt-4">{t('common.error')}</Text>
                    <Text className="text-text-secondary text-center mt-2">{t('common.error_desc')}</Text>
                    <TouchableOpacity
                        className="mt-6 bg-primary px-8 py-3 rounded-full"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold">{t('common.go_back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeScreen>
        );
    }

    return (
        <SafeScreen>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Enhanced Banner Section with Gradient */}
                <View className="relative h-64 w-full bg-gradient-to-b from-indigo-500 to-purple-600">
                    {shop.bannerUrl ? (
                        <>
                            <Image source={{ uri: shop.bannerUrl }} className="w-full h-full" contentFit="cover" />
                            <LinearGradient
                                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                                className="absolute inset-0"
                            />
                        </>
                    ) : (
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="w-full h-full items-center justify-center"
                        >
                            <Ionicons name="storefront" size={64} color="rgba(255,255,255,0.5)" />
                        </LinearGradient>
                    )}

                    {/* Back Button with Blur Effect */}
                    <TouchableOpacity
                        className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 items-center justify-center border border-white/20"
                        style={{ backdropFilter: 'blur(10px)' }}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Enhanced Shop Info Card */}
                <View className="px-4 -mt-16">
                    <GlassView className="p-5 rounded-3xl shadow-2xl border-2 border-white/10">
                        <View className="flex-row items-center">
                            {/* Logo with Premium Shadow */}
                            <View
                                className={`w-20 h-20 rounded-3xl border-4 shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-white'
                                    }`}
                                style={{ elevation: 10 }}
                            >
                                {shop.logoUrl ? (
                                    <Image source={{ uri: shop.logoUrl }} className="w-full h-full" contentFit="cover" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                        <Text className="text-white text-3xl font-black">{shop.name.charAt(0)}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Shop Name & Description */}
                            <View className="ml-4 flex-1">
                                <Text className="text-text-primary text-xl font-black">{shop.name}</Text>
                                <Text className="text-text-secondary text-xs mt-1 leading-4" numberOfLines={2}>
                                    {shop.description}
                                </Text>
                            </View>
                        </View>

                        {/* Compact Stats Section with Colorful Cards */}
                        <View className="flex-row mt-4 pt-4 border-t border-white/5 gap-2">
                            {/* Products Stat */}
                            <View className="flex-1 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-3 rounded-xl border border-blue-500/20">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <View className="bg-blue-500/20 p-1.5 rounded-lg">
                                        <Ionicons name="cube-outline" size={16} color="#3B82F6" />
                                    </View>
                                </View>
                                <Text className="text-blue-500 font-black text-xl">{products.length}</Text>
                                <Text className="text-text-secondary text-[10px] uppercase tracking-wide mt-0.5">
                                    {t('shop.products', 'Products')}
                                </Text>
                            </View>

                            {/* Rating Stat */}
                            <View className="flex-1 bg-gradient-to-br from-amber-500/10 to-orange-600/10 p-3 rounded-xl border border-amber-500/20">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <View className="bg-amber-500/20 p-1.5 rounded-lg">
                                        <Ionicons name="star" size={16} color="#F59E0B" />
                                    </View>
                                </View>
                                <Text className="text-amber-500 font-black text-xl">4.8</Text>
                                <Text className="text-text-secondary text-[10px] uppercase tracking-wide mt-0.5">
                                    {t('shop.rating', 'Rating')}
                                </Text>
                            </View>

                            {/* Joined Stat */}
                            <View className="flex-1 bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-3 rounded-xl border border-green-500/20">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <View className="bg-green-500/20 p-1.5 rounded-lg">
                                        <Ionicons name="calendar-outline" size={16} color="#10B981" />
                                    </View>
                                </View>
                                <Text className="text-green-500 font-black text-xl">2y</Text>
                                <Text className="text-text-secondary text-[10px] uppercase tracking-wide mt-0.5">
                                    {t('shop.joined', 'Joined')}
                                </Text>
                            </View>
                        </View>
                    </GlassView>
                </View>

                {/* Products Section with Enhanced Header */}
                <View className="mt-8 px-4 pb-20">
                    <View className="flex-row items-center justify-between mb-6 px-2">
                        <View>
                            <Text className="text-text-primary text-2xl font-black">
                                {t('shop.all_products', 'All Products')}
                            </Text>
                            <Text className="text-text-secondary text-sm mt-1">
                                {products.length} {products.length === 1 ? 'item' : 'items'} available
                            </Text>
                        </View>
                        <TouchableOpacity className="flex-row items-center bg-primary/10 px-4 py-2.5 rounded-full border border-primary/20">
                            <Ionicons name="options-outline" size={18} color="#6366F1" />
                            <Text className="text-primary font-bold ml-2">{t('common.filter', 'Filter')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ProductsGrid products={products} isLoading={false} isError={false} />
                </View>
            </ScrollView>
        </SafeScreen>
    );
};

export default ShopScreen;
