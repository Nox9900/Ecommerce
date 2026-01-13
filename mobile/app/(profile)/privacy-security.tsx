import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View, Alert, Modal, TextInput, ActivityIndicator, I18nManager } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { registerForPushNotificationsAsync } from "@/lib/notifications";

type SecurityOption = {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "navigation" | "toggle" | "action";
  value?: boolean;
};

function PrivacyAndSecurityScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [shareData, setShareData] = useState(false);

  // Password Change Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
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

    setIsUpdatingPassword(true);
    try {
      await user?.updatePassword({ newPassword });
      Alert.alert(t('common.success'), t('security.password_success'));
      setPasswordModalVisible(false);
      setNewPassword("");
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

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* HEADER */}
        <View className="px-6 pb-5 border-b border-surface flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="text-text-primary text-2xl font-bold">{t('profile.privacy_security')}</Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {/* SECURITY SETTING */}
          <View className="px-6 pt-6">
            <Text className="text-text-primary text-lg font-bold mb-4">Security</Text>

            {securitySettings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                className="bg-surface rounded-2xl p-4 mb-3"
                onPress={() => setting.id === 'password' && setPasswordModalVisible(true)}
                activeOpacity={setting.type === "toggle" ? 1 : 0.7}
              >
                <View className="flex-row items-center">
                  <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <Ionicons name={setting.icon as any} size={24} color="#6366F1" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-text-primary font-bold text-base mb-1">
                      {setting.title}
                    </Text>
                    <Text className="text-text-secondary text-sm">{setting.description}</Text>
                  </View>

                  {setting.type === "toggle" ? (
                    <Switch
                      value={setting.value}
                      onValueChange={(value) => handleToggle(setting.id, value)}
                      thumbColor="#FFFFFF"
                      trackColor={{ false: "#2A2A2A", true: "#6366F1" }}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Privacy Section */}
          <View className="px-6 pt-4">
            <Text className="text-text-primary text-lg font-bold mb-4">Privacy</Text>

            {privacySettings.map((setting) => (
              <View key={setting.id} className="bg-surface rounded-2xl p-4 mb-3">
                <View className="flex-row items-center">
                  <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <Ionicons name={setting.icon as any} size={24} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-bold text-base mb-1">
                      {setting.title}
                    </Text>
                    <Text className="text-text-secondary text-sm">{setting.description}</Text>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={(value) => handleToggle(setting.id, value)}
                    trackColor={{ false: "#2A2A2A", true: "#6366F1" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* DELETE ACC BTN */}
          <View className="px-6 pt-4">
            <TouchableOpacity
              className="mt-4 bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex-row items-center justify-between"
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center">
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-red-500 text-base font-bold">{t('security.delete_account')}</Text>
                  <Text className="text-text-secondary text-xs">{t('security.delete_account_desc')}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* INFO ALERT */}
          <View className="px-6 pt-6 pb-4">
            <View className="bg-primary/10 rounded-2xl p-4 flex-row">
              <Ionicons name="information-circle-outline" size={24} color="#6366F1" />
              <Text className="text-text-secondary text-sm ml-3 flex-1">
                We take your privacy seriously. Your data is encrypted and stored securely. You can
                manage your privacy settings at any time.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Change Password Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={passwordModalVisible}
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-background-secondary p-8 rounded-t-[40px] border-t border-white/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-text-primary text-2xl font-bold">{t('security.change_password')}</Text>
                <TouchableOpacity onPress={() => setPasswordModalVisible(false)} className="p-2">
                  <Ionicons name="close" size={28} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View className="bg-surface-light border border-white/5 rounded-2xl px-4 py-3 mb-6">
                <TextInput
                  placeholder="New Password"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="text-text-primary text-base"
                />
              </View>

              <TouchableOpacity
                className={`bg-primary p-5 rounded-2xl items-center ${isUpdatingPassword ? 'opacity-70' : ''}`}
                onPress={handleChangePassword}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}

export default PrivacyAndSecurityScreen;
