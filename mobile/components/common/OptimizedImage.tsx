import React from 'react';
import { Image, ImageProps } from 'expo-image';
import { getOptimizedImage, OptimizationOptions } from '@/lib/cloudinary';
import { cssInterop } from 'nativewind';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
    source: string | any;
    width?: number;
    height?: number;
    quality?: string | number;
    crop?: string;
    placeholder?: ImageProps['placeholder'];
}

/**
 * Register expo-image with NativeWind to support className
 */
cssInterop(Image, {
    className: {
        target: 'style',
    },
});

/**
 * A wrapper around expo-image that automatically optimizes Cloudinary URLs.
 */
export const OptimizedImage = ({
    source,
    width,
    height,
    quality,
    crop,
    placeholder,
    ...rest
}: OptimizedImageProps) => {
    // Calculate optimized URL if source is a string
    const optimizedUrl = typeof source === 'string'
        ? getOptimizedImage(source, { width, height, quality, crop })
        : null;

    // Use { uri: ... } for string URLs, otherwise pass the source as is
    const finalSource = optimizedUrl
        ? { uri: optimizedUrl }
        : (typeof source === 'string' ? { uri: source } : source);

    return (
        <Image
            source={finalSource}
            placeholder={placeholder}
            transition={200}
            contentFit={rest.contentFit || 'cover'}
            {...rest}
        />
    );
};
