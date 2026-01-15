import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { GlassView } from "./ui/GlassView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";

interface HeaderProps {
  onAdd?: () => void;
  primaryText? : string;
  secondaryText? : string;
}

export default function Header({ onAdd, primaryText, secondaryText }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View className="px-6  pb-4 border-b border-black/5 dark:border-white/5 flex-row items-center justify-between" style={{ paddingTop: insets.top + 20 }}>
      <View className="flex-row items-center justify-between gap-36">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10"
          >
            <Ionicons name="arrow-back" size={20} className="text-text-primary" />
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-text-primary text-xl font-bold">{primaryText}</Text>
            <Text className="text-text-tertiary text-[10px] font-bold uppercase tracking-widest">{secondaryText}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-end">
          {onAdd && (
            <TouchableOpacity
              onPress={onAdd}
              className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10"
            >
              <Ionicons name="add" size={24} className="text-text-primary" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
