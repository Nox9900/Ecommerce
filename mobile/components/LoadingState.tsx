import { View, ActivityIndicator } from "react-native";
import { AppText } from "./ui/AppText";

interface LoadingStateProps {
  message?: string;
  color?: string;
}

const LoadingState = ({ message = "Loading...", color = "#00D9FF" }: LoadingStateProps) => {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size={"large"} color={color} />
      <AppText className="text-text-secondary mt-4">{message}</AppText>
    </View>
  );
};

export default LoadingState;
