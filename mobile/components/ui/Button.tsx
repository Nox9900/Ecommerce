import React from "react";
import { Text, Pressable, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
// import { cn } from "../../lib/utils"; // Assuming you have a utils file for merging class names (clsx/tailwind-merge) -- if not I'll handle it nicely
import * as Haptics from "expo-haptics";
import { AppText } from "./AppText";

interface ButtonProps {
    onPress?: () => void;
    title: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    icon?: React.ReactNode;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: "button" | "link" | "none";
}

export const Button = ({
    onPress,
    title,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className,
    textClassName,
    icon,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole = "button",
}: ButtonProps) => {
    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const variants = {
        primary: "bg-primary active:bg-primary-dark border-transparent",
        secondary: "bg-secondary active:bg-secondary-dark border-transparent",
        outline: "bg-transparent border border-gray-400 active:bg-gray-800",
        ghost: "bg-transparent active:bg-gray-800 border-transparent",
    };

    const sizes = {
        sm: "py-2 px-4",
        md: "py-3.5 px-6",
        lg: "py-4 px-8",
    };

    const textVariants = {
        primary: "text-primary-foreground font-bold",
        secondary: "text-primary-foreground font-bold",
        outline: "text-text-primary font-medium",
        ghost: "text-primary font-medium",
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled || loading}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityHint={accessibilityHint}
            accessibilityRole={accessibilityRole}
            accessibilityState={{ disabled: disabled || loading }}
            className={
                `rounded-full flex-row items-center justify-center border ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50" : ""} ${className || ""}`
            }
        >
            {loading ? (
                <ActivityIndicator color={variant === "outline" || variant === "ghost" ? "#6366F1" : "white"} />
            ) : (
                <>
                    {icon && <React.Fragment>{icon}</React.Fragment>}
                    <AppText className={`${textVariants[variant]} ${size === 'lg' ? 'text-lg' : 'text-base'} text-center ${icon ? 'ml-2' : ''} ${textClassName || ""}`}>
                        {title}
                    </AppText>
                </>
            )}
        </Pressable>
    );
};
