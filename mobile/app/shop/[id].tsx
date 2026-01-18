import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
// import { AnimatedContainer } from "@/components/ui/AnimatedContainer"; // Removed if not used to avoid potential reference errors
import ProductsGrid from "@/components/ProductsGrid";
import { useTranslation } from "react-i18next";
import { GlassView } from "@/components/ui/GlassView";

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
            // The API returns { shop, products } in getShopById according to controller logic
            // But my ShopScreen was expecting separate calls. 
            // Let's adjust based on shop.controller.js: getShopById returns { shop, products }
            // Wait, shop.controller.js line 82: res.status(200).json({ shop, products });
            // So one call to `/shops/${id}` is enough.

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
                {/* Banner Section */}
                <View className="relative h-48 w-full bg-background-lighter">
                    {shop.bannerUrl ? (
                        <Image source={shop.bannerUrl} className="w-full h-full" contentFit="cover" />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Ionicons name="image-outline" size={48} color="#999" />
                        </View>
                    )}

                    {/* Back Button */}
                    <TouchableOpacity
                        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Shop Info Card */}
                <View className="px-6 -mt-12">
                    <GlassView className="p-6 rounded-3xl shadow-lg border border-white/10">
                        <View className="flex-row items-center">
                            <View className="w-20 h-20 rounded-2xl bg-surface border-4 border-surface shadow-md overflow-hidden">
                                {shop.logoUrl ? (
                                    <Image source={shop.logoUrl} className="w-full h-full" contentFit="cover" />
                                ) : (
                                    <View className="w-full h-full items-center justify-center">
                                        <Text className="text-primary text-2xl font-bold">{shop.name.charAt(0)}</Text>
                                    </View>
                                )}
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-text-primary text-2xl font-bold">{shop.name}</Text>
                                <Text className="text-text-secondary text-sm mt-1" numberOfLines={2}>
                                    {shop.description}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row mt-6 pt-6 border-t border-white/5 justify-around">
                            <View className="items-center">
                                <Text className="text-text-primary font-bold text-lg">{products.length}</Text>
                                <Text className="text-text-secondary text-xs uppercase tracking-widest">{t('shop.products') || 'Products'}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-text-primary font-bold text-lg">4.8</Text>
                                <Text className="text-text-secondary text-xs uppercase tracking-widest">{t('shop.rating') || 'Rating'}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-text-primary font-bold text-lg">2y</Text>
                                <Text className="text-text-secondary text-xs uppercase tracking-widest">{t('shop.joined') || 'Joined'}</Text>
                            </View>
                        </View>
                    </GlassView>
                </View>

                {/* Products Section */}
                <View className="mt-8 px-6 pb-20">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-text-primary text-2xl font-bold">{t('shop.all_products') || 'All Products'}</Text>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-primary font-semibold mr-1">{t('common.filter')}</Text>
                            <Ionicons name="options-outline" size={18} color="#6366F1" />
                        </TouchableOpacity>
                    </View>

                    <ProductsGrid products={products} isLoading={false} isError={false} />
                </View>
            </ScrollView>
        </SafeScreen>
    );
};

export default ShopScreen;
