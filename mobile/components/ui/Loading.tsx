import { TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface LoadingProps {
    title?: string;
    subtitle?: string;
}

export default function LoadingUI({ title, subtitle }: LoadingProps) {
   const insets = useSafeAreaInsets();
    return (
      <View className="flex-1 bg-background">
        <View className="px-6 pb-4 border-b border-black/5 dark:border-white/5 flex-row items-center gap-4" style={{ paddingTop: insets.top + 10 }}>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10">
            <Ionicons name="arrow-back" size={20} className="text-text-primary" />
          </TouchableOpacity>
          <Text className="text-text-primary text-xl font-bold">{title}</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-text-tertiary font-bold uppercase tracking-widest mt-6 text-xs">{subtitle}</Text>
        </View>
      </View>
    );
}