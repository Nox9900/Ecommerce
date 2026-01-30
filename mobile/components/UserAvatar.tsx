import { Image } from "expo-image";
import React, { useState } from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/lib/useTheme";

interface UserAvatarProps extends ViewProps {
    source?: string | null;
    name?: string;
    size?: number;
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ source, name, size = 48, className, style, ...props }) => {
    const { theme } = useTheme();
    const [imageError, setImageError] = useState(false);

    // Use default avatar if source is missing or empty or error
    const showDefault = !source || imageError;
    const imageSource = showDefault
        ? require("@/assets/images/default-avatar.png")
        : { uri: source };

    return (
        <View
            className={`rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 items-center justify-center border border-black/5 dark:border-white/10 ${className || ''}`}
            style={[{ width: size, height: size }, style]}
            {...props}
        >
            <Image
                source={imageSource}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                onError={() => setImageError(true)}
            />
        </View>
    );
};
