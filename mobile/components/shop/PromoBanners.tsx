import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { Ionicons } from "@expo/vector-icons";

export default function PromoBanners() {
    const { theme } = useTheme();

    return (
        <View className="flex-row px-3 bg-white dark:bg-background pb-4 pt-2">
            {/* Left Banner: Billions Subsidy */}
            <TouchableOpacity
                className="flex-1 mr-2 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20"
                activeOpacity={0.8}
            >
                <View className="flex-row items-center gap-1 mb-1">
                    <Text className="text-red-500 font-black italic text-lg">Billions Subsidy</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="diamond" size={14} color="#FAB005" />
                    <Text className="text-orange-500 text-xs font-bold">Official Subsidy</Text>
                </View>
                <View className="flex-row mt-3 justify-between items-end">
                    <Image
                        source={require('@/assets/images/icon.png')} // Fallback or placeholder
                        className="w-12 h-12 bg-gray-200 rounded-md"
                        resizeMode="cover"
                    />
                    <Text className="text-red-600 font-bold text-lg">¥38</Text>
                </View>
            </TouchableOpacity>

            {/* Right Banner: Grocery / Next Day */}
            <TouchableOpacity
                className="flex-1 ml-2 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-500/20"
                activeOpacity={0.8}
            >
                <View className="flex-row items-center gap-1 mb-1">
                    <Ionicons name="nutrition" size={18} color="#22C55E" />
                    <Text className="text-green-600 font-bold text-lg">Fresh Grocery</Text>
                </View>
                <Text className="text-green-500 text-xs text-opacity-80">Next Day Pickup</Text>
                <View className="flex-row mt-3 justify-between items-end">
                    <Image
                        source={require('@/assets/images/icon.png')}
                        className="w-12 h-12 bg-gray-200 rounded-md"
                        resizeMode="cover"
                    />
                    <Text className="text-red-600 font-bold text-lg">¥112.9</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}
