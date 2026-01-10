import { View, Text, Image, TouchableOpacity } from "react-native";
import { Shop } from "@/types";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";

interface ShopCardProps {
    shop: Shop;
}

const ShopCard = ({ shop }: ShopCardProps) => {
    const { theme } = useTheme();

    return (
        <Link href={{ pathname: "/shop/[id]", params: { id: shop._id } } as any} asChild>
            <TouchableOpacity
                className={`mr-4 w-64 rounded-3xl overflow-hidden border ${theme === "dark" ? "bg-surface-light border-white/10" : "bg-white border-black/5"
                    }`}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: shop.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" }}
                    className="w-full h-24 object-cover"
                />
                <View className="px-4 pb-4 -mt-6">
                    <View className="flex-row items-end gap-3 mb-2">
                        <View className={`p-1 rounded-2xl ${theme === 'dark' ? 'bg-surface-light' : 'bg-white'}`}>
                            <Image
                                source={{ uri: shop.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80" }}
                                className="w-12 h-12 rounded-xl"
                            />
                        </View>
                        <View className="flex-1 pb-1">
                            <Text className="text-text-primary text-base font-bold truncate" numberOfLines={1}>
                                {shop.name}
                            </Text>
                            <View className="flex-row items-center">
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text className="text-text-secondary text-xs ml-1 font-medium">4.8 (120 reviews)</Text>
                            </View>
                        </View>
                    </View>
                    <Text className="text-text-secondary text-xs line-clamp-2 leading-4 h-8" numberOfLines={2}>
                        {shop.description}
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

export default ShopCard;
