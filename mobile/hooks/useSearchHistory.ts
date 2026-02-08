import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
    const [history, setHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        try {
            const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const addToHistory = async (term: string) => {
        if (!term.trim()) return;

        try {
            const newHistory = [
                term,
                ...history.filter((item) => item.toLowerCase() !== term.toLowerCase()),
            ].slice(0, MAX_HISTORY_ITEMS);

            setHistory(newHistory);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to add to search history:', error);
        }
    };

    const removeFromHistory = async (term: string) => {
        try {
            const newHistory = history.filter((item) => item !== term);
            setHistory(newHistory);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error('Failed to remove from search history:', error);
        }
    };

    const clearHistory = async () => {
        try {
            setHistory([]);
            await AsyncStorage.removeItem(HISTORY_KEY);
        } catch (error) {
            console.error('Failed to clear search history:', error);
        }
    };

    return {
        history,
        isLoading,
        addToHistory,
        removeFromHistory,
        clearHistory,
    };
};
