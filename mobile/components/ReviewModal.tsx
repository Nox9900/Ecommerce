import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useReviews } from "@/hooks/useReviews";

interface ReviewModalProps {
    isVisible: boolean;
    onClose: () => void;
    productId: string;
    orderId: string;
    productName: string;
}

const ReviewModal = ({
    isVisible,
    onClose,
    productId,
    orderId,
    productName,
}: ReviewModalProps) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const { createReviewAsync, isCreatingReview } = useReviews();

    const handleSubmit = async () => {
        try {
            await createReviewAsync({
                productId,
                orderId,
                rating,
                comment,
            });
            onClose();
        } catch (error) {
            console.error("Failed to submit review:", error);
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-end bg-black/60"
            >
                <View className="bg-background rounded-t-3xl px-6 pt-6 pb-10">
                    <View className="flex-row items-center justify-between mb-8">
                        <Text className="text-text-primary text-xl font-bold">Write Review</Text>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Ionicons name="close" size={24} color="var(--color-text-primary)" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="items-center mb-8">
                            <Text className="text-text-secondary text-center mb-4 text-base">
                                How would you rate {productName}?
                            </Text>
                            <View className="flex-row gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={40}
                                            color="var(--color-accent-warning)"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="mb-8">
                            <Text className="text-text-primary font-bold mb-3 text-base">Your Review</Text>
                            <TextInput
                                className="bg-surface-light border border-white/5 rounded-2xl p-4 text-text-primary min-h-[120px] text-base"
                                placeholder="Tell us what you think about the product..."
                                placeholderTextColor="var(--color-text-tertiary)"
                                multiline
                                textAlignVertical="top"
                                value={comment}
                                onChangeText={setComment}
                            />
                        </View>

                        <TouchableOpacity
                            className={`bg-primary rounded-full py-4 items-center shadow-lg shadow-primary/25 ${isCreatingReview ? "opacity-70" : ""
                                }`}
                            onPress={handleSubmit}
                            disabled={isCreatingReview}
                        >
                            {isCreatingReview ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ReviewModal;
