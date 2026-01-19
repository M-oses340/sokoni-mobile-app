import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import { LogBox } from 'react-native'; // 1. Import LogBox

// 2. Suppress the false-positive Stripe warning
// This must be done at the absolute top of the entry file
LogBox.ignoreLogs(['No task registered for key StripeKeepJsAwakeTask']);

const STRIPE_TASK_NAME = 'StripeKeepJsAwakeTask';

try {
  if (!TaskManager.isTaskDefined(STRIPE_TASK_NAME)) {
    TaskManager.defineTask(STRIPE_TASK_NAME, async () => {
      return Promise.resolve();
    });
    console.log("✅ [StripeTask] Registered successfully");
  }
} catch (error) {
  console.error("❌ [StripeTask] Failed to register:", error);
}

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);