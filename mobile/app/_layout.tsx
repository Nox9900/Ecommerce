import "@/lib/i18n";
import { Stack } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import "../global.css";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { StripeProvider } from "@stripe/stripe-react-native";
import { SocketProvider } from "../context/SocketContext";
import { NotificationProvider } from "../context/NotificationContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "../context/ToastContext";
import { FontSizeProvider } from "../context/FontSizeContext";
import { ComparisonProvider } from "../context/ComparisonContext";


const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      console.error("React Query Error:", error, {
        queryKey: query.queryKey,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      console.error("React Query Mutation Error:", error);
    },
  }),
});

export default function RootLayout() {
  const { isLoaded } = useTheme();

  if (!isLoaded) {
    return null; // Or a splash screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        <QueryClientProvider client={queryClient}>
          <FontSizeProvider>
            <ToastProvider>
              <StripeProvider
                publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
                merchantIdentifier="merchant.com.yaamaan.ecommerce"
              >
                <SocketProvider>
                  <NotificationProvider>
                    <ComparisonProvider>
                      <Stack screenOptions={{ headerShown: false }} />
                    </ComparisonProvider>
                  </NotificationProvider>
                </SocketProvider>
              </StripeProvider>
            </ToastProvider>
          </FontSizeProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
