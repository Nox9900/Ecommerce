import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Product } from '@/types';
import { AppText } from './ui/AppText';
import { useTheme } from '@/lib/useTheme';
import { OptimizedImage } from './common/OptimizedImage';

interface CompactProductCardProps {
    product: Product;
}

export const CompactProductCard = ({ product }: CompactProductCardProps) => {
    const { theme } = useTheme();

    const handlePress = () => {
        router.push(`/product/${product._id}`);
    };

    return (
        <Pressable
            onPress={handlePress}
            className="items-center flex-1"
        >
            <View className="mb-1 items-center justify-center rounded-3xl overflow-hidden">
                <OptimizedImage
                    source={product.images[0]}
                    width={128} // 64 * 2 for retina display
                    height={128}
                    className="w-14 h-14"
                    contentFit="contain"
                />
            </View>

            <View className="flex-row items-baseline justify-center">
                <AppText className="text-red-500 font-black text-[10px] mr-0.5">¥</AppText>
                <AppText className="text-red-500 font-bold text-base">
                    {product.price.toFixed(product.price % 1 === 0 ? 0 : 2)}
                </AppText>
            </View>
        </Pressable>
    );
};
