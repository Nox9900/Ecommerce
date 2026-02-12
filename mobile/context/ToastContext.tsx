import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    withSequence,
    withDelay,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const translateY = useSharedValue(-100);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    const showToast = useCallback(({ message, type = 'success', duration = 3000 }: ToastOptions) => {
        setToast({ message, type });

        translateY.value = withSequence(
            withTiming(50, { duration: 500 }),
            withDelay(
                duration,
                withTiming(-100, { duration: 500 }, (finished) => {
                    if (finished) {
                        runOnJS(hideToast)();
                    }
                })
            )
        );
    }, [hideToast]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'info': return 'information-circle';
        }
    };

    const getBgColor = (type: ToastType) => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'info': return '#3B82F6';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View style={[styles.toastContainer, { backgroundColor: getBgColor(toast.type) }, animatedStyle]}>
                    <Ionicons name={getIcon(toast.type)} size={24} color="white" />
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 9999,
    },
    toastText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
});
