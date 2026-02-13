import useSocialAuth from "@/hooks/useSocialAuth";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();
  const router = useRouter();
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <View className="px-8 flex-1 justify-center items-center bg-background">
      {/* DEMO IMAGE */}
      <Image
        source={require("../../assets/images/auth-image.png")}
        className="size-96"
        resizeMode="contain"
      />

      <View className="gap-3 mt-3 w-full max-w-sm">
        {/* GOOGLE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-surface-light border border-border rounded-2xl px-6 py-4"
          onPress={() => handleSocialAuth("oauth_google")}
          disabled={loadingStrategy !== null}
        >
          {loadingStrategy === "oauth_google" ? (
            <ActivityIndicator size={"small"} color={"#737373"} />
          ) : (
            <View className="flex-row items-center justify-center">
              <Image
                source={require("../../assets/images/google.png")}
                className="size-6 mr-3"
                resizeMode="contain"
              />
              <Text className="text-text-primary font-semibold text-base">Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* EMAIL SIGN IN BTN */}
        {/* <TouchableOpacity
          className="flex-row items-center justify-center bg-primary rounded-2xl px-6 py-4"
          onPress={() => router.push("/(auth)/email-signin")}
          disabled={loadingStrategy !== null}
        >
          <Text className="text-primary-foreground font-semibold text-base">Continue with Email</Text>
        </TouchableOpacity> */}

        {/* PHONE SIGN IN BTN */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-surface-light border border-border rounded-2xl px-6 py-4"
          onPress={() => router.push("/(auth)/phone-signin")}
          disabled={loadingStrategy !== null}
        >
          <Text className="text-text-primary font-semibold text-base">Continue with Phone</Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-4">
          <Text className="text-text-secondary">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/email-signup")}>
            <Text className="text-text-primary font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-center text-text-tertiary text-xs leading-4 mt-6 px-2">
        By signing up, you agree to our <Text className="text-accent-info">Terms</Text>
        {", "}
        <Text className="text-accent-info">Privacy Policy</Text>
        {", and "}
        <Text className="text-accent-info">Cookie Use</Text>
      </Text>
    </View>
  );
};

export default AuthScreen;
