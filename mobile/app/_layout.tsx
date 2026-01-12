import * as Sentry from '@sentry/react-native';

// 1. Initialize Sentry immediately at the top
Sentry.init({
  dsn: 'https://057a27e20892031141e3c87b854943ee@o4510658712764416.ingest.us.sentry.io/4510674852642816',
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

import { Stack, useRouter, useSegments } from "expo-router";
import { MutationCache,QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
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
          queryKey: query.queryKey[0]?.toString() || "unknon",
        },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // global error handler for all mutations
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
        },
      });
    },
  }),
});

// 2. Robust Token Cache
const tokenCache = {
  async getToken(key: string) {
    try {
      const value = await SecureStore.getItemAsync(key);
      console.log("🔑 [Storage] Reading token:", value ? "Found ✅" : "Missing ❌");
      return value;
    } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try {
      console.log("💾 [Storage] WRITING TOKEN TO DEVICE...");
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("💾 [Storage] SAVE ERROR:", err);
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function AuthProtectedStack() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until Clerk has finished checking storage and server
    if (!isLoaded) return;

    const currentSegments = segments as string[];
    const inAuthGroup = currentSegments.includes("(auth)");
    
    // We prioritize userId because it's the last piece to hydrate
    const authenticated = !!userId || isSignedIn;

    console.log("--- 🕵️ WATCHDOG ---");
    console.log("Status:", { authenticated, userId });
    console.log("Current Path:", currentSegments.join('/') || "Root");

    if (authenticated && inAuthGroup) {
      console.log("🚀 AUTH DETECTED -> Moving to Tabs");
      router.replace("/(tabs)" as any);
    } else if (!authenticated && !inAuthGroup && currentSegments.length > 0) {
      console.log("🔒 NO AUTH -> Moving to Login");
      router.replace("/(auth)" as any);
    }
  }, [isLoaded, userId, isSignedIn, segments]);

  // Prevent UI flickering while loading
  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default Sentry.wrap(function RootLayout() {
  if (!publishableKey) {
    console.error("❌ MISSING CLERK PUBLISHABLE KEY");
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ClerkLoaded>
            <AuthProtectedStack />
          </ClerkLoaded>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
});