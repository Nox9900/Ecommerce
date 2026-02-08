import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface SearchHistoryProps {
    history: string[];
    onSelect: (term: string) => void;
    onClear: () => void;
    onRemove: (term: string) => void;
    visible: boolean;
}

export default function SearchHistory({
    history,
    onSelect,
    onClear,
    onRemove,
    visible
}: SearchHistoryProps) {
    const { t } = useTranslation();

    if (!visible || history.length === 0) return null;

    return (
        <View className="bg-white dark:bg-background px-4 py-2 border-t border-black/5 dark:border-white/5 w-full">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-text-tertiary">{t('common.recent_searches')}</Text>
                <TouchableOpacity onPress={onClear}>
                    <Text className="text-xs text-primary font-medium">{t('common.clear_all')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
                {history.map((term, index) => (
                    <TouchableOpacity
                        key={index}
                        className="flex-row items-center justify-between py-3 border-b border-black/5 dark:border-white/5 last:border-0"
                        onPress={() => onSelect(term)}
                    >
                        <View className="flex-row items-center flex-1">
                            <Ionicons name="time-outline" size={18} color="#9CA3AF" />
                            <Text className="ml-3 text-text-primary text-base" numberOfLines={1}>{term}</Text>
                        </View>
                        <TouchableOpacity onPress={() => onRemove(term)} className="p-1">
                            <Ionicons name="close" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
