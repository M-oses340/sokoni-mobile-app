import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from "react";
import "../global.css";

// 1. Stable Constants (Defined outside the components)
const queryClient = new QueryClient();

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// 2. Navigation Guard Component
function AuthProtectedStack() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && inAuthGroup) {
      // If signed in, kick them out of login/signup pages to home
      router.replace("/");
    } else if (!isSignedIn && !inAuthGroup) {
      // If NOT signed in, force them to the login group
      router.replace("/(auth)"); 
    }
  }, [isSignedIn, isLoaded, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

// 3. Main Root Layout
export default function RootLayout() {
  if (!publishableKey) {
    console.error("Missing Clerk Publishable Key");
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <ClerkLoaded>
          <AuthProtectedStack />
        </ClerkLoaded>
      </QueryClientProvider>
    </ClerkProvider>
  );
}