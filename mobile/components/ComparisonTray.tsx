import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import { useComparison } from '@/context/ComparisonContext';
import { AppText } from './ui/AppText';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AnimatedContainer } from './ui/AnimatedContainer';
import { useTheme } from '@/lib/useTheme';

export const ComparisonTray = () => {
    const { comparisonList, removeFromCompare, clearComparison } = useComparison();
    const { theme } = useTheme();

    if (comparisonList.length === 0) return null;

    const handleCompare = () => {
        router.push('/comparison');
    };

    return (
        <AnimatedContainer
            animation="fadeUp"
            className="absolute bottom-24 left-4 right-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 p-4 z-50"
        >
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <AppText className="font-bold text-text-primary">Compare Products</AppText>
                    <View className="bg-primary px-2 py-0.5 rounded-full">
                        <AppText className="text-white text-xs font-bold">{comparisonList.length}/3</AppText>
                    </View>
                </View>
                <Pressable onPress={clearComparison} hitSlop={10}>
                    <AppText className="text-text-tertiary text-xs">Clear All</AppText>
                </Pressable>
            </View>

            <View className="flex-row items-center gap-4">
                <View className="flex-1 flex-row gap-3">
                    {comparisonList.map((product) => (
                        <View key={product._id} className="relative">
                            <Image
                                source={{ uri: product.images[0] }}
                                className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-zinc-800"
                            />
                            <Pressable
                                onPress={() => removeFromCompare(product._id)}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white dark:border-zinc-900"
                            >
                                <Ionicons name="close" size={12} color="white" />
                            </Pressable>
                        </View>
                    ))}
                    {comparisonList.length < 3 && (
                        <View className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 items-center justify-center">
                            <Ionicons name="add" size={20} color={theme === 'dark' ? '#52525b' : '#d4d4d8'} />
                        </View>
                    )}
                </View>

                <Pressable
                    onPress={handleCompare}
                    disabled={comparisonList.length < 2}
                    className={`px-6 py-3 rounded-xl ${comparisonList.length < 2 ? 'bg-gray-200 dark:bg-zinc-800' : 'bg-primary'
                        }`}
                >
                    <AppText
                        className={`font-bold ${comparisonList.length < 2 ? 'text-gray-400' : 'text-white'
                            }`}
                    >
                        Compare
                    </AppText>
                </Pressable>
            </View>
        </AnimatedContainer>
    );
};
