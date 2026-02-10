import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { AnimatedContainer } from './AnimatedContainer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';

interface EmptyProps {
  title: string;
  subtitle: string;
  buttonTitle?: string;
  buttonAction?: () => void;
  icon?: string;
}

export default function EmptyUI({ title, subtitle, buttonTitle, buttonAction, icon = "cart-outline" }: EmptyProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-1 items-center justify-center px-10">
      <AnimatedContainer animation="fadeDown" className="w-24 h-24 bg-surface-light rounded-full items-center justify-center mb-6 border border-black/5 dark:border-white/5">
        <Ionicons name={icon as any} size={48} color={theme === "dark" ? "#6366F1" : "#475569"} />
      </AnimatedContainer>

      <AnimatedContainer animation="fadeUp" delay={100} className="items-center">
        <Text className="text-text-primary font-bold text-2xl mt-4 text-center">{title}</Text>
        <Text className="text-text-secondary text-center mt-3 text-base opacity-70 leading-6">
          {subtitle}
        </Text>

        {buttonTitle && buttonAction && (
          <TouchableOpacity
            className={`rounded-2xl px-12 py-4 mt-10 shadow-lg ${theme === "dark" ? "bg-primary shadow-primary/30" : "bg-black shadow-black/20"}`}
            activeOpacity={0.8}
            onPress={buttonAction}
          >
            <Text className="text-white font-bold uppercase tracking-wider">{buttonTitle}</Text>
          </TouchableOpacity>
        )}
      </AnimatedContainer>
    </View>
  );
}