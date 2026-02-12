import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/context/NotificationContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { unreadCount: unreadNotifications } = useNotifications();
  const { count: unreadMessages } = useUnreadMessages();

  if (!isLoaded) return null; // for a better ux
  if (!isSignedIn) return <Redirect href={"/(auth)/welcome"} />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme === "dark" ? "#FFFFFF" : "#000000",
        tabBarInactiveTintColor: theme === "dark" ? "#A1A1AA" : "#52525B",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: theme === "dark" ? "rgba(0, 0, 0)" : "rgba(255,255,255)",
          borderTopWidth: 0,
          height: 62 + insets.bottom,
          paddingTop: 4,
          overflow: "hidden",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={theme === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 600,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ width: size, height: size }}>
              <Ionicons name="chatbubbles" size={size} color={color} />
              {unreadMessages > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#EF4444',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    borderWidth: 2,
                    borderColor: theme === 'dark' ? '#000' : '#fff',
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 9,
                      fontWeight: '800',
                      lineHeight: 12,
                    }}
                  >
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
