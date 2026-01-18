import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useTheme } from "@/lib/useTheme";
import useCategories from "@/hooks/useCategories";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useEffect } from "react";

interface CategoryTabsProps {
    selectedCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
}

export default function CategoryTabs({ selectedCategoryId, onSelectCategory }: CategoryTabsProps) {
    const { theme } = useTheme();
    const { data: categories, isLoading } = useCategories();
    const scrollViewRef = useRef<ScrollView>(null);

    const allCategories = [
        { _id: "all", name: "All", icon: "" },
        ...(categories || [])
    ];

    // Auto-scroll to selected category when it changes (e.g., from swipe)
    useEffect(() => {
        const selectedIndex = allCategories.findIndex(cat => cat._id === selectedCategoryId);
        if (selectedIndex !== -1 && scrollViewRef.current) {
            // Calculate approximate position (each tab is ~80px wide with margins)
            const tabWidth = 80;
            const scrollPosition = Math.max(0, (selectedIndex * tabWidth) - 100);

            scrollViewRef.current.scrollTo({
                x: scrollPosition,
                animated: true,
            });
        }
    }, [selectedCategoryId]);

    return (
        <View className="bg-white dark:bg-background border-b border-black/5 dark:border-white/5">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                className="py-3"
            >
                {allCategories.map((category) => {
                    const isActive = selectedCategoryId === category._id;
                    return (
                        <TouchableOpacity
                            key={category._id}
                            onPress={() => onSelectCategory(category._id)}
                            className="mr-6 items-center relative"
                        >
                            {/* <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 border ${isActive ? 'bg-primary border-primary' : 'bg-surface-light border-black/5 dark:border-white/10'}`}>
                                {category._id === "all" ? (
                                    <Ionicons name="apps" size={20} color={isActive
                                        ? theme === 'dark' ? "#262626" : "#FAFAFA"
                                        : theme === 'dark' ? "#A3A3A3" : "#737373"} />
                                ) : (
                                    <Ionicons
                                        name={category.icon as any}
                                        size={20}
                                        color={
                                            isActive
                                                ? theme === 'dark' ? "#262626" : "#FAFAFA"
                                                : theme === 'dark' ? "#A3A3A3" : "#737373"
                                        }
                                        style={{ marginBottom: 4 }}
                                    />  
                                )}
                            </View> */}

                            <Text
                                className={`text-m ${isActive
                                    ? "font-bold text-primary"
                                    : "text-text-secondary font-medium"
                                    }`}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
