import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";

const ForgotPassword = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const { theme } = useTheme();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [loading, setLoading] = useState(false);

    // Request a password reset code
    const onRequestResetCode = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: emailAddress,
            });
            setSuccessfulCreation(true);
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err.errors?.[0]?.message || "Failed to send reset code");
        } finally {
            setLoading(false);
        }
    };

    // Reset the password using the code
    const onResetPasswordPress = async () => {
        if (!isLoaded) return;

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.replace("/(tabs)");
            } else {
                console.log(result);
            }
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err.errors?.[0]?.message || "Failed to reset password");
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
                        onPress={() => successfulCreation ? setSuccessfulCreation(false) : router.back()}
                        className="mb-8"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-text-primary mb-2">
                        {successfulCreation ? "Reset Password" : "Forgot Password?"}
                    </Text>
                    <Text className="text-text-secondary mb-10">
                        {successfulCreation
                            ? `Enter the code sent to ${emailAddress} and your new password`
                            : "Don't worry, it happens. Enter your email to receive a reset code."}
                    </Text>

                    <View className="gap-4">
                        {!successfulCreation ? (
                            <>
                                <Input
                                    label="Email Address"
                                    placeholder="name@example.com"
                                    value={emailAddress}
                                    onChangeText={setEmailAddress}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />

                                <Button
                                    title="Send Reset Code"
                                    onPress={onRequestResetCode}
                                    loading={loading}
                                    variant="primary"
                                    className="mt-6"
                                />
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Reset Code"
                                    placeholder="123456"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />

                                <Input
                                    label="New Password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />

                                <Input
                                    label="Confirm New Password"
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />

                                <Button
                                    title="Reset Password"
                                    onPress={onResetPasswordPress}
                                    loading={loading}
                                    variant="primary"
                                    className="mt-6"
                                />
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ForgotPassword;
