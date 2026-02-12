import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./ui/AppText";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  title: string;
  description?: string;
  header?: string;
}

export function EmptyState({
  icon = "folder-open-outline",
  iconSize = 80,
  title,
  description,
  header,
}: EmptyStateProps) {
  return (
    <View className="flex-1 bg-background">
      {header && (
        <View className="px-6 pt-16 pb-5">
          <AppText className="text-text-primary text-3xl font-bold tracking-tight">{header}</AppText>
        </View>
      )}
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name={icon} size={iconSize} color="#666" />
        <AppText className="text-text-primary font-semibold text-xl mt-4">{title}</AppText>
        {description && <AppText className="text-text-secondary text-center mt-2">{description}</AppText>}
      </View>
    </View>
  );
}
