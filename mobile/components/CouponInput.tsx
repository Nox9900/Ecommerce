import React, { useState } from "react";
import {
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppText } from "./ui/AppText";
import { useTheme } from "@/lib/useTheme";

interface CouponInputProps {
    onApply: (code: string) => Promise<any>;
    onRemove: () => Promise<any>;
    isApplying: boolean;
    isRemoving: boolean;
    appliedCouponCode?: string | null;
}

const CouponInput = ({
    onApply,
    onRemove,
    isApplying,
    isRemoving,
    appliedCouponCode,
}: CouponInputProps) => {
    const [code, setCode] = useState("");
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);

    const handleApply = async () => {
        if (!code.trim()) return;
        setError(null);
        try {
            await onApply(code);
            setCode(""); // Clear input on success
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to apply coupon");
        }
    };

    const handleRemove = async () => {
        try {
            await onRemove();
        } catch (err: any) {
            // handle error
        }
    };

    if (appliedCouponCode) {
        return (
            <View className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                    <View className="bg-green-500 rounded-full p-1">
                        <Ionicons name="pricetag" size={16} color="white" />
                    </View>
                    <View>
                        <AppText className="text-text-primary font-bold text-base">
                            {appliedCouponCode}
                        </AppText>
                        <AppText className="text-green-500 text-xs font-medium">
                            {t("cart.coupon_applied", "Coupon applied")}
                        </AppText>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleRemove}
                    disabled={isRemoving}
                    className="bg-background-lighter p-2 rounded-xl"
                >
                    {isRemoving ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    const { theme } = useTheme();

    return (
        <View className="bg-surface p-4 rounded-3xl border border-white/5 space-y-2">
            <AppText className="text-text-primary font-bold text-lg">
                {t("cart.have_coupon", "Have a coupon?")}
            </AppText>
            <View className="flex-row gap-3">
                <TextInput
                    className="flex-1 bg-background-lighter h-12 rounded-xl px-4 text-text-primary font-medium border border-white/5"
                    placeholder={t("cart.enter_code", "Enter code")}
                    placeholderTextColor="#6B7280"
                    value={code}
                    onChangeText={(text) => {
                        setCode(text);
                        if (error) setError(null);
                    }}
                    autoCapitalize="characters"
                />
                <TouchableOpacity
                    className={`h-12 px-6 rounded-xl items-center justify-center ${!code.trim() || isApplying ? "bg-primary/50" : "bg-primary"
                        }`}
                    onPress={handleApply}
                    disabled={!code.trim() || isApplying}
                >
                    {isApplying ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <AppText className="font-bold" style={{ color: theme === 'dark' ? '#FAFAFA' : '#262626' }}>
                            {t("common.apply", "Apply")}
                        </AppText>
                    )}
                </TouchableOpacity>
            </View>
            {error && (
                <AppText className="text-red-500 text-sm ml-1 font-medium">{error}</AppText>
            )}
        </View>
    );
};

export default CouponInput;
