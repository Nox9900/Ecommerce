import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";

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

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
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
          <View className="px-6 pt-8 pb-8 justify-center items-center">
            <View className="relative shadow-2xl shadow-primary/20">
              <Image
                source={user?.imageUrl}
                className="w-28 h-28 rounded-full border-4 border-surface-light"
                contentFit="cover"
                transition={500}
              />
              <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-4 border-background">
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </View>

            <Text className="text-2xl font-bold text-text-primary mt-4 mb-1">
              {user?.fullName || "User"}
            </Text>
            <Text className="text-text-secondary text-base mb-6">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>

            <View className="flex-row gap-4 w-full px-4">
              <View className="flex-1 bg-surface-light p-4 rounded-2xl items-center border border-white/5">
                <Text className="text-primary font-bold text-xl">12</Text>
                <Text className="text-text-tertiary text-xs uppercase tracking-wider mt-1">Orders</Text>
              </View>
              <View className="flex-1 bg-surface-light p-4 rounded-2xl items-center border border-white/5">
                <Text className="text-primary font-bold text-xl">5</Text>
                <Text className="text-text-tertiary text-xs uppercase tracking-wider mt-1">Reviews</Text>
              </View>
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
