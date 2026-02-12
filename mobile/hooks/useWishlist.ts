import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Product } from "@/types";

const useWishlist = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: wishlistData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get<{
        wishlist: Product[];
        isWishlistPublic: boolean;
        wishlistToken: string;
      }>("/users/wishlist");
      return data;
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.post<{ wishlist: string[] }>("/users/wishlist", { productId });
      return data.wishlist;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<{ wishlist: string[] }>(`/users/wishlist/${productId}`);
      return data.wishlist;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const isInWishlist = (productId: string) => {
    return wishlistData?.wishlist?.some((product) => product._id === productId) ?? false;
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlist: wishlistData?.wishlist || [],
    isWishlistPublic: wishlistData?.isWishlistPublic || false,
    wishlistToken: wishlistData?.wishlistToken || "",
    isLoading,
    isError,
    wishlistCount: wishlistData?.wishlist?.length || 0,
    isInWishlist,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
};

export const useShareWishlist = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const shareWishlistMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put<{ isWishlistPublic: boolean; wishlistToken: string }>(
        "/users/wishlist/share"
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return {
    toggleShare: shareWishlistMutation.mutate,
    isTogglingShare: shareWishlistMutation.isPending,
  };
};

export const usePublicWishlist = (token: string) => {
  const api = useApi();

  return useQuery({
    queryKey: ["public-wishlist", token],
    queryFn: async () => {
      const { data } = await api.get<{ wishlist: Product[]; ownerName: string }>(
        `/users/wishlist/share/${token}`
      );
      return data;
    },
    enabled: !!token,
  });
};

export default useWishlist;
