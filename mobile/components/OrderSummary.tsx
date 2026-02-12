import { View } from "react-native";
import { AppText } from "./ui/AppText";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
}

export default function OrderSummary({ subtotal, shipping, tax, discount = 0, total }: OrderSummaryProps) {
  return (
    <View className="px-6 mt-6">
      <View className="bg-surface rounded-3xl p-5">
        <AppText className="text-text-primary text-xl font-bold mb-4">Summary</AppText>

        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <AppText className="text-text-secondary text-base">Subtotal</AppText>
            <AppText className="text-text-primary font-semibold text-base">
              ${subtotal.toFixed(2)}
            </AppText>
          </View>

          {discount > 0 && (
            <View className="flex-row justify-between items-center">
              <AppText className="text-green-500 text-base">Discount</AppText>
              <AppText className="text-green-500 font-semibold text-base">
                -${discount.toFixed(2)}
              </AppText>
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <AppText className="text-text-secondary text-base">Shipping</AppText>
            <AppText className="text-text-primary font-semibold text-base">
              ${shipping.toFixed(2)}
            </AppText>
          </View>

          <View className="flex-row justify-between items-center">
            <AppText className="text-text-secondary text-base">Tax</AppText>
            <AppText className="text-text-primary font-semibold text-base">${tax.toFixed(2)}</AppText>
          </View>

          {/* Divider */}
          <View className="border-t border-background-lighter pt-3 mt-1" />

          {/* Total */}
          <View className="flex-row justify-between items-center">
            <AppText className="text-text-primary font-bold text-lg">Total</AppText>
            <AppText className="text-primary font-bold text-2xl">${total.toFixed(2)}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
