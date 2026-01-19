import * as Sentry from '@sentry/react-native';
import * as TaskManager from 'expo-task-manager';
import { LogBox } from 'react-native'; // 1. Import LogBox

// Silence the false-positive Stripe warning and the deprecation notice
LogBox.ignoreLogs([
  'No task registered for key StripeKeepJsAwakeTask',
  'SafeAreaView has been deprecated',
]);

const STRIPE_TASK_NAME = 'StripeKeepJsAwakeTask';
if (!TaskManager.isTaskDefined(STRIPE_TASK_NAME)) {
  TaskManager.defineTask(STRIPE_TASK_NAME, async () => {
    return Promise.resolve();
  });
}

Sentry.init({
  dsn: 'https://057a27e20892031141e3c87b854943ee@o4510658712764416.ingest.us.sentry.io/4510674852642816',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

import { Stack, useRouter, useSegments } from "expo-router";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknown",
        },
        extra: {
          errorMessage: error.message,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: { errorMessage: error.message },
      });
    },
  }),
});

const tokenCache = {
  async getToken(key: string) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("💾 [Storage] SAVE ERROR:", err);
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const stripeKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

function AuthProtectedStack() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const currentSegments = segments as string[];
    const inAuthGroup = currentSegments.includes("(auth)");
    const authenticated = !!userId || isSignedIn;

    if (authenticated && inAuthGroup) {
      router.replace("/(tabs)" as any);
    } else if (!authenticated && !inAuthGroup && currentSegments.length > 0) {
      router.replace("/(auth)" as any);
    }
  }, [isLoaded, userId, isSignedIn, segments]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default Sentry.wrap(function RootLayout() {
  if (!publishableKey) return null;

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <StripeProvider 
        publishableKey={stripeKey}
        merchantIdentifier="merchant.com.sokoni" 
      >
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ClerkLoaded>
              <AuthProtectedStack />
            </ClerkLoaded>
          </SafeAreaProvider>
        </QueryClientProvider>
      </StripeProvider>
    </ClerkProvider>
  );
});