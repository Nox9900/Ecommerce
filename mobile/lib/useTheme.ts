import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const useTheme = () => {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('theme');
                if (savedTheme === 'dark' || savedTheme === 'light') {
                    setColorScheme(savedTheme);
                } else {
                    // Default to light as per requirements
                    setColorScheme('light');
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
                setColorScheme('light');
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        console.log('[useTheme] Current theme:', colorScheme);
        const newTheme = colorScheme === 'light' ? 'dark' : 'light';
        console.log('[useTheme] Toggling to:', newTheme);
        setColorScheme(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme);
            console.log('[useTheme] Theme saved to storage');
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    return {
        theme: colorScheme,
        toggleTheme,
        isLoaded,
    };
};
