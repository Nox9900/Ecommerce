import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";

const EmailSignIn = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const { theme } = useTheme();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const result = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.replace("/(tabs)");
            } else {
                console.log(result);
                Alert.alert("Error", "Check your credentials and try again.");
            }
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err.errors?.[0]?.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="px-8 pt-20 pb-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mb-8"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-text-primary mb-2">Welcome Back</Text>
                    <Text className="text-text-secondary mb-10">Sign in to continue shopping</Text>

                    <View className="gap-4">
                        <Input
                            label="Email Address"
                            placeholder="name@example.com"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Input
                            label="Password"
                            placeholder="Your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            className="self-end"
                            onPress={() => router.push("/(auth)/forgot-password" as any)}
                        >
                            <Text className="text-text-tertiary text-sm">Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={onSignInPress}
                            loading={loading}
                            variant="primary"
                            className="mt-6"
                        />

                        <View className="flex-row items-center justify-center mt-8">
                            <Text className="text-text-secondary">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/email-signup")}>
                                <Text className="text-text-primary font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EmailSignIn;
