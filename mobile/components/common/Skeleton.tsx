import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withTiming,
    useSharedValue
} from 'react-native-reanimated';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.7, { duration: 1000 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: '#E1E9EE', // Light gray for skeleton
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

export const ProductCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <Skeleton width="100%" height={150} borderRadius={12} />
            <View style={{ marginTop: 12, gap: 8 }}>
                <Skeleton width="80%" height={20} />
                <Skeleton width="40%" height={16} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Skeleton width="30%" height={24} />
                    <Skeleton width="20%" height={24} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        width: '100%',
    }
});
