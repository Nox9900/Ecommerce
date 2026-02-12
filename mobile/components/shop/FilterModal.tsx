import React, { useState, useEffect } from "react";
import { View, Modal, TouchableOpacity, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { AppText } from "../ui/AppText";

interface FilterParams {
    minPrice?: string;
    maxPrice?: string;
    minRating?: number;
    sort?: string;
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterParams) => void;
    initialFilters: FilterParams;
}

export default function FilterModal({ visible, onClose, onApply, initialFilters }: FilterModalProps) {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<FilterParams>(initialFilters);

    useEffect(() => {
        if (visible) {
            setFilters(initialFilters);
        }
    }, [visible, initialFilters]);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            minPrice: "",
            maxPrice: "",
            minRating: 0,
            sort: "latest",
        };
        setFilters(resetFilters);
        // onApply(resetFilters); // Optional: apply immediately on reset
    };

    const toggleSort = (value: string) => {
        setFilters((prev) => ({ ...prev, sort: value }));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white dark:bg-zinc-900 rounded-t-3xl p-6 h-[80%]">
                    <View className="flex-row justify-between items-center mb-6">
                        <AppText className="text-2xl font-bold text-text-primary">{t('common.filters')}</AppText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} className="text-text-primary" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {/* Sort Options */}
                        <View className="mb-6">
                            <AppText className="text-lg font-semibold text-text-primary mb-3">{t('common.sort_by')}</AppText>
                            <View className="flex-row flex-wrap gap-2">
                                {[
                                    { label: t('common.latest'), value: "latest" },
                                    { label: t('common.price_low_high'), value: "price_asc" },
                                    { label: t('common.price_high_low'), value: "price_desc" },
                                    { label: t('common.popular'), value: "popular" },
                                    { label: t('common.rating'), value: "rating" },
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => toggleSort(option.value)}
                                        className={`px-4 py-2 rounded-full border ${filters.sort === option.value
                                            ? "bg-primary border-primary"
                                            : "bg-transparent border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        <AppText
                                            className={`${filters.sort === option.value
                                                ? "text-primary-foreground font-bold"
                                                : "text-text-primary"
                                                }`}
                                        >
                                            {option.label}
                                        </AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range */}
                        <View className="mb-6">
                            <AppText className="text-lg font-semibold text-text-primary mb-3">{t('common.price_range')}</AppText>
                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Input
                                        placeholder="Min"
                                        keyboardType="numeric"
                                        value={filters.minPrice}
                                        onChangeText={(text) => setFilters((prev) => ({ ...prev, minPrice: text }))}
                                        containerClassName="mb-0"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Input
                                        placeholder="Max"
                                        keyboardType="numeric"
                                        value={filters.maxPrice}
                                        onChangeText={(text) => setFilters((prev) => ({ ...prev, maxPrice: text }))}
                                        containerClassName="mb-0"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Rating */}
                        <View className="mb-6">
                            <AppText className="text-lg font-semibold text-text-primary mb-3">{t('common.minimum_rating')}</AppText>
                            <View className="flex-row gap-2">
                                {[4, 3, 2, 1].map((rating) => (
                                    <TouchableOpacity
                                        key={rating}
                                        onPress={() => setFilters((prev) => ({ ...prev, minRating: prev.minRating === rating ? 0 : rating }))}
                                        className={`flex-row items-center px-4 py-2 rounded-full border ${filters.minRating === rating
                                            ? "bg-yellow-100 border-yellow-500"
                                            : "bg-transparent border-gray-300 dark:border-gray-700"
                                            }`}
                                    >
                                        <Ionicons name="star" size={16} color={filters.minRating === rating ? "#EAB308" : "#9CA3AF"} />
                                        <AppText
                                            className={`ml-1 ${filters.minRating === rating
                                                ? "text-yellow-700 font-bold"
                                                : "text-text-primary"
                                                }`}
                                        >
                                            {rating}+
                                        </AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View className="flex-row gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
                        <Button
                            title={t('common.reset')}
                            variant="outline"
                            className="flex-1"
                            onPress={handleReset}
                        />
                        <Button
                            title={t('common.apply')}
                            variant="primary"
                            className="flex-1"
                            onPress={handleApply}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}
