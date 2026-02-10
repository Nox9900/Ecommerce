import React from 'react';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    ZoomIn,
    Layout
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

type AnimationType = 'fade' | 'fadeDown' | 'fadeUp' | 'scale';

interface AnimatedContainerProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    style?: ViewStyle | ViewStyle[];
    className?: string;
    entering?: any;
    exiting?: any;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
    children,
    animation = 'fadeDown',
    delay = 0,
    duration = 500,
    style,
    className,
    entering,
    exiting
}) => {
    let defaultEntering;

    switch (animation) {
        case 'fade':
            defaultEntering = FadeIn.duration(duration).delay(delay);
            break;
        case 'fadeDown':
            defaultEntering = FadeInDown.duration(duration).delay(delay).springify();
            break;
        case 'fadeUp':
            defaultEntering = FadeInUp.duration(duration).delay(delay).springify();
            break;
        case 'scale':
            defaultEntering = ZoomIn.duration(duration).delay(delay).springify();
            break;
        default:
            defaultEntering = FadeInDown.duration(duration).delay(delay);
    }

    return (
        <Animated.View
            entering={entering || defaultEntering}
            exiting={exiting}
            style={style}
            className={className}
        >
            {children}
        </Animated.View>
    );
};
