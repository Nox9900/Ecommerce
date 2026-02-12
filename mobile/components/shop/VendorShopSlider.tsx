import { View, ScrollView, ActivityIndicator } from "react-native";
import { useRandomShops } from "@/hooks/useShops";
import ShopCard from "../ShopCard";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../ui/AppText";

const VendorShopSlider = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { data: shops, isLoading, isError } = useRandomShops(5);

    if (isLoading) {
        return (
            <View className="py-6 items-center justify-center">
                <ActivityIndicator size="small" color="#6366F1" />
            </View>
        );
    }

    if (isError || !shops || shops.length === 0) {
        return null; // Silently hide if error or no shops
    }

    return (
        <View className={`py-6 ${theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-50/80'} rounded-2xl mx-2`}>
            {/* Section Header with Icon */}
            <View className="px-4 mb-4 flex-row items-center justify-between">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}>
                            <Ionicons name="storefront" size={20} color="#6366F1" />
                        </View>
                        <AppText className="text-text-primary text-xl font-black">
                            {t('shop.featuredShops', 'Featured Shops')}
                        </AppText>
                    </View>
                    <AppText className="text-text-secondary text-sm ml-12">
                        {t('shop.discoverVendors', 'Discover amazing vendors')}
                    </AppText>
                </View>
            </View>

            {/* Horizontal ScrollView */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                className="flex-row"
            >
                {shops.map((shop, index) => (
                    <ShopCard key={shop._id} shop={shop} />
                ))}
            </ScrollView>
        </View>
    );
};

export default VendorShopSlider;
