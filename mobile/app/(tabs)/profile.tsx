import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View, ScrollView, Alert, Switch } from "react-native";
import { useTheme } from "@/lib/useTheme";

const MENU_ITEMS = [
  {
    icon: "person-outline",
    label: "My Addresses",
    route: "/(profile)/addresses",
  },
  {
    icon: "bag-handle-outline",
    label: "My Orders",
    route: "/(profile)/orders",
  },
  {
    icon: "heart-outline",
    label: "Wishlist",
    route: "/(profile)/wishlist",
  },
  {
    icon: "shield-checkmark-outline",
    label: "Privacy & Security",
    route: "/(profile)/privacy-security",
  },
] as const;

const VENDOR_PORTAL_URL = "https://ecommerce-production-aa.up.railway.app/vendor-onboarding"; // Replace with actual URL

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in" as any);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Header Profile Section */}
          <View className="px-6 pt-8 pb-6 bg-surface-light rounded-3xl mx-6 mt-4">
            <View className="flex-row items-center justify-between">
              {/* Profile Image - Left Side */}
              <View className="relative shadow-2xl shadow-primary/20 mr-4">
                {user?.imageUrl ? (
                  <Image
                    source={user.imageUrl}
                    className="w-24 h-24 rounded-full border-4 border-primary/30"
                    contentFit="cover"
                    transition={500}
                  />
                ) : (
                  <View className="w-56  h-56 rounded-full border-4 border-primary/30 bg-surface items-center justify-center">
                    <Ionicons name="person" size={40} color="#6366F1" />
                  </View>
                )}
                {/* <View className="absolute bottom-0 right-0 bg-primary w-7 h-7 rounded-full items-center justify-center border-3 border-surface-light">
                  <Ionicons name="camera" size={11} color="white" />
                </View> */}
              </View>

              {/* Text Content - Right Side */}
              <View className="flex-1">
                <Text className="text-2xl font-bold text-text-primary mb-1">
                  {user?.fullName || "User"}
                </Text>
                <Text className="text-text-secondary text-sm mb-4">
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>

                {/* Stats */}
                <View className="flex-row gap-3">
                  <View className="bg-background/50 px-3 py-2 rounded-xl">
                    <Text className="text-primary font-bold text-lg">12</Text>
                    <Text className="text-text-tertiary text-xs">Orders</Text>
                  </View>
                  <View className="bg-background/50 px-3 py-2 rounded-xl">
                    <Text className="text-primary font-bold text-lg">5</Text>
                    <Text className="text-text-tertiary text-xs">Reviews</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="h-6" />

          {/* Theme Toggle */}
          <View className="px-6 mt-2 mb-4">
            <Text className="text-text-primary font-bold text-lg mb-4 ml-1">Appearance</Text>
            <View className="bg-surface-light rounded-3xl overflow-hidden border border-white/5 p-5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-background items-center justify-center">
                  <Ionicons name="moon-outline" size={20} color="#94A3B8" />
                </View>
                <Text className="text-text-primary text-base font-medium">Dark Mode</Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: '#334155', true: '#6366F1' }}
                thumbColor={theme === 'dark' ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Menu Items */}
          <View className="px-6 mt-4">
            <Text className="text-text-primary font-bold text-lg mb-4 ml-1">Account</Text>
            <View className="bg-surface-light rounded-3xl overflow-hidden border border-white/5">
              {MENU_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center justify-between p-5 ${index !== MENU_ITEMS.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-full bg-background items-center justify-center">
                      <Ionicons name={item.icon as any} size={20} color="#94A3B8" />
                    </View>
                    <Text className="text-text-primary text-base font-medium">{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Vendor Portal Section */}
            {user?.publicMetadata?.role !== "vendor" && user?.publicMetadata?.role !== "admin" && (
              <TouchableOpacity
                className="mt-6 bg-primary/10 border border-primary/20 p-5 rounded-3xl flex-row items-center justify-between"
                onPress={() => {
                  Alert.alert(
                    "Become a Vendor",
                    "Do you want to start selling on our platform? You will be redirected to our vendor portal.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Continue", onPress: () => {
                          // In a real app, use Linking.openURL or a WebView
                          Alert.alert("Redirecting", "Redirecting to vendor portal...");
                        }
                      }
                    ]
                  );
                }}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                    <Ionicons name="storefront-outline" size={20} color="#6366F1" />
                  </View>
                  <View>
                    <Text className="text-text-primary text-base font-bold">Become a Vendor</Text>
                    <Text className="text-text-secondary text-xs">Start your own business today</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#6366F1" />
              </TouchableOpacity>
            )}
          </View>

          {/* Logout Button */}
          <View className="px-6 mt-8">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-surface-light/50 border border-red-500/20 p-4 rounded-2xl active:bg-red-500/10"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text className="text-red-500 font-bold text-base">Sign Out</Text>
            </TouchableOpacity>
            <Text className="text-center text-text-tertiary text-xs mt-6">Version 1.0.0</Text>
          </View>

        </ScrollView>
      </View>
    </SafeScreen>
  );
}
