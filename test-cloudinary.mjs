import { getOptimizedImage } from './mobile/lib/cloudinary.ts';

const testUrls = [
    'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    'https://res.cloudinary.com/demo/image/upload/v123456789/sample.jpg',
    'https://example.com/image.jpg'
];

console.log('Testing Cloudinary Optimization:\n');

testUrls.forEach(url => {
    console.log(`Original: ${url}`);
    console.log(`Optimized (default): ${getOptimizedImage(url)}`);
    console.log(`Optimized (w: 200, h: 200): ${getOptimizedImage(url, { width: 200, height: 200 })}`);
    console.log('---');
});
