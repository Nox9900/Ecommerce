import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontScale = 0.9 | 1.0 | 1.15;

interface FontSizeContextType {
    fontScale: FontScale;
    setFontScale: (scale: FontScale) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const STORAGE_KEY = '@app_font_scale';

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontScale, setFontScaleValue] = useState<FontScale>(1.0);

    useEffect(() => {
        const loadFontScale = async () => {
            try {
                const savedScale = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedScale) {
                    setFontScaleValue(parseFloat(savedScale) as FontScale);
                }
            } catch (error) {
                console.error('Failed to load font scale:', error);
            }
        };
        loadFontScale();
    }, []);

    const setFontScale = async (scale: FontScale) => {
        try {
            setFontScaleValue(scale);
            await AsyncStorage.setItem(STORAGE_KEY, scale.toString());
        } catch (error) {
            console.error('Failed to save font scale:', error);
        }
    };

    return (
        <FontSizeContext.Provider value={{ fontScale, setFontScale }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (context === undefined) {
        throw new Error('useFontSize must be used within a FontSizeProvider');
    }
    return context;
};
