import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Modal,
    TouchableWithoutFeedback,
    TouchableOpacity,
} from "react-native";
import { AppText } from "./ui/AppText";
import { useTheme } from "@/lib/useTheme";

interface PhotoUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onChooseFromLibrary: () => void;
}

const PhotoUploadModal = ({
    visible,
    onClose,
    onTakePhoto,
    onChooseFromLibrary,
}: PhotoUploadModalProps) => {
    const { theme } = useTheme();

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
                                    <Ionicons name="camera" size={32} color="#6366F1" />
                                </View>
                                <AppText className="text-text-primary text-2xl font-bold mb-1">
                                    Change Profile Photo
                                </AppText>
                                <AppText className="text-text-secondary text-center text-sm">
                                    Choose a photo source
                                </AppText>
                            </View>

                            {/* Action Buttons */}
                            <View className="gap-3">
                                {/* Take Photo Button */}
                                <TouchableOpacity
                                    className="bg-primary/10 border border-primary/20 rounded-2xl py-4 flex-row items-center justify-center"
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onClose();
                                        onTakePhoto();
                                    }}
                                >
                                    <Ionicons name="camera-outline" size={24} color="#6366F1" style={{ marginRight: 12 }} />
                                    <AppText className="text-primary font-bold text-base">Take Photo</AppText>
                                </TouchableOpacity>

                                {/* Choose from Library Button */}
                                <TouchableOpacity
                                    className="bg-primary/10 border border-primary/20 rounded-2xl py-4 flex-row items-center justify-center"
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onClose();
                                        onChooseFromLibrary();
                                    }}
                                >
                                    <Ionicons name="images-outline" size={24} color="#6366F1" style={{ marginRight: 12 }} />
                                    <AppText className="text-primary font-bold text-base">Choose from Library</AppText>
                                </TouchableOpacity>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    className="bg-surface-lighter rounded-2xl py-4 items-center border border-background-lighter"
                                    activeOpacity={0.7}
                                    onPress={onClose}
                                >
                                    <AppText className="text-text-secondary font-bold text-base">Cancel</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default PhotoUploadModal;
