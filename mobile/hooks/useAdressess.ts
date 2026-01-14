import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { Address } from "@/types";
import { useAuth } from "@clerk/clerk-expo";

export const useAddresses = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { isSignedIn, isLoaded } = useAuth();

  const {
    data: addresses,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      try {
        const response = await api.get<{ addresses: Address[] }>("/users/addresses");
        
        // Ensure we NEVER return undefined. 
        // If the backend returns null or data is missing, return an empty array.
        return response?.data?.addresses ?? [];
      } catch (err) {
        console.error("❌ Addresses Query Error:", err);
        // Throwing allows TanStack Query to catch the error correctly
        throw err;
      }
    },
    // 🚀 CRITICAL FIX: Only run this query if Clerk is loaded AND user is signed in.
    // This prevents sending requests with "undefined" tokens to your backend.
    enabled: isLoaded && isSignedIn,
    
    // Optional: Don't keep retrying if the user isn't authorized
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 401) return false;
      return failureCount < 3;
    }
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, "_id">) => {
      const { data } = await api.post<{ addresses: Address[] }>("/users/addresses", addressData);
      return data.addresses ?? [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: Partial<Address>;
    }) => {
      const { data } = await api.put<{ addresses: Address[] }>(
        `/users/addresses/${addressId}`,
        addressData
      );
      return data.addresses ?? [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const { data } = await api.delete<{ addresses: Address[] }>(`/users/addresses/${addressId}`);
      return data.addresses ?? [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return {
    // Fallback to empty array to prevent .map() crashes in your UI
    addresses: addresses || [],
    isLoading: isLoading || !isLoaded, // Treat Clerk loading as query loading
    isError,
    error,
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isAddingAddress: addAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
  };
};