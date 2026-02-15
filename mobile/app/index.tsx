import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/ui/Button";
import SafeScreen from "@/components/SafeScreen";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { AppText } from "@/components/ui/AppText";

const { width } = Dimensions.get("window");

const HAS_SEEN_SPLASH = "has_seen_splash_v1";

export default function RootIndex() {
    const { isSignedIn, isLoaded } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useTranslation();

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
                <View className="items-center mt-10 w-full flex-1 justify-center">
                    <Image
                        source={require("../assets/images/logo.png")}
                        style={{ width: '100%', height: 300 }}
                        resizeMode="contain"
                    />
                </View>

                <View className="items-center">


                    <View className="w-full gap-4">
                        <Button
                            title={t('splash.get_started')}
                            onPress={handleGetStarted}
                            variant="primary"
                            className="py-5"
                            textClassName="text-lg font-bold"
                        />
                        <AppText className="text-text-tertiary text-center text-sm">
                            {t('splash.already_have_account')} <AppText onPress={() => router.replace("/(auth)/welcome")} className="text-text-primary font-semibold">{t('splash.sign_in')}</AppText>
                        </AppText>
                    </View>
                </View>
            </View>
        </SafeScreen>
    );
}
