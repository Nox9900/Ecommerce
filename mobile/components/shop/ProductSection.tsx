import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { AppText } from '../ui/AppText';
import { ProductCard } from '../ProductCard';
import { Product } from '@/types';
import { router } from 'expo-router';

interface ProductSectionProps {
    title: string;
    products: Product[];
    isLoading?: boolean;
    onSeeAll?: () => void;
}

export const ProductSection = ({ title, products, isLoading, onSeeAll }: ProductSectionProps) => {
    if (!isLoading && products.length === 0) return null;

    return (
        <View className="my-4">
            <View className="flex-row justify-between items-center px-4 mb-3">
                <AppText className="text-xl font-bold text-text-primary">{title}</AppText>
                {onSeeAll && (
                    <Pressable onPress={onSeeAll}>
                        <AppText className="text-primary font-medium">See All</AppText>
                    </Pressable>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
            >
                {isLoading ? (
                    // Skeleton or Loading states
                    Array(3).fill(0).map((_, i) => (
                        <View key={i} className="w-40 h-64 bg-gray-100 dark:bg-zinc-800 rounded-lg mr-3 animate-pulse" />
                    ))
                ) : (
                    products.map((product, index) => (
                        <View key={product._id} className="w-44 mr-3">
                            {/* We might need a slightly different ProductCard for horizontal layout or just use it as is */}
                            <ProductCard product={product} index={index} />
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};
