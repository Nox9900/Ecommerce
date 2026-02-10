import { View, TouchableOpacity } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "../ui/AppText";

interface QuickLinksGridProps {
    items?: any[];
    onLinkPress: (link: any) => void;
}

export default function QuickLinksGrid({ items, onLinkPress }: QuickLinksGridProps) {
    const { theme } = useTheme();

    const displayItems = items || [];

    return (
        <View className="bg-white dark:bg-background py-4 px-2">
            <View className="flex-row flex-wrap justify-between">
                {displayItems.length > 0 ? (
                    displayItems.map((item, index) => (
                        <TouchableOpacity
                            key={item._id || index}
                            className="w-[20%] items-center mb-4"
                            activeOpacity={0.7}
                            onPress={() => onLinkPress(item)}
                        >
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mb-1"
                                style={{ backgroundColor: (item.color || (theme === 'dark' ? '#3B82F6' : '#3B82F6')) + '15' }} // 10% opacity, default blue color
                            >
                                <Ionicons name={(item.icon || 'grid') as any} size={22} color={item.color || '#3B82F6'} />
                            </View>
                            <AppText className="text-xs text-text-secondary font-medium text-center" numberOfLines={1}>
                                {item.label || item.name}
                            </AppText>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="w-full py-4 items-center">
                        <AppText className="text-sm text-text-secondary opacity-50 italic">No subcategories available</AppText>
                    </View>
                )}
            </View>
        </View>
    );
}
