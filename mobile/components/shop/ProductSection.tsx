import React from 'react';
import { View, Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { AppText } from '../ui/AppText';
import { CompactProductCard } from '../CompactProductCard';
import { Product } from '@/types';
import { router } from 'expo-router';

interface ProductSectionProps {
    title: string;
    products: Product[];
    isLoading?: boolean;
    onSeeAll?: () => void;
    icon?: React.ReactNode;
    subtitle?: string;
}

export const ProductSection = ({ title, products, isLoading, onSeeAll, icon, subtitle }: ProductSectionProps) => {
    if (!isLoading && products.length === 0) return null;

    return (
        <View className="my-1 bg-white dark:bg-zinc-900 py-3 rounded-2xl mx-1 flex-row">
            {/* Left Header Section */}
            <View className="w-24 px-3 justify-center border-r border-black/5 dark:border-white/5">
                {icon && <View className="mb-2 items-center">{icon}</View>}
                <AppText className="text-sm font-black text-text-primary tracking-tighter leading-4 text-center mb-1">
                    {title}
                </AppText>
                {subtitle && (
                    <AppText className="text-[8px] text-orange-500 font-bold uppercase text-center" numberOfLines={2}>
                        {subtitle}
                    </AppText>
                )}
                {onSeeAll && (
                    <Pressable onPress={onSeeAll} className="mt-3 items-center">
                        <AppText className="text-[10px] text-primary font-bold">See All</AppText>
                    </Pressable>
                )}
            </View>

            {/* Right Product List Section */}
            <View className="flex-1 flex-row items-center justify-between px-2">
                {(isLoading ? Array(4).fill({}) : products.slice(0, 4)).map((item, index) => (
                    <React.Fragment key={index}>
                        {isLoading ? (
                            <View className="items-center flex-1">
                                <View className="w-14 h-14 bg-gray-100/50 dark:bg-zinc-800/20 mb-2 rounded-md" />
                                <View className="w-10 h-2.5 bg-gray-100/50 dark:bg-zinc-800/20 rounded" />
                            </View>
                        ) : (
                            <CompactProductCard product={item as Product} />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
};
