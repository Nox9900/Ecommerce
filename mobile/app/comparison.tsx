import React from 'react';
import { View, ScrollView, Image, Pressable, SafeAreaView } from 'react-native';
import { useComparison } from '@/context/ComparisonContext';
import { AppText } from '@/components/ui/AppText';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import SafeScreen from '@/components/SafeScreen';

const ComparisonScreen = () => {
    const { comparisonList, removeFromCompare } = useComparison();
    const { theme } = useTheme();

    if (comparisonList.length === 0) {
        return (
            <SafeScreen>
                <View className="flex-1 items-center justify-center p-4">
                    <Ionicons name="layers-outline" size={64} color={theme === 'dark' ? '#3f3f46' : '#d4d4d8'} />
                    <AppText className="text-xl font-bold mt-4 text-text-primary">No products to compare</AppText>
                    <AppText className="text-text-tertiary text-center mt-2">Add products from the shop to start comparing.</AppText>
                    <Pressable
                        onPress={() => router.back()}
                        className="mt-8 bg-primary px-8 py-3 rounded-xl"
                    >
                        <AppText className="text-white font-bold">Go Back</AppText>
                    </Pressable>
                </View>
            </SafeScreen>
        );
    }

    const attributes = Array.from(new Set(comparisonList.flatMap(p => p.attributes?.map(a => a.name) || [])));

    return (
        <SafeScreen>
            <View className="flex-1 bg-white dark:bg-background">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-black/5 dark:border-white/5">
                    <Pressable onPress={() => router.back()} hitSlop={20}>
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? 'white' : 'black'} />
                    </Pressable>
                    <AppText className="text-lg font-bold text-text-primary">Compare Products</AppText>
                    <View className="w-6" />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Products Row */}
                    <View className="flex-row px-2 py-4">
                        {comparisonList.map((product) => (
                            <View key={product._id} className="flex-1 px-1">
                                <View className="relative">
                                    <Image
                                        source={{ uri: product.images[0] }}
                                        className="w-full h-40 rounded-xl bg-gray-100 dark:bg-zinc-800"
                                        resizeMode="cover"
                                    />
                                    <Pressable
                                        onPress={() => removeFromCompare(product._id)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white dark:border-zinc-900"
                                    >
                                        <Ionicons name="close" size={14} color="white" />
                                    </Pressable>
                                </View>
                                <AppText className="text-[13px] font-bold mt-2 text-text-primary" numberOfLines={2}>
                                    {product.name}
                                </AppText>
                                <AppText className="text-red-600 font-bold mt-1">¥{product.price.toFixed(2)}</AppText>
                            </View>
                        ))}
                        {comparisonList.length < 3 && (
                            <View className="flex-1 px-1 opacity-30">
                                <View className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 items-center justify-center">
                                    <Ionicons name="add" size={32} color={theme === 'dark' ? 'white' : 'black'} />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Comparison Table */}
                    <View className="px-4 pb-10">
                        {/* Rating Section */}
                        <ComparisonRow
                            label="Rating"
                            values={comparisonList.map(p => `${p.averageRating} (${p.totalReviews})`)}
                        />

                        {/* Brand Section */}
                        <ComparisonRow
                            label="Brand"
                            values={comparisonList.map(p => p.brand || 'Generic')}
                        />

                        {/* Category Section */}
                        <ComparisonRow
                            label="Category"
                            values={comparisonList.map(p => p.category)}
                        />

                        {/* Stock Section */}
                        <ComparisonRow
                            label="Stock"
                            values={comparisonList.map(p => p.stock > 0 ? 'In Stock' : 'Out of Stock')}
                        />

                        {/* Custom Attributes */}
                        {attributes.map(attrName => (
                            <ComparisonRow
                                key={attrName}
                                label={attrName}
                                values={comparisonList.map(p => {
                                    const attr = p.attributes?.find(a => a.name === attrName);
                                    return attr ? attr.values.join(', ') : '-';
                                })}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </SafeScreen>
    );
};

const ComparisonRow = ({ label, values }: { label: string; values: string[] }) => (
    <View className="py-4 border-b border-black/5 dark:border-white/5">
        <AppText className="text-xs text-text-tertiary uppercase font-bold mb-2">{label}</AppText>
        <View className="flex-row">
            {values.map((val, i) => (
                <View key={i} className="flex-1 px-1">
                    <AppText className="text-sm text-text-primary font-medium">{val}</AppText>
                </View>
            ))}
            {values.length < 3 && <View className="flex-1" />}
        </View>
    </View>
);

export default ComparisonScreen;
