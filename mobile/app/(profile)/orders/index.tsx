import RatingModal from "@/components/RatingModal";
import SafeScreen from "@/components/SafeScreen";
import { useOrders } from "@/hooks/useOrders";
import { useReviews } from "@/hooks/useReviews";
import { capitalizeFirstLetter, formatDate, getStatusColor } from "@/lib/utils";
import { Order } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GlassView } from "@/components/ui/GlassView";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "@/components/Header";
import LoadingUI from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/Error";
import EmptyUI from "@/components/ui/Empty";

function OrdersScreen() {
  const { data: orders, isLoading, isError } = useOrders();
  const { createReviewAsync, isCreatingReview } = useReviews();
  const insets = useSafeAreaInsets();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});

  const handleOpenRating = (order: Order) => {
    setShowRatingModal(true);
    setSelectedOrder(order);

    // init ratings for all product to 0 - resettin the state for each product
    const initialRatings: { [key: string]: number } = {};
    order.orderItems.forEach((item) => {
      const productId = item.product._id;
      initialRatings[productId] = 0;
    });
    setProductRatings(initialRatings);
  };

  const handleSubmitRating = async () => {
    if (!selectedOrder) return;

    // check if all products have been rated
    const allRated = Object.values(productRatings).every((rating) => rating > 0);
    if (!allRated) {
      Alert.alert("Error", "Please rate all products");
      return;
    }

    try {
      await Promise.all(
        selectedOrder.orderItems.map((item) => {
          createReviewAsync({
            productId: item.product._id,
            orderId: selectedOrder._id,
            rating: productRatings[item.product._id],
          });
        })
      );

      Alert.alert("Success", "Thank you for rating all products!");
      setShowRatingModal(false);
      setSelectedOrder(null);
      setProductRatings({});
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error || "Failed to submit rating");
    }
  };

  if (isLoading) return <LoadingUI title="Loading" subtitle="Loading your orders" />;
  if (isError) return <ErrorUI title="Something went wrong" subtitle="We couldn't retrieve your orders. Please try again." buttonTitle="Go Back" buttonAction={() => router.back()} />;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <Header primaryText="My Orders" secondaryText="All the orders made" />

      {!orders || orders.length === 0 ? (
        <EmptyUI title="No orders" subtitle="You haven't placed any orders yet. Start shopping to fill your history!" buttonTitle="Shop Now" buttonAction={() => router.push("/(tabs)") as any} />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="px-6 py-6">
            {orders.map((order, index) => {
              const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
              const firstImage = order.orderItems[0]?.image || "";

              return (
                <AnimatedContainer animation="fadeUp" delay={index * 100} key={order._id}>
                  <TouchableOpacity
                    className="mb-6 flex-row"
                    onPress={() => router.push(`/(profile)/orders/${order._id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View className="relative">
                      <View className="shadow-lg shadow-black/20">
                        <Image
                          source={firstImage}
                          style={{ height: 100, width: 100, borderRadius: 20 }}
                          contentFit="cover"
                          transition={500}
                        />
                      </View>

                      {/* BADGE FOR MORE ITEMS */}
                      {order.orderItems.length > 1 && (
                        <View className="absolute -bottom-2 -right-2 bg-primary rounded-full size-8 items-center justify-center border-4 border-background shadow-md">
                          <Text className="text-white text-xs font-black">
                            +{order.orderItems.length - 1}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-1 ml-5 pt-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-text-primary font-bold text-lg">
                          #{order._id.slice(-8).toUpperCase()}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                      </View>

                      <Text className="text-text-tertiary text-xs font-bold uppercase tracking-widest mb-3">
                        {formatDate(order.createdAt)}
                      </Text>

                      <View className="flex-row items-center gap-2 mb-2">
                        <View
                          className="px-3 py-1 rounded-lg border"
                          style={{
                            backgroundColor: getStatusColor(order.status) + "10",
                            borderColor: getStatusColor(order.status) + "30"
                          }}
                        >
                          <Text
                            className="text-[10px] font-black uppercase tracking-wider"
                            style={{ color: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-baseline gap-1">
                        <Text className="text-text-tertiary text-xs font-bold">{totalItems} {totalItems === 1 ? 'Item' : 'Items'} • </Text>
                        <Text className="text-text-primary font-black text-lg -mb-0.5">
                          <Text className="text-primary text-sm">$</Text>{order.totalPrice.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View className="h-[1px] bg-black/5 dark:bg-white/5 w-full mb-6" />
                </AnimatedContainer>
              );
            })}
          </View>
        </ScrollView>
      )}

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        order={selectedOrder}
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

export default OrdersScreen;
