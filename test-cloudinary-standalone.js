const getOptimizedImage = (url, options = {}) => {
    if (!url) return url;
    if (!url.includes('cloudinary.com')) return url;

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill'
    } = options;

    const uploadPart = '/upload/';
    if (!url.includes(uploadPart)) return url;

    const parts = url.split(uploadPart);
    const transformations = [];
    transformations.push(`f_${format}`);
    transformations.push(`q_${quality}`);

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width || height) transformations.push(`c_${crop}`);

    const transformationString = transformations.join(',');
    return `${parts[0]}${uploadPart}${transformationString}/${parts[1]}`;
};

const testUrls = [
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/v123456789/sample.jpg',
    'https://example.com/image.jpg'
];

testUrls.forEach(url => {
    console.log(`Original: ${url}`);
    console.log(`Optimized (default): ${getOptimizedImage(url)}`);
    console.log(`Optimized (w: 200, h: 200): ${getOptimizedImage(url, { width: 200, height: 200 })}`);
    console.log('---');
});
