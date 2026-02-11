import { View, TouchableOpacity } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { Ionicons } from "@expo/vector-icons";
import usePromoBanners from "@/hooks/usePromoBanners";
import { AppText } from "../ui/AppText";
import { OptimizedImage } from "../common/OptimizedImage";

export default function PromoBanners() {
    const { theme } = useTheme();
    const { data: banners = [], isLoading, isError } = usePromoBanners();

    if (isLoading || isError || !Array.isArray(banners) || banners.length === 0) {
        return null;
    }

    return (
        <View className="flex-row px-3 bg-white dark:bg-background pb-4 pt-2">
            {banners.slice(0, 2).map((banner, index) => {
                const isSubsidy = banner.type === "subsidy";
                const bgColorClass = isSubsidy
                    ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-500/20"
                    : "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-500/20";
                const textColorClass = isSubsidy ? "text-red-500" : "text-green-600";
                const iconName = isSubsidy ? "diamond" : "nutrition";
                const iconColor = isSubsidy ? "#FAB005" : "#22C55E";

                return (
                    <TouchableOpacity
                        key={banner._id || `banner-${index}`}
                        className={`flex-1 ${index === 0 ? 'mr-2' : 'ml-2'} ${bgColorClass} p-3 rounded-lg border`}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center gap-1 mb-1">
                            {isSubsidy ? (
                                <AppText className="text-red-500 font-black italic text-lg">{banner.title}</AppText>
                            ) : (
                                <>
                                    <Ionicons name={iconName as any} size={18} color={iconColor} />
                                    <AppText className="text-green-600 font-bold text-lg">{banner.title}</AppText>
                                </>
                            )}
                        </View>
                        <View className="flex-row items-center gap-1">
                            {isSubsidy && <Ionicons name={iconName as any} size={14} color={iconColor} />}
                            <AppText className={`${isSubsidy ? 'text-orange-500' : 'text-green-500 text-opacity-80'} text-xs font-bold`}>
                                {banner.label}
                            </AppText>
                        </View>
                        <View className="flex-row mt-3 justify-between items-end">
                            <OptimizedImage
                                source={banner.imageUrl}
                                width={96} // 48px * 2
                                height={96}
                                className="w-12 h-12"
                                contentFit="cover"
                            />
                            <AppText className="text-red-600 font-bold text-lg">{banner.price}</AppText>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
