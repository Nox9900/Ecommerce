import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '@/types';

interface ComparisonContextType {
    comparisonList: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearComparison: () => void;
    isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [comparisonList, setComparisonList] = useState<Product[]>([]);

    const addToCompare = useCallback((product: Product) => {
        setComparisonList((prev) => {
            // Check if already in list
            if (prev.find((p) => p._id === product._id)) return prev;
            // Limit to 3 products
            if (prev.length >= 3) {
                // Option: could replace the last one or just ignore
                return prev;
            }
            return [...prev, product];
        });
    }, []);

    const removeFromCompare = useCallback((productId: string) => {
        setComparisonList((prev) => prev.filter((p) => p._id !== productId));
    }, []);

    const clearComparison = useCallback(() => {
        setComparisonList([]);
    }, []);

    const isInComparison = useCallback((productId: string) => {
        return comparisonList.some((p) => p._id === productId);
    }, [comparisonList]);

    return (
        <ComparisonContext.Provider
            value={{
                comparisonList,
                addToCompare,
                removeFromCompare,
                clearComparison,
                isInComparison,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
