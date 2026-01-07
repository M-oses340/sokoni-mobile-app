// app/(auth)/_layout.tsx
import { Stack,Redirect} from 'expo-router';
import { useAuth} from '@clerk/clerk-expo';

export default function AuthLayout() {
  const {isSignedIn} = useAuth();
  
  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />
}