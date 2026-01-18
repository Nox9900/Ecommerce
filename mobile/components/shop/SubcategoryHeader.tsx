import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { SubCategory } from "@/types";
import { useRef, useEffect } from "react";

interface SubcategoryHeaderProps {
    title: string;
    onSearch?: (query: string) => void;
    subcategories?: SubCategory[];
    onSubcategoryPress?: (sub: SubCategory) => void;
    currentSubcategoryId?: string;
    activeColor?: string;
}

export default function SubcategoryHeader({
    title,
    onSearch,
    subcategories = [],
    onSubcategoryPress,
    currentSubcategoryId,
    activeColor = "#EF4444"
}: SubcategoryHeaderProps) {
    const { theme } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll to current subcategory tab
    useEffect(() => {
        const index = subcategories.findIndex(s => s._id === currentSubcategoryId);
        if (index !== -1 && scrollViewRef.current) {
            // Estimate position: ~80px per tab
            const scrollX = Math.max(0, (index * 80) - 100);
            scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
        }
    }, [currentSubcategoryId, subcategories]);

    return (
        <View className="bg-white dark:bg-background pt-2 pb-3 px-3 border-b border-gray-100 dark:border-zinc-800">
            <View className="flex-row items-center gap-2">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-8 h-8 items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                </TouchableOpacity>

                {/* Branded Search Area */}
                <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-zinc-800 rounded-full px-3 h-10 border border-red-500/10">
                    <Text className="text-red-500 font-black italic mr-2 text-xs">Subsidy</Text>
                    <View className="w-[1px] h-4 bg-gray-300 dark:bg-zinc-700 mr-2" />
                    <Ionicons name="search" size={16} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-text-primary text-sm"
                        placeholder={title}
                        placeholderTextColor="#9CA3AF"
                        onChangeText={onSearch}
                        autoCapitalize="none"
                        returnKeyType="search"
                    />
                </View>

                {/* Optional notification/action can go here */}
            </View>

            {/* Dynamic Filter Bar */}
            {subcategories.length > 0 && (
                <View className="mt-4 -mx-3">
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 12, gap: 16 }}
                    >
                        {/* Always show "Featured/All" as first tab? Or just the siblings */}
                        {subcategories.map((sub, index) => (
                            <FilterTab
                                key={sub._id || `sub-${index}`}
                                label={sub.name}
                                active={sub._id === currentSubcategoryId}
                                onPress={() => onSubcategoryPress?.(sub)}
                                activeColor={activeColor}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

function FilterTab({
    label,
    active,
    onPress,
    activeColor
}: {
    label: string;
    active?: boolean;
    onPress: () => void;
    activeColor: string;
}) {
    return (
        <TouchableOpacity className="items-center" onPress={onPress}>
            <Text
                className={`text-[13px] ${active ? 'font-bold' : 'text-text-secondary font-medium'}`}
                style={active ? { color: activeColor } : {}}
            >
                {label}
            </Text>
            {active && <View className="h-0.5 w-4 mt-1 rounded-full" style={{ backgroundColor: activeColor }} />}
        </TouchableOpacity>
    );
}
