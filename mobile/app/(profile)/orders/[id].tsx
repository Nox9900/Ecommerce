import RatingModal from "@/components/RatingModal";
import SafeScreen from "@/components/SafeScreen";
import { GlassView } from "@/components/ui/GlassView";
import { useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";
import { capitalizeFirstLetter, formatDate, getStatusColor } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: orders, isLoading, isError } = useOrders();
    const { createReviewAsync, isCreatingReview } = useReviews();

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});

    const order = useMemo(() => orders?.find((o) => o._id === id), [orders, id]);

    const handleOpenRating = () => {
        if (!order) return;
        setShowRatingModal(true);

        // init ratings for all product to 0
        const initialRatings: { [key: string]: number } = {};
        order.orderItems.forEach((item) => {
            initialRatings[item.product._id] = 0;
        });
        setProductRatings(initialRatings);
    };

    const handleSubmitRating = async () => {
        if (!order) return;

        const allRated = Object.values(productRatings).every((rating) => rating > 0);
        if (!allRated) {
            Alert.alert("Error", "Please rate all products");
            return;
        }

        try {
            await Promise.all(
                order.orderItems.map((item) => {
                    createReviewAsync({
                        productId: item.product._id,
                        orderId: order._id,
                        rating: productRatings[item.product._id],
                    });
                })
            );

            Alert.alert("Success", "Thank you for rating all products!");
            setShowRatingModal(false);
            setProductRatings({});
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.error || "Failed to submit rating");
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    if (isError || !order) {
        return (
            <View className="flex-1 bg-background">
                <View className="px-6 pb-4 border-b border-black/5 dark:border-white/5 flex-row items-center gap-4" style={{ paddingTop: insets.top + 10 }}>
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10">
                        <Ionicons name="arrow-back" size={20} className="text-text-primary" />
                    </TouchableOpacity>
                </View>
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-text-primary font-bold text-lg">Order not found</AppText>
                </View>
            </View>
        );
    }

    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <GlassView intensity={40} className="px-6 pb-4 border-b border-black/5 dark:border-white/5 flex-row items-center gap-4" style={{ paddingTop: insets.top + 10 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-black/10 dark:border-white/10"
                >
                    <Ionicons name="arrow-back" size={20} className="text-text-primary" />
                </TouchableOpacity>
                <View className="flex-1 justify-center">
                    <AppText className="text-text-primary text-xl font-bold">Order Details</AppText>
                </View>
            </GlassView>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Status & Date */}
                <View className="p-6 border-b border-black/5 dark:border-white/5">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <AppText className="text-text-primary font-black text-2xl mb-1">#{order._id.slice(-8).toUpperCase()}</AppText>
                            <AppText className="text-text-tertiary text-xs font-bold uppercase tracking-widest">{formatDate(order.createdAt)}</AppText>
                        </View>
                        <View
                            className="px-4 py-2 rounded-xl border"
                            style={{
                                backgroundColor: getStatusColor(order.status) + "10",
                                borderColor: getStatusColor(order.status) + "30"
                            }}
                        >
                            <AppText
                                className="text-xs font-black uppercase tracking-wider"
                                style={{ color: getStatusColor(order.status) }}
                            >
                                {order.status}
                            </AppText>
                        </View>
                    </View>
                </View>

                {/* Shipping Address */}
                <View className="p-6 border-b border-black/5 dark:border-white/5">
                    <AppText className="text-text-primary font-bold text-lg mb-4">Shipping Details</AppText>
                    <View className="bg-surface-light p-4 rounded-2xl border border-black/5 dark:border-white/5">
                        <AppText className="text-text-primary font-bold text-base mb-1">{order.shippingAddress.fullName}</AppText>
                        <AppText className="text-text-secondary text-sm mb-1">{order.shippingAddress.streetAddress}</AppText>
                        <AppText className="text-text-secondary text-sm mb-1">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</AppText>
                        <AppText className="text-text-tertiary text-xs font-bold uppercase tracking-widest mt-2">{order.shippingAddress.phoneNumber}</AppText>
                    </View>
                </View>

                {/* Order Items */}
                <View className="p-6">
                    <AppText className="text-text-primary font-bold text-lg mb-4">Items ({totalItems})</AppText>
                    <View className="gap-4">
                        {order.orderItems.map((item) => (
                            <View key={item._id} className="flex-row gap-4 bg-surface-light p-4 rounded-2xl border border-black/5 dark:border-white/5">
                                <Image source={item.image} style={{ width: 80, height: 80, borderRadius: 12 }} contentFit="cover" />
                                <View className="flex-1 justify-center">
                                    <AppText className="text-text-primary font-bold text-base mb-1" numberOfLines={1}>{item.name}</AppText>
                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                        <AppText className="text-[10px] text-text-tertiary uppercase font-black tracking-tighter mb-2">
                                            {Object.entries(item.selectedOptions)
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(" • ")}
                                        </AppText>
                                    )}
                                    <View className="flex-row justify-between items-end">
                                        <AppText className="text-text-secondary text-sm font-bold">Qty: {item.quantity}</AppText>
                                        <AppText className="text-text-primary font-black text-lg">
                                            <AppText className="text-primary text-xs">$</AppText>{item.price.toFixed(2)}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Payment Summary */}
                <View className="mx-6 bg-surface-light p-6 rounded-3xl border border-black/5 dark:border-white/5 mb-6">
                    <View className="flex-row justify-between mb-2">
                        <AppText className="text-text-secondary text-sm">Subtotal</AppText>
                        <AppText className="text-text-primary font-bold text-sm">${order.totalPrice.toFixed(2)}</AppText>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <AppText className="text-text-secondary text-sm">Shipping</AppText>
                        <AppText className="text-text-primary font-bold text-sm">Free</AppText>
                    </View>
                    <View className="h-[1px] bg-black/5 dark:bg-white/5 w-full mb-4" />
                    <View className="flex-row justify-between items-center">
                        <AppText className="text-text-primary font-black text-lg">Total</AppText>
                        <AppText className="text-primary font-black text-2xl">${order.totalPrice.toFixed(2)}</AppText>
                    </View>
                </View>

                {/* Actions */}
                {order.status === "delivered" && !order.hasReviewed && (
                    <View className="px-6 pb-6">
                        <TouchableOpacity
                            className="bg-primary w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                            activeOpacity={0.8}
                            onPress={handleOpenRating}
                        >
                            <Ionicons name="star" size={20} color="white" />
                            <AppText className="text-white font-black text-base ml-2 uppercase tracking-tight">
                                Rate Order
                            </AppText>
                        </TouchableOpacity>
                    </View>
                )}

                {order.status === "delivered" && order.hasReviewed && (
                    <View className="px-6 pb-6 items-center">
                        <View className="bg-green-500/10 px-6 py-3 rounded-2xl flex-row items-center border border-green-500/20">
                            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            <AppText className="text-green-500 font-bold text-sm ml-2">Order Reviewed</AppText>
                        </View>
                    </View>
                )}

            </ScrollView>

            <RatingModal
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                order={order}
                productRatings={productRatings}
                onSubmit={handleSubmitRating}
                isSubmitting={isCreatingReview}
                onRatingChange={(productId, rating) =>
                    setProductRatings((prev) => ({ ...prev, [productId]: rating }))
                }
            />
        </View>
    );
}
