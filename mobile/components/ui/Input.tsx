import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export const Input = ({
    label,
    error,
    containerClassName,
    className,
    ...props
}: InputProps) => {
    return (
        <View className={`w-full ${containerClassName}`}>
            {label && <Text className="text-text-tertiary mb-2 ml-1 text-sm font-medium">{label}</Text>}
            <TextInput
                className={`w-full bg-surface-light text-text-primary p-4 rounded-2xl border border-transparent focus:border-primary placeholder:text-text-tertiary ${error ? 'border-red-500' : ''} ${className}`}
                placeholderTextColor="#64748B"
                {...props}
            />
            {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
        </View>
    );
};
