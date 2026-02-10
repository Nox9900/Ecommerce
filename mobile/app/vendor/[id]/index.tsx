import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useVendor } from "@/hooks/useVendor";
import useProducts from "@/hooks/useProducts";
import { useTheme } from "@/lib/useTheme";
import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import ProductsGrid from "@/components/ProductsGrid";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const VendorShopScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const { data: vendor, isLoading: vendorLoading, isError: vendorError } = useVendor(id);
    const { data: products, isLoading: productsLoading } = useProducts({
        vendor: id,
        limit: 50
    });

    if (vendorLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    if (vendorError || !vendor) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="storefront-outline" size={64} color="#A3A3A3" />
                    <Text className="text-text-primary text-xl font-bold mt-4 text-center">
                        Vendor Not Found
                    </Text>
                    <Text className="text-text-secondary text-center mt-2 mb-6">
                        The vendor you are looking for does not exist or has been removed.
                    </Text>
                    <TouchableOpacity
                        className="bg-primary px-6 py-3 rounded-full"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeScreen>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 50 }}
            >
                {/* Header Cover */}
                <View className="h-48 w-full relative">
                    <Image
                        source={{ uri: vendor.bannerUrl || "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2070&auto=format&fit=crop" }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        className="absolute inset-0"
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        className="absolute left-4 top-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center border border-white/20 backdrop-blur-md"
                        style={{ marginTop: insets.top }}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Vendor Info Card */}
                <View className="px-4 -mt-12">
                    <AnimatedContainer animation="fadeUp" className={`rounded-3xl p-5 shadow-sm border ${theme === 'dark' ? "bg-surface-light border-white/5" : "bg-white border-black/5"}`}>
                        <View className="flex-row items-start gap-4">
                            <View className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-surface-light shadow-sm">
                                <Image
                                    source={{ uri: vendor.logoUrl }}
                                    className="w-full h-full bg-gray-200"
                                />
                            </View>
                            <View className="flex-1 pt-1">
                                <Text className="text-text-primary text-xl font-black tracking-tight mb-1">
                                    {vendor.shopName}
                                </Text>
                                <View className="flex-row items-center gap-1 mb-2">
                                    <Ionicons name="star" size={14} color="#F59E0B" />
                                    <Text className="text-text-primary font-bold text-xs">{vendor.rating || 4.5}</Text>
                                    <Text className="text-text-tertiary text-xs">•</Text>
                                    <Text className="text-text-tertiary text-xs">Joined {new Date(vendor.joinedAt).getFullYear()}</Text>
                                </View>
                                {vendor.owner && (
                                    <View className="flex-row items-center gap-1.5">
                                        <View className="w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                                            <Image source={{ uri: vendor.owner.avatar }} className="w-full h-full" />
                                        </View>
                                        <Text className="text-text-secondary text-xs">Owner: {vendor.owner.name}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                            <Text className="text-text-secondary text-sm leading-5">
                                {vendor.description}
                            </Text>
                        </View>
                    </AnimatedContainer>
                </View>

                {/* Products Section */}
                <View className="px-4 mt-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-text-primary text-lg font-bold">Products</Text>
                        <View className={`px-2.5 py-1 rounded-full border ${theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"}`}>
                            <Text className="text-text-secondary text-xs font-medium">{products?.length || 0} Items</Text>
                        </View>
                    </View>

                    {productsLoading ? (
                        <ActivityIndicator size="large" color="#6366F1" className="mt-10" />
                    ) : (
                        <ProductsGrid
                            products={products || []}
                            isLoading={false}
                            isError={false}
                            showVendorSlider={false}
                        />
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

export default VendorShopScreen;
