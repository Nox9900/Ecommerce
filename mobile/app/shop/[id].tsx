import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
// import { Image } from "expo-image"; // Reverted to RN Image for consistency/reliability
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import ProductsGrid from "@/components/ProductsGrid";
import { useTranslation } from "react-i18next";
import { GlassView } from "@/components/ui/GlassView";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/lib/useTheme";
import { AppText } from "@/components/ui/AppText";

interface Shop {
    _id: string;
    name: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
    createdAt: string;
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
            const { data } = await api.get(`/shops/${id}`);
            setShop(data.shop);
            setProducts(data.products);
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
                    <AppText className="text-text-primary text-xl mt-4">{t('common.error')}</AppText>
                    <AppText className="text-text-secondary text-center mt-2">{t('common.error_desc')}</AppText>
                    <TouchableOpacity
                        className="mt-6 bg-primary px-8 py-3 rounded-full"
                        onPress={() => router.back()}
                    >
                        <AppText className="text-white">{t('common.go_back')}</AppText>
                    </TouchableOpacity>
                </View>
            </SafeScreen>
        );
    }

    // Calculate joined year
    const joinedYear = shop.createdAt ? new Date(shop.createdAt).getFullYear() : new Date().getFullYear();

    return (
        <SafeScreen>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Enhanced Banner Section */}
                <View className="relative h-72 w-full bg-gray-200">
                    {shop.bannerUrl ? (
                        <>
                            <Image
                                source={{ uri: shop.bannerUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
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
                            <Ionicons name="storefront" size={80} color="rgba(255,255,255,0.3)" />
                        </LinearGradient>
                    )}

                    {/* Back Button with Blur Effect */}
                    <TouchableOpacity
                        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center border border-white/20"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Shop Info Card - Redesigned */}
                <View className="px-4 -mt-20">
                    <View className={`p-6 rounded-3xl shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`} style={{ elevation: 5 }}>
                        <View className="flex-row">
                            {/* Logo */}
                            <View className={`w-24 h-24 rounded-2xl -mt-12 shadow-md overflow-hidden border-4 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-900' : 'bg-white border-white'}`}>
                                {shop.logoUrl ? (
                                    <Image
                                        source={{ uri: shop.logoUrl }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-indigo-100">
                                        <AppText className="text-indigo-600 text-3xl">{shop.name.charAt(0)}</AppText>
                                    </View>
                                )}
                            </View>

                            {/* Name & Desc */}
                            <View className="flex-1 ml-4 pt-1">
                                <AppText className="text-text-primary text-xl" numberOfLines={1}>{shop.name}</AppText>
                                <AppText className="text-text-secondary text-xs mt-1 leading-4" numberOfLines={2}>
                                    {shop.description}
                                </AppText>
                            </View>
                        </View>

                        {/* Stats Row */}
                        <View className="flex-row mt-6 justify-between gap-3">
                            {/* Products */}
                            <View className="flex-1 items-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                                <View className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl mb-1">
                                    <Ionicons name="cube-outline" size={20} color="#3B82F6" />
                                </View>
                                <AppText className="text-text-primary text-lg">{products.length}</AppText>
                                <AppText className="text-text-secondary text-[10px] uppercase tracking-wide">
                                    {t('shop.products', 'Products')}
                                </AppText>
                            </View>

                            {/* Rating */}
                            <View className="flex-1 items-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                                <View className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-xl mb-1">
                                    <Ionicons name="star" size={20} color="#F59E0B" />
                                </View>
                                <AppText className="text-text-primary text-lg">4.8</AppText>
                                <AppText className="text-text-secondary text-[10px] uppercase tracking-wide">
                                    {t('shop.rating', 'Rating')}
                                </AppText>
                            </View>

                            {/* Joined */}
                            <View className="flex-1 items-center p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                                <View className="bg-green-100 dark:bg-green-500/20 p-2 rounded-xl mb-1">
                                    <Ionicons name="calendar-outline" size={20} color="#10B981" />
                                </View>
                                <AppText className="text-text-primary text-lg">{joinedYear}</AppText>
                                <AppText className="text-text-secondary text-[10px] uppercase tracking-wide">
                                    {t('shop.joined', 'Joined')}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Products Section */}
                <View className="mt-8 px-4 pb-20">
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <AppText className="text-text-primary text-2xl">
                                {t('shop.all_products', 'All Products')}
                            </AppText>
                            <AppText className="text-text-secondary text-sm mt-1">
                                {products.length} {products.length === 1 ? 'item' : 'items'} available
                            </AppText>
                        </View>
                        <TouchableOpacity className="flex-row items-center bg-gray-100 dark:bg-zinc-800 px-5 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700">
                            <Ionicons name="options-outline" size={18} className="text-text-primary" />
                            <AppText className="text-text-primary ml-2">{t('common.filter', 'Filter')}</AppText>
                        </TouchableOpacity>
                    </View>

                    <ProductsGrid products={products} isLoading={false} isError={false} />
                </View>
            </ScrollView>
        </SafeScreen>
    );
};

export default ShopScreen;
