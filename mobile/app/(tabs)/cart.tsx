import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAdressess"; // Fixed typo in import
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { useRouter } from "expo-router";
import * as Sentry from "@sentry/react-native";

const CartScreen = () => {
  const api = useApi();
  const router = useRouter();
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

  const { addresses, isLoading: addressesLoading } = useAddresses();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 10.0; 
  const tax = subtotal * 0.08; 
  const total = subtotal + shipping + tax;

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Enhanced Stripe Initialization with Exponential Backoff
   */
  const initPaymentSheetWithRetry = async (
    clientSecret: string,
    maxRetries = 3
  ): Promise<{ error?: any }> => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 2), 4000);
          
          Sentry.addBreadcrumb({
            category: "payment",
            message: `Retrying Stripe init: attempt ${attempt}`,
            level: "info",
            data: { attempt, backoffDelay },
          });

          await wait(backoffDelay);
        } else {
          await wait(500); 
        }

        const result = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: "Sokoni Store",
          appearance: {
            colors: { primary: "#1DB954" }, 
          },
        });

        if (!result.error) {
          Sentry.addBreadcrumb({
            category: "payment",
            message: `Stripe initialized successfully on attempt ${attempt}`,
            level: "info",
          });
          return result;
        }

        lastError = result.error;

        const isConfigError =
          result.error?.message?.includes("PaymentConfiguration") ||
          result.error?.message?.includes("not initialized");

        if (!isConfigError) return result;

        Sentry.logger.warn(`Stripe config error on attempt ${attempt}: ${result.error.message}`);
      } catch (err) {
        lastError = err;
      }
    }
    return { error: lastError };
  };

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (addressesLoading) {
      Alert.alert("Loading addresses", "Please wait while we load your saved addresses.");
      return;
    }

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile before checking out.",
        [{ text: "OK" }]
      );
      return;
    }

    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);

    Sentry.addBreadcrumb({
      category: "checkout",
      message: "Address selected, initiating payment flow",
      data: { city: selectedAddress.city, total: total.toFixed(2) }
    });

    try {
      setPaymentLoading(true);

      if (!initPaymentSheet || !presentPaymentSheet) {
        throw new Error("Stripe is not properly initialized. Please restart the app.");
      }

      // 1. Create intent (Backend creates "Pending" order first)
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

      // 2. Initialize with Retry Logic
      const { error: initError } = await initPaymentSheetWithRetry(data.clientSecret);

      if (initError) {
        throw initError;
      }

      // Native UI Buffer
      await wait(300);

      // 3. Present the Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Sentry.captureMessage("Payment Sheet Presentation Error", {
            level: "error",
            extra: {
              code: presentError.code,
              message: presentError.message,
            },
          });
          Alert.alert("Error", presentError.message);
        } else {
          Sentry.logger.info("User cancelled payment sheet");
        }
      } else {
        Sentry.addBreadcrumb({
          category: "payment",
          message: "Payment successful, finishing order",
          level: "info",
        });

        Alert.alert("Success 🎉", "Your order has been placed successfully!", [
          { 
            text: "View Orders", 
            onPress: () => {
              clearCart();
              router.replace("/(tabs)"); 
            } 
          },
        ]);
      }
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { flow: "checkout_failure" },
        extra: { itemCount: cartItems.length, total }
      });

      const errorMessage = error?.message || "";
      const isConfigError = errorMessage.includes("PaymentConfiguration") || 
                           errorMessage.includes("not initialized");

      Alert.alert(
        "Checkout Error",
        isConfigError 
          ? "The payment system is still loading. Please try again in a few seconds." 
          : "Something went wrong during checkout. Please try again."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">Cart</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-2">
          {cartItems.map((item) => (
            <View key={item._id} className="bg-surface rounded-3xl overflow-hidden ">
              <View className="p-4 flex-row">
                <View className="relative">
                  <Image
                    source={item.product.images[0]}
                    className="bg-background-lighter"
                    contentFit="cover"
                    style={{ width: 112, height: 112, borderRadius: 16 }}
                  />
                  <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
                    <Text className="text-background text-xs font-bold">×{item.quantity}</Text>
                  </View>
                </View>

                <View className="flex-1 ml-4 justify-between">
                  <View>
                    <Text
                      className="text-text-primary font-bold text-lg leading-tight"
                      numberOfLines={2}
                    >
                      {item.product.name}
                    </Text>
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
                    <TouchableOpacity
                      className="bg-background-lighter rounded-full w-9 h-9 items-center justify-center"
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="remove" size={18} color="#FFF" />}
                    </TouchableOpacity>

                    <View className="mx-4 min-w-[32px] items-center">
                      <Text className="text-text-primary font-bold text-lg">{item.quantity}</Text>
                    </View>

                    <TouchableOpacity
                      className="bg-primary rounded-full w-9 h-9 items-center justify-center"
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <ActivityIndicator size="small" color="#121212" /> : <Ionicons name="add" size={18} color="#121212" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                      onPress={() => handleRemoveItem(item.product._id, item.product.name)}
                      disabled={isRemoving}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface pt-4 pb-32 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="cart" size={20} color="#1DB954" />
            <Text className="text-text-secondary ml-2">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
            </Text>
          </View>
          <Text className="text-text-primary font-bold text-xl">${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-2xl overflow-hidden"
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-5 flex-row items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Text className="text-background font-bold text-lg mr-2">Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color="#121212" />
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

// Supporting UI Components (Loading, Error, Empty) remain the same...
function LoadingUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}

function ErrorUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
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
      </View>
    </View>
  );
}