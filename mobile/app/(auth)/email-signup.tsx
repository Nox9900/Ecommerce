import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";

const EmailSignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const { theme } = useTheme();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    // Start the sign up process
    const onSignUpPress = async () => {
        if (!isLoaded) return;

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress,
                password,
            });

            // Send the email verification code
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            setPendingVerification(true);
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err.errors?.[0]?.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    // Verify the email address
    const onPressVerify = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace("/(tabs)");
            } else {
                console.log(completeSignUp);
                Alert.alert("Error", "Account creation failed. Please try again.");
            }
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err.errors?.[0]?.message || "Invalid code");
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
                        onPress={() => pendingVerification ? setPendingVerification(false) : router.back()}
                        className="mb-8"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-text-primary mb-2">
                        {pendingVerification ? "Verify Email" : "Create Account"}
                    </Text>
                    <Text className="text-text-secondary mb-10">
                        {pendingVerification
                            ? `Enter the verification code sent to ${emailAddress}`
                            : "Sign up to start shopping"}
                    </Text>

                    <View className="gap-4">
                        {!pendingVerification ? (
                            <>
                                <View className="flex-row gap-4">
                                    <Input
                                        label="First Name"
                                        placeholder="John"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        containerClassName="flex-1"
                                    />
                                    <Input
                                        label="Last Name"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChangeText={setLastName}
                                        containerClassName="flex-1"
                                    />
                                </View>

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
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />

                                <Input
                                    label="Confirm Password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />

                                <Button
                                    title="Create Account"
                                    onPress={onSignUpPress}
                                    loading={loading}
                                    variant="primary"
                                    className="mt-6"
                                />

                                <View className="flex-row items-center justify-center mt-8">
                                    <Text className="text-text-secondary">Already have an account? </Text>
                                    <TouchableOpacity onPress={() => router.push("/(auth)/email-signin")}>
                                        <Text className="text-text-primary font-bold">Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Input
                                    label="Verification Code"
                                    placeholder="123456"
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <Button
                                    title="Verify & Finish"
                                    onPress={onPressVerify}
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

export default EmailSignUp;
