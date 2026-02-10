import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View, Alert, Modal, TextInput, ActivityIndicator, I18nManager } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { GlassView } from "@/components/ui/GlassView";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import Header from "@/components/Header";

type SecurityOption = {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "navigation" | "toggle" | "action";
  value?: boolean;
};

function PrivacyAndSecurityScreen() {
  const { user } = userUser();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Password Change Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const securitySettings: SecurityOption[] = [
    {
      id: "password",
      icon: "lock-closed-outline",
      title: t('security.change_password'),
      description: t('security.change_password_desc'),
      type: "action",
    },
    {
      id: "two-factor",
      icon: "shield-checkmark-outline",
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security",
      type: "toggle",
      value: twoFactorEnabled,
    },
    {
      id: "biometric",
      icon: "finger-print-outline",
      title: "Biometric Login",
      description: "Use Face ID or Touch ID",
      type: "toggle",
      value: biometricEnabled,
    },
  ];

  const privacySettings: SecurityOption[] = [
    {
      id: "push",
      icon: "notifications-outline",
      title: "Push Notifications",
      description: "Receive push notifications",
      type: "toggle",
      value: pushNotifications,
    },
    {
      id: "email",
      icon: "mail-outline",
      title: "Email Notifications",
      description: "Receive order updates via email",
      type: "toggle",
      value: emailNotifications,
    },
  ];

  const handleToggle = async (id: string, value: boolean) => {
    switch (id) {
      case "two-factor": setTwoFactorEnabled(value); break;
      case "biometric": setBiometricEnabled(value); break;
      case "push":
        if (value) {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setPushNotifications(true);
          } else {
            setPushNotifications(false);
          }
        } else {
          setPushNotifications(false);
        }
        break;
      case "email": setEmailNotifications(value); break;
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await user?.updatePassword({ newPassword });
      Alert.alert(t('common.success'), t('security.password_success'));
      setPasswordModalVisible(false);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error("Password update error:", error);
      Alert.alert("Error", error.errors?.[0]?.message || t('security.error_updating'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('security.delete_confirm_title'),
      t('security.delete_confirm_desc'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.remove'),
          style: "destructive",
          onPress: async () => {
            try {
              await user?.delete();
              await signOut();
              Alert.alert(t('common.success'), t('security.delete_success'));
              router.replace("/(auth)/welcome");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", t('security.error_deleting'));
            }
          }
        }
      ]
    );
  };

  const { theme } = useTheme();

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <Header primaryText={t('profile.privacy_security')} secondaryText="Account Safetly" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* SECURITY SETTING */}
        <View className="px-6 pt-8">
          <AnimatedContainer animation="fadeUp" delay={100}>
            <AppText className="text-text-primary text-lg font-bold mb-4 ml-1">Security</AppText>
            <GlassView intensity={20} className="rounded-[32px] border border-black/10 dark:border-white/10 overflow-hidden mb-6">
              {securitySettings.map((setting, index) => (
                <TouchableOpacity
                  key={setting.id}
                  className={`p-5 flex-row items-center ${index !== securitySettings.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                  onPress={() => setting.id === 'password' && setPasswordModalVisible(true)}
                  activeOpacity={setting.type === "toggle" ? 1 : 0.7}
                >
                  <View className="bg-primary/10 rounded-2xl w-12 h-12 items-center justify-center mr-4 border border-primary/20">
                    <Ionicons name={setting.icon as any} size={22} color="#6366F1" />
                  </View>

                  <View className="flex-1">
                    <AppText className="text-text-primary font-bold text-base mb-0.5">
                      {setting.title}
                    </AppText>
                    <AppText className="text-text-tertiary text-xs">{setting.description}</AppText>
                  </View>

                  {setting.type === "toggle" ? (
                    <Switch
                      value={setting.value}
                      onValueChange={(value) => handleToggle(setting.id, value)}
                      thumbColor="#FFFFFF"
                      trackColor={{ false: "#1E293B", true: "#6366F1" }}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#475569" />
                  )}
                </TouchableOpacity>
              ))}
            </GlassView>
          </AnimatedContainer>
        </View>

        {/* Privacy Section */}
        <View className="px-6">
          <AnimatedContainer animation="fadeUp" delay={200}>
            <AppText className="text-text-primary text-lg font-bold mb-4 ml-1">Privacy</AppText>
            <GlassView intensity={20} className="rounded-[32px] border border-black/10 dark:border-white/10 overflow-hidden mb-6">
              {privacySettings.map((setting, index) => (
                <View
                  key={setting.id}
                  className={`p-5 flex-row items-center ${index !== privacySettings.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                >
                  <View className="bg-primary/10 rounded-2xl w-12 h-12 items-center justify-center mr-4 border border-primary/20">
                    <Ionicons name={setting.icon as any} size={22} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-text-primary font-bold text-base mb-0.5">
                      {setting.title}
                    </AppText>
                    <AppText className="text-text-tertiary text-xs">{setting.description}</AppText>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={(value) => handleToggle(setting.id, value)}
                    trackColor={{ false: "#1E293B", true: "#6366F1" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </GlassView>
          </AnimatedContainer>
        </View>

        {/* DELETE ACC BTN */}
        <View className="px-6">
          <AnimatedContainer animation="fadeUp" delay={300}>
            <TouchableOpacity
              className="bg-red-500/5 border border-red-500/10 p-6 rounded-[32px] flex-row items-center justify-between"
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-2xl bg-red-500/10 items-center justify-center border border-red-500/20">
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </View>
                <View>
                  <AppText className="text-red-500 text-base font-bold">{t('security.delete_account')}</AppText>
                  <AppText className="text-text-tertiary text-xs opacity-70">{t('security.delete_account_desc')}</AppText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" opacity={0.5} />
            </TouchableOpacity>
          </AnimatedContainer>
        </View>

        {/* INFO ALERT */}
        <View className="px-6 mt-8">
          <AnimatedContainer animation="fadeUp" delay={400}>
            <GlassView intensity={10} className="rounded-3xl p-5 flex-row border border-black/5 dark:border-white/5">
              <Ionicons name="information-circle-outline" size={24} color="#6366F1" />
              <AppText className="text-text-tertiary text-xs ml-3 flex-1 leading-5">
                {t('security.privacy_info', 'We take your privacy seriously. Your data is encrypted and stored securely. You can manage your privacy settings at any time.')}
              </AppText>
            </GlassView>
          </AnimatedContainer>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          setPasswordModalVisible(false);
          setNewPassword("");
          setConfirmPassword("");
        }}
      >
        <View className="flex-1 justify-end bg-black/70">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => {
              setPasswordModalVisible(false);
              setNewPassword("");
              setConfirmPassword("");
            }}
          />
          <AnimatedContainer animation="fadeUp" duration={400}>
            <View
              className={`p-8 rounded-t-[40px] border-t ${theme === 'dark' ? 'bg-[#121212] border-white/5' : 'bg-white border-black/5'} shadow-2xl pb-12`}
            >
              {/* Decorative Handle */}
              <View className={`w-12 h-1.5 rounded-full self-center -mt-2 mb-8 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`} />

              {/* Modal Header */}
              <View className="flex-row justify-between items-center mb-10">
                <View>
                  <AppText className="text-text-primary text-3xl font-black tracking-tighter">{t('security.change_password')}</AppText>
                  <View className="flex-row items-center mt-1">
                    <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                    <AppText className="text-text-tertiary text-[10px] font-black uppercase tracking-[2px]">Update Secret Access</AppText>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setPasswordModalVisible(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className={`w-12 h-12 rounded-full items-center justify-center border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}
                >
                  <Ionicons name="close" size={24} color={theme === 'dark' ? "#94A3B8" : "#475569"} />
                </TouchableOpacity>
              </View>

              {/* Input Fields */}
              <View className="flex-col gap-5">
                <View>
                  <AppText className="text-text-primary text-sm font-black mb-2 ml-1">New Password</AppText>
                  <View className={`flex-row items-center border rounded-2xl px-5 py-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <Ionicons name="lock-closed-outline" size={20} color="#6366F1" style={{ marginRight: 12 }} />
                    <TextInput
                      placeholder="Min. 8 characters"
                      placeholderTextColor={theme === 'dark' ? "#475569" : "#94A3B8"}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      className="text-text-primary text-base font-bold flex-1"
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      className="ml-2"
                    >
                      <Ionicons
                        name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={theme === 'dark' ? "#94A3B8" : "#475569"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <AppText className="text-text-primary text-sm font-black mb-2 ml-1">Confirm Password</AppText>
                  <View className={`flex-row items-center border rounded-2xl px-5 py-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <Ionicons name="shield-outline" size={20} color="#6366F1" style={{ marginRight: 12 }} />
                    <TextInput
                      placeholder="Repeat password"
                      placeholderTextColor={theme === 'dark' ? "#475569" : "#94A3B8"}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      className="text-text-primary text-base font-bold flex-1"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2"
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={theme === 'dark' ? "#94A3B8" : "#475569"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Action Button - Polished */}
              <TouchableOpacity
                className={`bg-primary h-18 rounded-[28px] items-center justify-center mt-12 shadow-xl shadow-primary/40 flex-row gap-3 ${isUpdatingPassword ? 'opacity-70' : ''}`}
                onPress={handleChangePassword}
                disabled={isUpdatingPassword}
                activeOpacity={0.8}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <AppText className={`font-black text-lg uppercase tracking-tight ${theme === 'dark' ? 'text-black' : 'text-white'}`}>Update Password</AppText>
                    <View className="bg-white/20 p-2 rounded-full">
                      <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#FFFFFF' : '#FFFFFF'} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </AnimatedContainer>
        </View>
      </Modal>
    </View>
  );
}

// Helper to avoid build error since I used userUser instead of useUser by mistake in thought
function userUser() {
  const { user } = useUser();
  return { user };
}

export default PrivacyAndSecurityScreen;
