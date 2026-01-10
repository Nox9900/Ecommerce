import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/ui/Button";
import SafeScreen from "@/components/SafeScreen";
import { useTheme } from "@/lib/useTheme";

const { width } = Dimensions.get("window");

const HAS_SEEN_SPLASH = "has_seen_splash_v1";

export default function RootIndex() {
    const { isSignedIn, isLoaded } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();

    const [hasSeenSplash, setHasSeenSplash] = useState<boolean | null>(null);
    const [checkingSplash, setCheckingSplash] = useState(true);

    useEffect(() => {
        const checkSplash = async () => {
            try {
                const value = await AsyncStorage.getItem(HAS_SEEN_SPLASH);
                setHasSeenSplash(value === "true");
            } catch (e) {
                console.error("Error reading splash state", e);
            } finally {
                setCheckingSplash(false);
            }
        };
        checkSplash();
    }, []);

    if (!isLoaded || checkingSplash) {
        return null; // Or a simple loading spinner
    }

    // If already signed in, go straight to tabs
    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
    }

    // If not signed in and has seen splash, go to auth
    if (hasSeenSplash) {
        return <Redirect href="/(auth)/welcome" />;
    }

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem(HAS_SEEN_SPLASH, "true");
            router.replace("/(auth)/welcome");
        } catch (e) {
            console.error("Error saving splash state", e);
        }
    };

    return (
        <SafeScreen>
            <View className="flex-1 px-8 justify-between py-12 bg-background">
                <View className="items-center mt-10">
                    <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-6 shadow-xl">
                        <Text className="text-primary-foreground text-4xl font-bold">N</Text>
                    </View>
                    <Text className="text-4xl font-bold text-text-primary text-center mb-4">
                        Nox<Text className="text-text-tertiary">9900</Text>
                    </Text>
                    <Text className="text-text-secondary text-center text-lg px-4">
                        Discover the best products from verified vendors. Fast, secure, and premium.
                    </Text>
                </View>

                <View className="items-center">
                    <View className="w-full mb-8 overflow-hidden rounded-4xl border border-border">
                        <Image
                            source={require("../assets/images/auth-image.png")}
                            style={{ width: '100%', height: 300 }}
                            resizeMode="cover"
                        />
                    </View>

                    <View className="w-full gap-4">
                        <Button
                            title="Get Started"
                            onPress={handleGetStarted}
                            variant="primary"
                            className="py-5"
                            textClassName="text-lg font-bold"
                        />
                        <Text className="text-text-tertiary text-center text-sm">
                            Already have an account? <Text onPress={() => router.replace("/(auth)/welcome")} className="text-text-primary font-semibold">Sign In</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </SafeScreen>
    );
}
