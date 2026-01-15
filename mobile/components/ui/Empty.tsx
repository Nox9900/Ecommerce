import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { AnimatedContainer } from './AnimatedContainer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';

interface EmptyProps {
    title: string;
    subtitle: string;
    buttonTitle: string;
    buttonAction?: () => void;
}

export default function EmptyUI({ title, subtitle, buttonTitle, buttonAction }: EmptyProps) {
  const { theme } = useTheme();
  return (
      <AnimatedContainer animation="fadeUp" className="flex-1 items-center justify-center px-10">
        {/* <View className="w-24 h-24 bg-surface-light rounded-full items-center justify-center mb-6 border border-white/5">
          <Ionicons name="heart-outline" size={48} color="#475569" />
        </View> */}
        <Text className="text-text-primary font-bold text-2xl mt-4 text-center">{title}</Text>
        <Text className="text-text-secondary text-center mt-3 text-base opacity-70">
          {subtitle}
        </Text>
        {buttonTitle && buttonAction && (
        <TouchableOpacity
          className={`rounded-2xl px-10 py-4 mt-10 shadow-lg shadow-primary/20 ${theme === "dark" ? "bg-primary/20" : "bg-primary"}`}
          activeOpacity={0.8}
          onPress={buttonAction}
        >
          <Text className={`uppercase ${theme === "dark" ? "text-white" : "text-black"}`}>{buttonTitle}</Text>
        </TouchableOpacity>
        )}
      </AnimatedContainer>
    );
}