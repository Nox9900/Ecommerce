import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface VariantSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    product: any;
    initialSelectedOptions: Record<string, string>;
    onConfirm: (selectedOptions: Record<string, string>, quantity: number) => void;
    confirmTitle?: string;
}

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
    visible,
    onClose,
    product,
    initialSelectedOptions,
    onConfirm,
    confirmTitle = "Buy Now",
}) => {
    const { theme } = useTheme();
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(initialSelectedOptions || {});
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (visible) {
            setSelectedOptions(initialSelectedOptions || {});
            setQuantity(1);
        }
    }, [visible, initialSelectedOptions]);

    // Determine current variant based on selection
    const selectedVariant = useMemo(() => {
        if (!product || !product.variants) return null;

        // Check if all options are selected
        const attributeNames = (product.attributes || []).map((a: any) => a.name);

        // Try to find a variant that matches ALL selected options
        // Even if not all attributes are selected yet, we can try to find a partial match or just wait
        // But for price display, we usually need a specific variant or default to product price

        return product.variants.find((variant: any) => {
            return attributeNames.every((name: string) =>
                !selectedOptions[name] || variant.options[name] === selectedOptions[name]
            );
        });

        // Exact match approach (safer for add to cart)
        // return product.variants.find(variant => 
        //   attributeNames.every(name => variant.options[name] === selectedOptions[name])
        // );
    }, [product, selectedOptions]);

    // Precise match for "fully selected" status
    const exactVariant = useMemo(() => {
        if (!product || !product.variants) return null;
        const attributeNames = (product.attributes || []).map((a: any) => a.name);
        // Must match ALL attributes
        const allSelected = attributeNames.every((name: string) => selectedOptions[name]);
        if (!allSelected) return null;

        return product.variants.find((variant: any) =>
            attributeNames.every((name: string) => variant.options[name] === selectedOptions[name])
        );
    }, [product, selectedOptions]);


    const currentPrice = exactVariant ? exactVariant.price : (selectedVariant ? selectedVariant.price : product?.price ?? 0);
    const currentImage = exactVariant?.image || (selectedVariant?.image) || (product?.images && product.images.length > 0 ? product.images[0] : null);
    const currentStock = exactVariant ? exactVariant.stock : (product?.stock ?? 0);
    // If no exact variant is found but attributes are selected, it might mean invalid combination or just incomplete.
    // We'll treat "incomplete" as "check stock of product" effectively, but really we should block if incomplete.

    const isCompleteSelection = (product?.attributes || []).every((attr: any) => selectedOptions[attr.name]);
    const isValidVariant = !!exactVariant;
    const canBuy = isCompleteSelection && isValidVariant && currentStock > 0;

    const handleOptionSelect = (attributeName: string, value: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attributeName]: value
        }));
    };

    const handleConfirm = () => {
        if (canBuy) {
            onConfirm(selectedOptions, quantity);
        }
    };

    if (!product) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <TouchableOpacity
                    className="absolute inset-0"
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View className={`rounded-t-3xl overflow-hidden ${theme === 'dark' ? 'bg-[#18181B]' : 'bg-white'}`} style={{ maxHeight: height * 0.85 }}>

                    {/* Header / Product Info */}
                    <View className={`flex-row p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
                        <View className={`w-24 h-24 rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
                            <OptimizedImage
                                source={currentImage}
                                width={200}
                                height={200}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                        </View>

                        <View className="flex-1 ml-4 justify-end pb-1">
                            <View className="flex-row items-baseline gap-1 mb-1">
                                <Text className="text-primary text-2xl font-black">
                                    <Text className="text-lg font-bold">$</Text>
                                    {currentPrice.toFixed(2)}
                                </Text>
                            </View>
                            <Text className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Stock: {isValidVariant ? currentStock : '--'}
                            </Text>

                            {/* Selected Options Summary */}
                            <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`} numberOfLines={1}>
                                {isCompleteSelection
                                    ? Object.values(selectedOptions).join(' · ')
                                    : 'Please select options'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            className="p-1 -mt-2 -mr-2"
                        >
                            <Ionicons name="close-circle" size={28} color={theme === 'dark' ? '#52525B' : '#A1A1AA'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                        {/* Attributes */}
                        {(product.attributes || []).map((attr: any) => (
                            <View key={attr.name} className="mb-6">
                                <Text className={`text-sm font-bold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {attr.name}
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {attr.values.map((value: string) => {
                                        const isSelected = selectedOptions[attr.name] === value;
                                        return (
                                            <TouchableOpacity
                                                key={value}
                                                onPress={() => handleOptionSelect(attr.name, value)}
                                                activeOpacity={0.7}
                                            >
                                                <LinearGradient
                                                    colors={isSelected ? ['#6366F1', '#8B5CF6'] : [theme === 'dark' ? '#27272A' : '#F4F4F5', theme === 'dark' ? '#27272A' : '#F4F4F5']}
                                                    className={`px-4 py-2 rounded-lg border ${isSelected
                                                        ? "border-transparent"
                                                        : theme === 'dark' ? "border-white/5" : "border-black/5"
                                                        }`}
                                                >
                                                    <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}`}>
                                                        {value}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}

                        {/* Quantity */}
                        <View className="mb-8 flex-row items-center justify-between">
                            <Text className={`text-sm font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Quantity
                            </Text>

                            <View className={`flex-row items-center rounded-lg border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
                                <TouchableOpacity
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 border-r border-gray-500/10"
                                >
                                    <Ionicons name="remove" size={20} color={theme === 'dark' ? "#fff" : "#000"} />
                                </TouchableOpacity>
                                <Text className={`w-12 text-center font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                    {quantity}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        // Limit by stock if known
                                        const limit = isValidVariant ? currentStock : 99;
                                        setQuantity(Math.min(limit, quantity + 1));
                                    }}
                                    className="p-2 border-l border-gray-500/10"
                                >
                                    <Ionicons name="add" size={20} color={theme === 'dark' ? "#fff" : "#000"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer / Buy Button */}
                    <View className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/5'} pb-8`}>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={!canBuy}
                            className={`w-full py-4 rounded-2xl items-center justify-center ${canBuy ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <Text className={`text-base font-bold ${canBuy ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {canBuy ? `${confirmTitle} - $${(currentPrice * quantity).toFixed(2)}` : (!isCompleteSelection ? 'Select Options' : 'Out of Stock')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default VariantSelectionModal;
