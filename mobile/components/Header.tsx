import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { AppText } from "./ui/AppText";

interface HeaderProps {
  onAdd?: () => void;
  primaryText?: string;
  secondaryText?: string;
  rightComponent?: React.ReactNode;
}

export default function Header({ onAdd, primaryText, secondaryText, rightComponent }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      className="px-2 pb-4 border-b border-black/5 dark:border-white/5 flex-row items-center justify-between"
      style={{ paddingTop: insets.top + 10 }}
    >
      <View className="flex-row items-center justify-between flex-1">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`w-10 h-10 items-center justify-center`}
          >
            <Ionicons name="arrow-back" size={20} color={theme === 'dark' ? '#FAFAFA' : '#262626'} />
          </TouchableOpacity>
          <View className="ml-2">
            <AppText className="text-text-primary text-3xl font-bold">{primaryText}</AppText>
          </View>
        </View>

        <View className="flex-row items-center justify-end gap-2">
          {rightComponent}
          {onAdd && (
            <TouchableOpacity
              onPress={onAdd}
              className="w-10 h-10 mr-4 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10"
            >
              <Ionicons name="add" size={24} color={theme === 'dark' ? '#FAFAFA' : '#262626'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
