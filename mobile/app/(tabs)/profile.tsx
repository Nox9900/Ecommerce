import SafeScreen from "@/components/SafeScreen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { TouchableOpacity, View, ScrollView, Alert, Switch, Linking } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { GlassView } from "@/components/ui/GlassView";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { UserAvatar } from "@/components/UserAvatar";
import { useFontSize } from "@/context/FontSizeContext";
import { AppText } from "@/components/ui/AppText";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import PhotoUploadModal from "@/components/PhotoUploadModal";
import FontSizeModal from "@/components/FontSizeModal";

const MENU_ITEMS = [
  {
    icon: "location-outline",
    label: "profile.my_addresses",
    description: "Manage your delivery addresses",
    route: "/(profile)/addresses",
    color: "#6366F1", // Indigo
  },
  {
    icon: "bag-check-outline",
    label: "profile.my_orders",
    description: "View your purchase history",
    route: "/(profile)/orders",
    color: "#6366F1", // Pink
  },
  {
    icon: "heart-outline",
    label: "profile.wishlist",
    description: "Your saved and favorite items",
    route: "/(profile)/wishlist",
    color: "#6366F1", // Rose
  },
  {
    icon: "shield-checkmark-outline",
    label: "profile.privacy_security",
    description: "Secure your account & data",
    route: "/(profile)/privacy-security",
    color: "#6366F1", // Emerald
  },
] as const;

const VENDOR_PORTAL_URL = "https://yaamaan.sevalla.app/vendor-onboarding";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { fontScale, setFontScale } = useFontSize();
  const [customProfilePhoto, setCustomProfilePhoto] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);

  // Load saved profile photo on mount
  useEffect(() => {
    const loadProfilePhoto = async () => {
      try {
        if (user?.id) {
          const savedPhoto = await AsyncStorage.getItem(`user_profile_photo_${user.id}`);
          if (savedPhoto) {
            setCustomProfilePhoto(savedPhoto);
          }
        }
      } catch (error) {
        console.error("Error loading profile photo:", error);
      }
    };
    loadProfilePhoto();
  }, [user?.id]);

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          t('common.error') || 'Error',
          t('profile.camera_permission_required') || 'Camera permission is required to take photos.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setCustomProfilePhoto(photoUri);

        // Save to AsyncStorage
        if (user?.id) {
          await AsyncStorage.setItem(`user_profile_photo_${user.id}`, photoUri);
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(
        t('common.error') || 'Error',
        t('profile.photo_upload_error') || 'Failed to take photo. Please try again.'
      );
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      // Request media library permissions
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (libraryPermission.status !== 'granted') {
        Alert.alert(
          t('common.error') || 'Error',
          t('profile.library_permission_required') || 'Photo library permission is required to select photos.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        setCustomProfilePhoto(photoUri);

        // Save to AsyncStorage
        if (user?.id) {
          await AsyncStorage.setItem(`user_profile_photo_${user.id}`, photoUri);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(
        t('common.error') || 'Error',
        t('profile.photo_upload_error') || 'Failed to select photo. Please try again.'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/(auth)/welcome" as any);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(t('common.error'), t('profile.logout_error'));
    }
  };

  const handleFontSizeChange = () => {
    setFontSizeModalVisible(true);
  };

  const currentLanguageLabel = t(`language.${i18n.language === 'en' ? 'english' : i18n.language === 'fr' ? 'french' : i18n.language === 'es' ? 'spanish' : i18n.language === 'ar' ? 'arabic' : i18n.language === 'zh' ? 'chinese' : 'russian'}`);

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

          {/* Header Profile Section */}
          <AnimatedContainer animation="fadeDown" className="px-6 pt-10 pb-8">
            <GlassView intensity={theme === 'dark' ? 10 : 30} className="p-8 rounded-[40px] border border-black/5 dark:border-white/10 overflow-hidden">
              <View className="flex-row items-center gap-6">
                {/* Profile Image */}
                <View className="relative">
                  <View className="shadow-2xl shadow-primary/40 rounded-full">
                    <UserAvatar
                      source={customProfilePhoto || user?.imageUrl}
                      name={user?.fullName || "User"}
                      size={96} // 24 * 4 = 96
                      className="border-4 border-surface dark:border-black/50"
                    />
                  </View>
                  <TouchableOpacity
                    className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-[3px] border-background shadow-md"
                    onPress={() => setPhotoModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* User Info */}
                <View className="flex-1">
                  <AppText className="text-2xl font-black">
                    {user?.fullName || "Guest User"}
                  </AppText>
                  <AppText className="text-text-tertiary text-[10px] font-bold opacity-80 mt-1 mb-4">
                    {user?.primaryEmailAddress?.emailAddress || "Sign in to sync data"}
                  </AppText>

                  {/* Badge */}
                  <View className="bg-primary/10 self-start px-2 py-1.5 rounded-full border border-primary/20">
                    <AppText className="text-primary text-sm font-black uppercase tracking-widest">
                      {user?.publicMetadata?.role as string || "Customer"} MEMBER
                    </AppText>
                  </View>
                </View>
              </View>
            </GlassView>
          </AnimatedContainer>

          {/* Account Section */}
          <View className="px-6 mb-8">
            <AnimatedContainer animation="fadeUp" delay={100}>
              <AppText className="text-text-primary text-xl font-black mb-4 ml-1 tracking-tight">{t('profile.account')}</AppText>
              <GlassView intensity={20} className="overflow-hidden">
                {MENU_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    className={`flex-row items-center p-5 ${index !== MENU_ITEMS.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""}`}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 border border-primary/20" style={{ backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }}>
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <View className="flex-1">
                      <AppText className="text-text-primary text-base font-bold">{t(item.label)}</AppText>
                      <AppText className="text-text-tertiary text-xs mt-0.5">{item.description}</AppText>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#64748B" opacity={0.5} />
                  </TouchableOpacity>
                ))}
              </GlassView>
            </AnimatedContainer>
          </View>

          {/* Settings Section */}
          <View className="px-6 mb-8">
            <AnimatedContainer animation="fadeUp" delay={200}>
              <AppText className="text-text-primary text-lg font-black mb-4 ml-1 tracking-tight">{t('profile.settings')}</AppText>
              <GlassView intensity={20} className="overflow-hidden">

                {/* Language Item */}
                <TouchableOpacity
                  className="flex-row items-center p-5 border-b border-black/5 dark:border-white/5"
                  onPress={() => router.push("/(profile)/language")}
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center mr-4">
                    <Ionicons name="language" size={24} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-text-primary text-base font-bold">{t('profile.language')}</AppText>
                    <AppText className="text-text-tertiary text-xs mt-0.5">{currentLanguageLabel}</AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" opacity={0.5} />
                </TouchableOpacity>

                {/* Dark Mode Item */}
                <View className="flex-row items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center mr-4">
                      <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={24} color="#6366F1" />
                    </View>
                    <View>
                      <AppText className="text-text-primary text-base font-bold">{t('profile.dark_mode')}</AppText>
                      <AppText className="text-text-tertiary text-xs mt-0.5">{theme === 'dark' ? 'Modern dark' : 'Vibrant light'}</AppText>
                    </View>
                  </View>
                  <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#1E293B', true: '#6366F1' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Font Size Item */}
                <TouchableOpacity
                  className="flex-row items-center p-5"
                  onPress={handleFontSizeChange}
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 items-center justify-center mr-4">
                    <Ionicons name="text-outline" size={24} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-text-primary text-base font-bold">{t('profile.font_size') || 'Font Size'}</AppText>
                    <AppText className="text-text-tertiary text-xs mt-0.5">{fontScale === 0.9 ? 'Small' : fontScale === 1.0 ? 'Medium' : 'Large'}</AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#64748B" opacity={0.5} />
                </TouchableOpacity>
              </GlassView>
            </AnimatedContainer>
          </View>

          {/* Vendor Portal Section */}
          {user?.publicMetadata?.role !== "vendor" && user?.publicMetadata?.role !== "admin" && (
            <View className="px-6 mb-8">
              <AnimatedContainer animation="fadeUp" delay={300}>
                <TouchableOpacity
                  className="bg-primary rounded-[32px] p-6 flex-row items-center justify-between shadow-xl shadow-primary/20"
                  activeOpacity={0.9}
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
                              Alert.alert(t('common.error'), "Could not open the vendor portal.");
                            });
                          }
                        }
                      ]
                    );
                  }}
                >
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center border border-white/30">
                      <Ionicons name="storefront" size={28} color={theme === 'dark' ? '#262626' : '#FAFAFA'} />
                    </View>
                    <View className="flex-1">
                      <AppText className="text-primary-foreground text-xl font-black">{t('profile.become_vendor')}</AppText>
                      <AppText className="text-primary-foreground text-xs font-bold" numberOfLines={1}>{t('profile.become_vendor_desc')}</AppText>
                    </View>
                  </View>
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <Ionicons name="arrow-forward" size={20} color={theme === 'dark' ? '#262626' : '#FAFAFA'} />
                  </View>
                </TouchableOpacity>
              </AnimatedContainer>
            </View>
          )}

          {/* Logout & Version */}
          <AnimatedContainer animation="fadeUp" delay={400} className="px-6 pb-12">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-red-500/10 border border-red-500/20 py-5 rounded-[32px] active:bg-red-500/20"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#EF4444" style={{ marginRight: 8 }} />
              <AppText className="text-red-500 font-black text-lg uppercase tracking-tight">{t('profile.sign_out')}</AppText>
            </TouchableOpacity>

            <View className="mt-8 items-center">
              <View className="bg-black/5 dark:bg-white/5 py-2 px-6 rounded-full border border-black/5 dark:border-white/5">
                <AppText className="text-text-tertiary text-[10px] font-black uppercase tracking-[3px]">{t('profile.version')} 1.0.0</AppText>
              </View>
            </View>
          </AnimatedContainer>

        </ScrollView>

        {/* Modals */}
        <PhotoUploadModal
          visible={photoModalVisible}
          onClose={() => setPhotoModalVisible(false)}
          onTakePhoto={handleTakePhoto}
          onChooseFromLibrary={handleChooseFromLibrary}
        />
        <FontSizeModal
          visible={fontSizeModalVisible}
          onClose={() => setFontSizeModalVisible(false)}
          currentScale={fontScale}
          onSelectSize={setFontScale}
        />
      </View>
    </SafeScreen>
  );
}
