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
                className={`mr-3 w-72 rounded-3xl overflow-hidden ${theme === "dark"
                        ? "bg-zinc-900 border-2 border-white/10 shadow-xl shadow-black/60"
                        : "bg-white border-2 border-black/5 shadow-lg shadow-black/10"
                    }`}
                activeOpacity={0.9}
                style={{ elevation: 8 }}
            >
                {/* Banner Image - Taller */}
                <Image
                    source={{ uri: shop.bannerUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" }}
                    className="w-full h-32 object-cover"
                />

                {/* Content */}
                <View className="px-5 pb-5 pt-2 -mt-8">
                    <View className="flex-row items-end gap-3 mb-3">
                        {/* Logo with enhanced shadow */}
                        <View className={`p-1.5 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-zinc-900 shadow-black/80' : 'bg-white shadow-black/20'}`}
                            style={{ elevation: 6 }}
                        >
                            <Image
                                source={{ uri: shop.logoUrl || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80" }}
                                className="w-16 h-16 rounded-xl"
                            />
                        </View>

                        {/* Shop Info */}
                        <View className="flex-1 pb-1">
                            <Text className="text-text-primary text-lg font-black truncate" numberOfLines={1}>
                                {shop.name}
                            </Text>
                            <View className="flex-row items-center mt-0.5">
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text className="text-text-secondary text-xs ml-1.5 font-semibold">
                                    4.8
                                </Text>
                                <Text className="text-text-tertiary text-xs ml-1">
                                    (120+ sold)
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="text-text-secondary text-sm line-clamp-2 leading-5" numberOfLines={2}>
                        {shop.description}
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

export default ShopCard;
