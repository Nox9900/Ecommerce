import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTheme } from "@/lib/useTheme";

const QUICK_LINKS = [
    { label: "Limited Time", color: "#FF4D4F", icon: "timer" }, // Mock data
    { label: "Top Up", color: "#40A9FF", icon: "card" },
    { label: "Spin & Win", color: "#F759AB", icon: "gift" },
    { label: "9.9 Sale", color: "#FF7A45", icon: "pricetag" },
    { label: "Other", color: "#FAAD14", icon: "grid" },
    // Row 2 could be added here if needed, for now sticking to 5 primary as shown in top row clearly
];

// Reference shows 10 items (2 rows of 5)
// Let's implement full 10 mock items
const MOCK_LINKS = [
    { id: 1, label: "Limited", color: "#EF4444", icon: "flash" },
    { id: 2, label: "Top Up", color: "#3B82F6", icon: "wallet" },
    { id: 3, label: "Subsidy", color: "#EC4899", icon: "ticket" },
    { id: 4, label: "9.9 Sale", color: "#F97316", icon: "pricetags" },
    { id: 5, label: "More", color: "#EAB308", icon: "apps" },
    { id: 6, label: "Live", color: "#A855F7", icon: "videocam" },
    { id: 7, label: "Grocery", color: "#22C55E", icon: "nutrition" },
    { id: 8, label: "Global", color: "#06B6D4", icon: "earth" },
    { id: 9, label: "Electronics", color: "#6366F1", icon: "phone-portrait" },
    { id: 10, label: "Furniture", color: "#8B5CF6", icon: "bed" },
];

import { Ionicons } from "@expo/vector-icons";

interface QuickLink {
    id?: number | string;
    _id?: string;
    label?: string;
    name?: string;
    color?: string;
    icon: string;
}

interface QuickLinksGridProps {
    items?: any[];
    onLinkPress: (link: any) => void;
}

export default function QuickLinksGrid({ items, onLinkPress }: QuickLinksGridProps) {
    const { theme } = useTheme();

    const displayItems = items || MOCK_LINKS;

    return (
        <View className="bg-white dark:bg-background py-4 px-2">
            <View className="flex-row flex-wrap justify-between">
                {displayItems.map((item, index) => (
                    <TouchableOpacity
                        key={item.id || item._id || index}
                        className="w-[20%] items-center mb-4"
                        activeOpacity={0.7}
                        onPress={() => onLinkPress(item)}
                    >
                        <View
                            className="w-10 h-10 rounded-xl items-center justify-center mb-1"
                            style={{ backgroundColor: (item.color || '#737373') + '15' }} // 10% opacity
                        >
                            {/* Using Ionicons as placeholders for the graphic icons */}
                            <Ionicons name={(item.icon || 'grid') as any} size={22} color={item.color || (theme === 'dark' ? '#A3A3A3' : '#737373')} />
                            {/* Reference has badges like 'Hot', 'New'. Adding a visual mock for one */}
                            {items ? null : (item.id === 1 && (
                                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1 py-[1px] border border-white dark:border-background">
                                    <Text className="text-[8px] text-white font-bold">Hot</Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-xs text-text-secondary font-medium text-center" numberOfLines={1}>
                            {item.label || item.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
