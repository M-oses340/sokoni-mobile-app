import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";

function useSocialAuth() {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoadingStrategy(strategy);

    try {
      // 1. Explicitly define the redirect to match your Clerk Dashboard settings
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "mobile",
        path: "oauth-native-callback",
      });

      console.log("🔗 Starting SSO Flow with Redirect:", redirectUrl);

      const { createdSessionId, setActive } = await startSSOFlow({ 
        strategy,
        redirectUrl, 
      });

      if (createdSessionId && setActive) {
        console.log("💾 Session created. Activating...");
        
        // 2. CRITICAL: This saves the token to SecureStore
        await setActive({ session: createdSessionId });
        
        console.log("✅ Session is now active. Navigating...");
        
        // 3. Manual navigation as a backup
        router.replace("/(tabs)" as any);
      }
    } catch (error: any) {
      const isAlreadyLoggedIn = error?.errors?.some((e: any) => e.code === "already_signed_in");
      if (isAlreadyLoggedIn) {
        router.replace("/(tabs)" as any);
        return;
      }
      console.error("SSO Error:", error);
      Alert.alert("Authentication Failed", "Please try again.");
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { loadingStrategy, handleSocialAuth };
}

export default useSocialAuth;