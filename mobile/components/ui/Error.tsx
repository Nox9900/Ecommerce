import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from './AppText';

interface ErrorProps {
  title: string;
  subtitle: string;
  buttonTitle: string;
  buttonAction?: () => void;
}

export default function ErrorUI({ title, subtitle, buttonTitle, buttonAction }: ErrorProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-4 border-b border-black/5 dark:border-white/5 flex-row items-center gap-4" style={{ paddingTop: insets.top + 10 }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10">
          <Ionicons name="arrow-back" size={20} className="text-text-primary" />
        </TouchableOpacity>
        <AppText className="text-text-primary text-xl font-bold">Wishlist</AppText>
      </View>
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-20 h-20 bg-red-500/10 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        </View>
        <AppText className="text-text-primary font-bold text-xl mt-4 text-center">
          {title}
        </AppText>
        <AppText className="text-text-secondary text-center mt-2 text-sm opacity-80">
          {subtitle}
        </AppText>
        {buttonTitle && buttonAction && (
          <TouchableOpacity
            className="bg-surface-light px-10 py-4 rounded-2xl mt-8 border border-white/10"
            onPress={() => router.back()}
          >
            <AppText className="text-text-primary font-bold">{buttonTitle}</AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}