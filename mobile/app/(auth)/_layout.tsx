import { Stack } from "expo-router";

export default function AuthRoutesLayout() {
  // We removed the redirect logic from here 
  // because it's already handled in the Root Layout.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}