import "./global.css";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppLoader } from "./src/shared/components/AppLoader";
import { WelcomeScreen } from "./src/shared/components/WelcomeScreen";
import { taskApi } from "./src/features/tasks/services/taskApi";
import { AppNavigation } from "./src/navigation/navigation";

type AppState = "loading" | "welcome" | "ready";

export default function App() {
  const [appState, setAppState] = useState<AppState>("loading");

  useEffect(() => {
    let isMounted = true;

    const warmUp = async () => {
      // Show loader while API warms up (min 2000ms so the animation is visible)
      await Promise.allSettled([
        taskApi.getTasks(),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
      if (isMounted) {
        setAppState("welcome");
      }
    };

    void warmUp();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      {appState === "loading" && <AppLoader />}
      {appState === "welcome" && (
        <WelcomeScreen onStart={() => setAppState("ready")} />
      )}
      {appState === "ready" && <AppNavigation />}
      <Toast />
    </SafeAreaProvider>
  );
}
