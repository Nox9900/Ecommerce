/**
 * Utility for Cloudinary image optimization
 */

export interface OptimizationOptions {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
}

/**
 * Transforms a Cloudinary URL to include optimization parameters.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 * 
 * @param url The original image URL
 * @param options Optimization options (width, height, quality, format, crop)
 * @returns Optimized URL
 */
export const getOptimizedImage = (url: string, options: OptimizationOptions = {}) => {
    if (!url) return url;

    // Only handle Cloudinary URLs
    if (!url.includes('cloudinary.com')) {
        return url;
    }

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill'
    } = options;

    // Cloudinary URL structure: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/<version>/<public_id>
    // We want to insert transformations after '/upload/'

    const uploadPart = '/upload/';
    if (!url.includes(uploadPart)) {
        return url;
    }

    const parts = url.split(uploadPart);

    const transformations = [];

    // Format and Quality (f_auto, q_auto)
    transformations.push(`f_${format}`);
    transformations.push(`q_${quality}`);

    // Dimensions
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);

    // Crop only if dimensions are provided
    if (width || height) {
        transformations.push(`c_${crop}`);
    }

    const transformationString = transformations.join(',');

    return `${parts[0]}${uploadPart}${transformationString}/${parts[1]}`;
};
