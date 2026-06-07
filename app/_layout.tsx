import "../global.css";
import React, { useState, useEffect } from "react";
import { View, StatusBar } from "react-native";
import { Stack } from "expo-router";
import SystemLoading from "../components/SystemLoading";
import SystemUpdateOverlay from "../components/SystemUpdateOverlay";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSystemStore } from "../store/useSystemStore";
import { useNotifications } from "../hooks/useNotifications";

export default function RootLayout() {
  useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  
  const checkDailyReset = useSystemStore((state) => state.checkDailyReset);
  const tickPenaltyTimer = useSystemStore((state) => state.tickPenaltyTimer);
  const tickBuffs = useSystemStore((state) => state.tickBuffs);
  const isPenaltyActive = useSystemStore((state) => state.isPenaltyActive);
  const activeBuffsCount = useSystemStore((state) => state.activeBuffs?.length ?? 0);
  const _hasHydrated = useSystemStore((state) => state._hasHydrated);

  useEffect(() => {
    if (_hasHydrated) {
      checkDailyReset();
    }
  }, [_hasHydrated, checkDailyReset]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPenaltyActive) {
        tickPenaltyTimer();
      }
      if (activeBuffsCount > 0) {
        tickBuffs();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPenaltyActive, activeBuffsCount, tickPenaltyTimer, tickBuffs]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-background">
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        
        {/* Root Stack Navigator */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0a0a0a" },
          }}
        />

        {/* Global Level-up Evolution overlay */}
        <SystemUpdateOverlay />

        {/* System Boot/Loading Overlay */}
        {isLoading && (
          <SystemLoading onComplete={handleLoadingComplete} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

