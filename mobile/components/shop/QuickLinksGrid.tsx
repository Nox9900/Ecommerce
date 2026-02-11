import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
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
            <View className="flex-row flex-wrap">
                {displayItems.length > 0 ? (
                    displayItems.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={item._id || index}
                            className="w-[20%] items-center mb-4"
                            activeOpacity={0.7}
                            onPress={() => onLinkPress(item)}
                        >
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center mb-1 overflow-hidden"
                                style={{
                                    backgroundColor: item.icon?.startsWith('http')
                                        ? 'transparent'
                                        : (item.color || (theme === 'dark' ? '#3B82F6' : '#3B82F6')) + '15'
                                }}
                            >
                                {item.icon?.startsWith('http') ? (
                                    <Image
                                        source={{ uri: item.icon }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Ionicons name={(item.icon || 'grid') as any} size={24} color={item.color || '#3B82F6'} />
                                )}
                            </View>
                            <AppText className="text-[10px] text-text-primary text-center" numberOfLines={1}>
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
