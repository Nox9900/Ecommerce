import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View, ScrollView, Alert, Switch, Linking } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { GlassView } from "@/components/ui/GlassView";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

const MENU_ITEMS = [
  {
    icon: "person-outline",
    label: "profile.my_addresses",
    route: "/(profile)/addresses",
  },
  {
    icon: "bag-handle-outline",
    label: "profile.my_orders",
    route: "/(profile)/orders",
  },
  {
    icon: "heart-outline",
    label: "profile.wishlist",
    route: "/(profile)/wishlist",
  },
  {
    icon: "shield-checkmark-outline",
    label: "profile.privacy_security",
    route: "/(profile)/privacy-security",
  },
] as const;

const VENDOR_PORTAL_URL = "https://ecommerce-production-aa.up.railway.app/vendor-onboarding"; // Replace with actual URL

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/welcome" as any);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Header Profile Section */}
          <AnimatedContainer animation="fadeDown" className="px-6 pt-10 pb-8">
            <View className="p-8 rounded-[40px] border border-white/10 shadow-xl overflow-hidden">
              <View className="flex-row items-center gap-24">
                {/* Profile Image */}
                <View className="">
                  <View className="shadow-2xl shadow-primary/40 rounded-full">
                    <Image
                      source={user?.hasImage ? user.imageUrl : require("@/assets/images/default-avatar.png")}
                      className="w-24 h-24 border-4 border-surface dark:border-black"
                      contentFit="cover"
                      transition={500}
                    />
                  </View>
                  <TouchableOpacity className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-[3px] border-surface dark:border-black shadow-md">
                    <Ionicons name="camera-outline" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Text Content */}
                <View className="flex-1 ">
                  <Text className="text-2xl font-bold text-text-primary mb-1">
                    {user?.fullName || "User"}
                  </Text>
                  <Text className="text-text-secondary text-sm font-medium opacity-80 mb-4">
                    {user?.primaryEmailAddress?.emailAddress}
                  </Text>

                  {/* Quick Stats - Mini Row */}
                  {/* <View className="flex-row gap-6">
                    <View>
                      <Text className="text-text-primary font-bold text-lg tracking-tight">12</Text>
                      <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-widest">{t('profile.my_orders').split('.')[1] || 'Orders'}</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-black/5 dark:bg-white/10" />
                    <View>
                      <Text className="text-text-primary font-bold text-lg tracking-tight">5</Text>
                      <Text className="text-text-tertiary text-[10px] uppercase font-bold tracking-widest">Reviews</Text>
                    </View>
                  </View> */}
                </View>
              </View>
            </View>
          </AnimatedContainer>

          {/* Menu Items - Grouped */}
          <AnimatedContainer animation="fadeUp" delay={300} className="px-6 mb-6">
            <Text className="text-text-primary font-bold text-xl mb-4 ml-2">{t('profile.account')}</Text>
            <GlassView intensity={theme === 'dark' ? 20 : 40} className="rounded-3xl overflow-hidden border border-white/5">
              {MENU_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center justify-between p-5 ${index !== MENU_ITEMS.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-2xl bg-background items-center justify-center">
                      <Ionicons name={item.icon as any} size={24} color="#94A3B8" />
                    </View>
                    <Text className="text-text-primary text-lg font-bold">{t(item.label)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </TouchableOpacity>
              ))}
            </GlassView>
          </AnimatedContainer>

          {/* Language Selection - Grouped */}
          <AnimatedContainer animation="fadeUp" delay={400} className="px-6 mb-6">
            <Text className="text-text-primary font-bold text-xl mb-4 ml-2">{t('profile.settings')}</Text>
            <GlassView intensity={theme === 'dark' ? 20 : 40} className="rounded-3xl overflow-hidden border border-white/5">
              <TouchableOpacity
                className="flex-row items-center justify-between p-5"
                onPress={() => router.push("/(profile)/language")}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-2xl bg-background items-center justify-center">
                    <Ionicons name="language-outline" size={24} color="#94A3B8" />
                  </View>
                  <Text className="text-text-primary text-lg font-bold">{t('profile.language')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-text-secondary font-bold">{i18n.language === 'fr' ? 'Français' : 'English'}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>
            </GlassView>

            {/* Theme Toggle - Grouped */}
            <AnimatedContainer animation="fadeUp" delay={200} className="mb-6">
              <GlassView intensity={theme === 'dark' ? 20 : 40} className="rounded-3xl overflow-hidden border border-white/5 p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
                      <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={24} color="#6366F1" />
                    </View>
                    <Text className="text-text-primary text-lg font-bold">{t('profile.dark_mode')}</Text>
                  </View>
                  <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#334155', true: '#6366F1' }}
                    thumbColor={theme === 'dark' ? '#FFFFFF' : '#f4f3f4'}
                  />
                </View>
              </GlassView>
            </AnimatedContainer>

            {/* Vendor Portal Section */}
            {user?.publicMetadata?.role !== "vendor" && user?.publicMetadata?.role !== "admin" && (
              <TouchableOpacity
                className="mt-6 bg-primary rounded-[32px] p-6 flex-row items-center justify-between shadow-lg"
                onPress={() => {
                  Alert.alert(
                    t('profile.become_vendor'),
                    t('profile.become_vendor_desc'),
                    [
                      { text: t('profile.cancel'), style: "cancel" },
                      {
                        text: t('profile.continue'), onPress: () => {
                          Linking.openURL(VENDOR_PORTAL_URL).catch((err) => {
                            console.error("Failed to open URL:", err);
                            Alert.alert("Error", "Could not open the vendor portal.");
                          });
                        }
                      }
                    ]
                  );
                }}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center">
                    <Ionicons name="storefront" size={28} color={`${theme === 'dark' ? "text-black" : "text-white"}`} />
                  </View>
                  <View className="flex-1">
                    <Text className={`${theme === 'dark' ? "text-black" : "text-white"} text-xl font-bold`}>{t('profile.become_vendor')}</Text>
                    <Text className={`${theme === 'dark' ? "text-black" : "text-white"}text-sm font-medium`} numberOfLines={1}>{t('profile.become_vendor_desc')}</Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </AnimatedContainer>

          {/* Logout Button */}
          <AnimatedContainer animation="fadeUp" delay={500} className="px-6 mt-4">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-red-500/10 border border-red-500/20 py-5 rounded-3xl active:bg-red-500/20"
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#EF4444" style={{ marginRight: 8 }} />
              <Text className="text-red-500 font-bold text-lg">{t('profile.sign_out')}</Text>
            </TouchableOpacity>
            <Text className="text-center text-text-tertiary text-xs font-bold uppercase tracking-widest mt-8">Version 1.0.0</Text>
          </AnimatedContainer>
        </ScrollView>
      </View>
    </SafeScreen>
  );
}
