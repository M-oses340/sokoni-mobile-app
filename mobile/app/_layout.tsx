import { Stack } from "expo-router";
import "../global.css"
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

const queryClient = new QueryClient();
export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
       <Stack
       screenOptions={{headerShown:false,}} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
