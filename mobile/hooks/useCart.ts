import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Cart } from "@/types";

const useCart = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<{ cart: Cart }>("/cart");
      return data.cart;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1, selectedOptions, variantId }: { productId: string; quantity?: number; selectedOptions?: Record<string, string>; variantId?: string }) => {
      const { data } = await api.post<{ cart: Cart }>("/cart", { productId, quantity, selectedOptions, variantId });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) => {
      const { data } = await api.put<{ cart: Cart }>(`/cart/${productId}`, { quantity, variantId });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId?: string }) => {
      const { data } = await api.delete<{ cart: Cart }>(`/cart/${productId}`, { params: { variantId } } as any);
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ cart: Cart }>("/cart");
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<{ message: string; cart: Cart }>("/cart/coupon", { code });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ message: string; cart: Cart }>("/cart/coupon");
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cartTotal = (cart?.subtotal !== undefined) ? cart.subtotal :
    (cart?.items.reduce((sum, item) => {
      const price = item.variantId && item.product?.variants ?
        (item.product.variants.find(v => v._id === item.variantId)?.price ?? item.product?.price ?? 0) :
        (item.product?.price ?? 0);
      return sum + price * item.quantity;
    }, 0) ?? 0);

  const discountAmount = cart?.discountAmount ?? 0;
  const grandTotal = cart?.totalPrice ?? cartTotal;
  const couponCode = cart?.coupon;

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    isLoading,
    isError,
    refetch,
    cartTotal,
    discountAmount,
    grandTotal,
    couponCode,
    cartItemCount,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
    applyCoupon: applyCouponMutation.mutateAsync,
    removeCoupon: removeCouponMutation.mutateAsync,
    isApplyingCoupon: applyCouponMutation.isPending,
    isRemovingCoupon: removeCouponMutation.isPending,
  };
};
export default useCart;
