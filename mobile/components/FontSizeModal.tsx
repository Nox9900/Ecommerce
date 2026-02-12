import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
} from "react-native";
import { AppText } from "./ui/AppText";

interface FontSizeModalProps {
    visible: boolean;
    onClose: () => void;
    currentScale: number;
    onSelectSize: (scale: 0.9 | 1.0 | 1.15) => void;
}

const FontSizeModal = ({
    visible,
    onClose,
    currentScale,
    onSelectSize,
}: FontSizeModalProps) => {
    const fontSizes: { label: string; value: 0.9 | 1.0 | 1.15; description: string }[] = [
        { label: "Small", value: 0.9, description: "Compact and efficient" },
        { label: "Medium", value: 1.0, description: "Default size" },
        { label: "Large", value: 1.15, description: "Easier to read" },
    ];

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            {/* Backdrop layer */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/70 items-center justify-center px-4">
                    <TouchableWithoutFeedback>
                        <View className="bg-surface rounded-3xl p-6 w-full max-w-md">
                            {/* Header */}
                            <View className="items-center mb-6">
                                <View className="bg-primary/20 rounded-full w-16 h-16 items-center justify-center mb-3">
                                    <Ionicons name="text-outline" size={32} color="#6366F1" />
                                </View>
                                <AppText className="text-text-primary text-2xl font-bold mb-1">
                                    Font Size
                                </AppText>
                                <AppText className="text-text-secondary text-center text-sm">
                                    Choose your preferred text size
                                </AppText>
                            </View>

                            {/* Font Size Options */}
                            <View className="gap-3 mb-4">
                                {fontSizes.map((size) => {
                                    const isSelected = currentScale === size.value;
                                    return (
                                        <TouchableOpacity
                                            key={size.value}
                                            className={`rounded-2xl py-4 px-5 flex-row items-center justify-between ${isSelected
                                                    ? "bg-primary/20 border-2 border-primary"
                                                    : "bg-background-lighter border border-background-lighter"
                                                }`}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                onSelectSize(size.value);
                                                onClose();
                                            }}
                                        >
                                            <View className="flex-1">
                                                <AppText
                                                    className={`font-bold text-base mb-0.5 ${isSelected ? "text-primary" : "text-text-primary"
                                                        }`}
                                                >
                                                    {size.label}
                                                </AppText>
                                                <AppText className="text-text-secondary text-xs">
                                                    {size.description}
                                                </AppText>
                                            </View>
                                            {isSelected && (
                                                <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
                                                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                className="bg-surface-lighter rounded-2xl py-4 items-center border border-background-lighter"
                                activeOpacity={0.7}
                                onPress={onClose}
                            >
                                <AppText className="text-text-secondary font-bold text-base">Cancel</AppText>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default FontSizeModal;
