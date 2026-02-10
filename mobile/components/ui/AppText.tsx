import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useFontSize } from '../../context/FontSizeContext';

interface AppTextProps extends TextProps {
    className?: string; // For NativeWind
    allowFontScaling?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
    children,
    style,
    className,
    allowFontScaling = true,
    ...props
}) => {
    const { fontScale } = useFontSize();

    // Calculate relative font size based on weight if needed, 
    // but usually Text in RN handles this if we pass a base size.
    // NativeWind applies sizes via classes, so we might need to 
    // inject a style override for the scaling factor.

    const flattenedStyle = StyleSheet.flatten(style);
    const baseFontSize = (flattenedStyle as any)?.fontSize || 15;

    const scaledStyle = allowFontScaling ? {
        fontSize: baseFontSize * fontScale,
    } : {};

    return (
        <Text
            style={[style, scaledStyle]}
            className={className}
            {...props}
        >
            {children}
        </Text>
    );
};
