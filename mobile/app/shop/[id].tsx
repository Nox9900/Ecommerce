import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useShopDetail } from "@/hooks/useShops";
import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";

const ShopDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { data, isLoading, isError } = useShopDetail(id as string);

    if (isLoading) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={theme === 'dark' ? "#fff" : "#000"} />
                </View>
            </SafeScreen>
        );
    }

    if (isError || !data) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center p-5 text-center">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-text-primary text-xl font-bold mt-4">Shop not found</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-6 bg-primary px-8 py-3 rounded-2xl"
                    >
                        <Text className="text-primary-foreground font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeScreen>
        );
    }

    const { shop, products } = data;

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* HEADER */}
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/5">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "#fff" : "#000"} />
                    </TouchableOpacity>
                    <Text className="text-text-primary text-lg font-bold">Shop Details</Text>
                    <TouchableOpacity className="p-2 -mr-2">
                        <Ionicons name="share-outline" size={24} color={theme === 'dark' ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* BANNER & LOGO */}
                    <View className="h-48 relative">
                        <Image
                            source={{ uri: shop.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" }}
                            className="w-full h-full object-cover"
                        />
                        <View className="absolute inset-x-0 bottom-0 px-5 translate-y-1/2 flex-row items-end gap-4">
                            <View className={`p-1 rounded-3xl ${theme === 'dark' ? 'bg-background' : 'bg-white shadow-xl'}`}>
                                <Image
                                    source={{ uri: shop.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80" }}
                                    className="w-24 h-24 rounded-2xl"
                                />
                            </View>
                        </View>
                    </View>

                    {/* SHOP INFO */}
                    <View className="px-5 mt-16 mb-8">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-4">
                                <Text className="text-text-primary text-2xl font-bold">{shop.name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="star" size={16} color="#F59E0B" />
                                    <Text className="text-text-secondary text-sm ml-1 font-medium">4.8 (120 reviews)</Text>
                                    <Text className="text-text-secondary text-sm mx-2">•</Text>
                                    <Text className="text-text-secondary text-sm font-medium">{products.length} Products</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="bg-primary px-6 py-2.5 rounded-2xl">
                                <Text className="text-primary-foreground font-bold">Follow</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-text-secondary text-sm mt-4 leading-5">{shop.description}</Text>

                        <View className="flex-row items-center gap-4 mt-6">
                            <View className={`flex-1 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-surface-light border-white/5' : 'bg-gray-50 border-black/5'}`}>
                                <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Products</Text>
                                <Text className="text-text-primary text-xl font-bold">{products.length}</Text>
                            </View>
                            <View className={`flex-1 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-surface-light border-white/5' : 'bg-gray-50 border-black/5'}`}>
                                <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Reviews</Text>
                                <Text className="text-text-primary text-xl font-bold">120+</Text>
                            </View>
                        </View>
                    </View>

                    {/* PRODUCTS LIST */}
                    <View className="pb-10">
                        <View className="px-5 mb-4">
                            <Text className="text-text-primary text-lg font-bold">All Products</Text>
                        </View>
                        <ProductsGrid products={products} isLoading={false} isError={false} />
                    </View>
                </ScrollView>
            </View>
        </SafeScreen>
    );
};

export default ShopDetailScreen;
