import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/useTheme";
import { GlassView } from "@/components/ui/GlassView";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

import * as Sentry from "@sentry/react-native";

const CartScreen = () => {
  const api = useApi();
  const { t } = useTranslation();
  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { refetch } = useCart();
  const { refetch: refetchAddresses } = useAddresses();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchAddresses()]);
    setRefreshing(false);
  };

  const cartItems = (cart?.items || []).filter((item) => item.product != null);
  const subtotal = cartTotal;
  const shipping = 10.0; // $10 shipping fee
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert(t('common.remove_item'), t('common.remove_item_desc', { name: productName }), [
      { text: t('common.cancel'), style: "cancel" },
      {
        text: t('common.remove'),
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // check if user has addresses
    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile before checking out.",
        [{ text: "OK" }]
      );
      return;
    }

    // show address selection modal
    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);

    // log chechkout initiated
    Sentry.logger.info("Checkout initiated", {
      itemCount: cartItemCount,
      total: total.toFixed(2),
      city: selectedAddress.city,
    });

    try {
      setPaymentLoading(true);

      // create payment intent with cart items and shipping address
      const { data } = await api.post("/payment/create-intent", {
        cartItems,
        shippingAddress: {
          fullName: selectedAddress.fullName,
          streetAddress: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phoneNumber: selectedAddress.phoneNumber,
        },
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "Your Store Name",
      });

      if (initError) {
        Sentry.logger.error("Payment sheet init failed", {
          errorCode: initError.code,
          errorMessage: initError.message,
          cartTotal: total,
          itemCount: cartItems.length,
        });

        Alert.alert("Error", initError.message);
        setPaymentLoading(false);
        return;
      }

      // present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Sentry.logger.error("Payment cancelled", {
          errorCode: presentError.code,
          errorMessage: presentError.message,
          cartTotal: total,
          itemCount: cartItems.length,
        });

        Alert.alert("Payment cancelled", presentError.message);
      } else {
        Sentry.logger.info("Payment successful", {
          total: total.toFixed(2),
          itemCount: cartItems.length,
        });

        Alert.alert(t('common.success'), t('common.payment_success'), [
          { text: "OK", onPress: () => { } },
        ]);
        clearCart();
      }
    } catch (error) {
      Sentry.logger.error("Payment failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        cartTotal: total,
        itemCount: cartItems.length,
      });

      Alert.alert("Error", "Failed to process payment!!!!");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <AnimatedContainer animation="fadeDown">
        <Text className="pt-4 px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">{t('tabs.cart')}</Text>
      </AnimatedContainer>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00D9FF"
          />
        }
      >
        <View className="px-6 gap-4">
          {cartItems.map((item, index) => (
            <AnimatedContainer key={item._id} animation="fadeUp" delay={index * 100}>
              <View className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-white/5">
                <View className="p-4 flex-row">
                  {/* product image */}
                  <View className="relative">
                    <Image
                      source={item.product.images[0]}
                      className="bg-background-lighter"
                      contentFit="cover"
                      style={{ width: 112, height: 112, borderRadius: 16 }}
                    />
                  </View>

                  <View className="flex-1 ml-4 justify-between">
                    <View>
                      <Text
                        className="text-text-primary font-bold text-lg leading-tight"
                        numberOfLines={2}
                      >
                        {t('db.' + item.product.name, { defaultValue: item.product.name })}
                      </Text>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <View className="flex-row flex-wrap gap-2 mt-1">
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            <View key={key} className="bg-background-lighter px-2 py-0.5 rounded-md">
                              <Text className="text-[10px] text-text-secondary uppercase font-bold">
                                {key}: <Text className="text-text-primary capitalize">{value}</Text>
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <View className="flex-row items-center mt-2">
                        <Text className="text-primary font-bold text-2xl">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Text>
                        <Text className="text-text-secondary text-sm ml-2">
                          ${item.product.price.toFixed(2)} each
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mt-3">
                      <View className="flex-row items-center bg-background rounded-2xl p-1">
                        <TouchableOpacity
                          className="bg-surface rounded-xl w-8 h-8 items-center justify-center shadow-sm"
                          activeOpacity={0.7}
                          onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#6366F1" />
                          ) : (
                            <Ionicons name="remove" size={18} color="#6366F1" />
                          )}
                        </TouchableOpacity>

                        <View className="mx-3 min-w-[24px] items-center">
                          <Text className="text-text-primary font-bold text-base">{item.quantity}</Text>
                        </View>

                        <TouchableOpacity
                          className="bg-primary rounded-xl w-8 h-8 items-center justify-center shadow-sm"
                          activeOpacity={0.7}
                          onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => handleRemoveItem(item.product._id, item.product.name)}
                        disabled={isRemoving}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </AnimatedContainer>
          ))}
        </View>

        <AnimatedContainer animation="fadeUp" delay={400}>
          <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
        </AnimatedContainer>
      </ScrollView>

      <View
        className="bottom-0 left-0 right-0 border-t border-white/5 pt-4 pb-32 px-6"
      >
        {/* Quick Stats */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
              <Ionicons name="cart" size={16} color="#6366F1" />
            </View>
            <Text className="text-text-secondary font-medium">
              {cartItemCount} {cartItemCount === 1 ? t('common.item') : t('common.items')}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-text-primary font-bold text-2xl">${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          className="bg-primary rounded-2xl overflow-hidden shadow-lg"
          activeOpacity={0.9}
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-5 flex-row items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-primary-foreground font-bold text-lg mr-2">{t('common.checkout')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </SafeScreen>
  );
};

export default CartScreen;

function LoadingUI() {
  const { theme } = useTheme();
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color={theme === 'dark' ? "#fff" : "#000"} />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}

function ErrorUI() {
  const { theme } = useTheme();
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
      <Text className="text-text-secondary text-center mt-2">
        Please check your connection and try again
      </Text>
    </View>
  );
}

function EmptyUI() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-5">
        <Text className="text-text-primary text-3xl font-bold tracking-tight">Cart</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="cart-outline" size={80} color="#666" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Your cart is empty</Text>
        <Text className="text-text-secondary text-center mt-2">
          Add some products to get started
        </Text>
      </View>
    </View>
  );
}
