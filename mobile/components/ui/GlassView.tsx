import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/lib/useTheme';

interface GlassViewProps {
    children?: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    className?: string;
}

export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = 50,
    tint,
    className
}) => {
    const { theme } = useTheme();

    // Default tint based on theme if not provided
    const resolvedTint = tint || (theme === 'dark' ? 'dark' : 'light');

    if (Platform.OS === 'web') {
        // Simple fallback for web if backdrop-filter isn't perfect
        return (
            <View
                className={className}
                style={[
                    {
                        backgroundColor: theme === 'dark' ? 'rgba(24, 24, 27, 0.7)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                    },
                    style
                ]}
            >
                {children}
            </View>
        );
    }

    return (
        <View
            className={className}
            style={[
                {
                    overflow: 'hidden',
                    backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.4)'
                },
                style
            ]}
        >
            <BlurView
                intensity={intensity}
                tint={resolvedTint as any}
                style={style}
            >
                {children}
            </BlurView>
        </View>
    );
};
