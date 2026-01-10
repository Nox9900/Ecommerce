import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";

const PhoneSignIn = () => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
    const { theme } = useTheme();

    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [loading, setLoading] = useState(false);

    // Send the verification code to the user
    const onSendCodePress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const { supportedFirstFactors } = await signIn.create({
                identifier: phoneNumber,
            });

            if (!supportedFirstFactors) {
                throw new Error("Phone sign-in is not supported for this identifier.");
            }

            // Find the phone_code factor
            const isPhoneCodeFactor = (factor: any) => factor.strategy === "phone_code";
            const phoneCodeFactor = supportedFirstFactors.find(isPhoneCodeFactor);

            if (phoneCodeFactor) {
                await signIn.prepareFirstFactor({
                    strategy: "phone_code",
                    phoneNumberId: (phoneCodeFactor as any).phoneNumberId,
                });
                setVerifying(true);
            }
        } catch (err: any) {
            console.log(err);
            Alert.alert("Error", err.errors?.[0]?.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    // Verify the code
    const onVerifyCodePress = async () => {
        if (!isLoaded) return;
        setLoading(true);

        try {
            const completeSignIn = await signIn.attemptFirstFactor({
                strategy: "phone_code",
                code,
            });

            if (completeSignIn.status === "complete") {
                await setActive({ session: completeSignIn.createdSessionId });
                router.replace("/(tabs)");
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
                        onPress={() => verifying ? setVerifying(false) : router.back()}
                        className="mb-8"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? "white" : "black"} />
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-text-primary mb-2">
                        {verifying ? "Verify Code" : "Phone Sign In"}
                    </Text>
                    <Text className="text-text-secondary mb-10">
                        {verifying
                            ? `Enter the 6-digit code sent to ${phoneNumber}`
                            : "Enter your phone number to continue"}
                    </Text>

                    <View className="gap-4">
                        {!verifying ? (
                            <>
                                <Input
                                    label="Phone Number"
                                    placeholder="+1 (555) 000-0000"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                                <Button
                                    title="Send Verification Code"
                                    onPress={onSendCodePress}
                                    loading={loading}
                                    variant="primary"
                                    className="mt-6"
                                />
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
                                    title="Verify & Sign In"
                                    onPress={onVerifyCodePress}
                                    loading={loading}
                                    variant="primary"
                                    className="mt-6"
                                />
                                <TouchableOpacity
                                    onPress={onSendCodePress}
                                    className="mt-4 items-center"
                                >
                                    <Text className="text-text-secondary">Didn't receive a code? <Text className="text-text-primary font-bold">Resend</Text></Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {!verifying && (
                            <View className="flex-row items-center justify-center mt-8">
                                <Text className="text-text-secondary">Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push("/(auth)/phone-signup")}>
                                    <Text className="text-text-primary font-bold">Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PhoneSignIn;
