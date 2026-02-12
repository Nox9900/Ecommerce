import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./ui/AppText";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please check your connection and try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <AppText className="text-text-primary font-semibold text-xl mt-4">{title}</AppText>
      <AppText className="text-text-secondary text-center mt-2">{description}</AppText>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <AppText className="text-background font-semibold">Try Again</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}
