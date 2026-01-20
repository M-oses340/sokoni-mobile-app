import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Product } from "@/types";

export const useWishlist = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      try {
        const { data } = await api.get<any>("/users/wishlist");
        
        // This line handles BOTH cases:
        // 1. If backend sends { wishlist: [...] }
        // 2. If backend sends [...] directly
        const result = data?.wishlist || data;

        // Never return undefined; fallback to empty array
        return (result || []) as Product[];
      } catch (err) {
        return [] as Product[]; // Return empty array on error to prevent crash
      }
    },
    placeholderData: [] as Product[], // Immediate data so 'reduce' doesn't fail
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.post<any>("/users/wishlist", { productId });
      // FIX: Handle both { wishlist: [] } and raw []
      return data?.wishlist || data || [];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<any>(`/users/wishlist/${productId}`);
      // FIX: Handle both { wishlist: [] } and raw []
      return data?.wishlist || data || [];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const isInWishlist = (productId: string) => {
    return wishlist?.some((product) => product._id === productId) ?? false;
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlist: wishlist || [],
    isLoading,
    isError,
    wishlistCount: wishlist?.length || 0,
    isInWishlist,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
};

export default useWishlist;