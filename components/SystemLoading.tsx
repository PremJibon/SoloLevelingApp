import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
} from "react-native-reanimated";
import { useSystemStore } from "../store/useSystemStore";

const { width, height } = Dimensions.get("window");

interface SystemLoadingProps {
  onComplete: () => void;
}

export default function SystemLoading({ onComplete }: SystemLoadingProps) {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const _hasHydrated = useSystemStore((state) => state._hasHydrated);

  // Animation values
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.95);
  const scanY = useSharedValue(-height * 0.4);
  const progressWidth = useSharedValue(0);

  // Terminal/System log lines to output sequentially
  const bootLogs = [
    "[SYSTEM INITIALIZED...]",
    "[CONNECTING TO THE HUNTER NETWORK...]",
    "[SYNCING LOCAL PLAYER PROFILE...]",
    "[LOADING QUEST PROTOCOLS...]",
    "[STATUS: AWAKENED PLAYER DETECTED]",
    "[LOCAL STORAGE SECURED - WELCOME HUNTER]",
  ];

  useEffect(() => {
    // 1. Log lines typing animation
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < bootLogs.length) {
        setLogLines((prev) => [...prev, bootLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 400);

    // 2. Progress percentage logic (parallel with visual bar)
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 100) {
        currentProgress += Math.floor(Math.random() * 8) + 4;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
      }
    }, 120);

    // 3. Reanimated animations
    // Progress Bar Animation
    progressWidth.value = withTiming(1, { duration: 2500 });

    // Laser scanning animation
    scanY.value = withRepeat(
      withSequence(
        withTiming(height * 0.4, { duration: 1200 }),
        withTiming(-height * 0.4, { duration: 1200 })
      ),
      -1,
      true
    );

    // Entrance scale animation
    scale.value = withTiming(1, { duration: 800 });

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  // Handle completion when both animation time is up AND hydrated
  useEffect(() => {
    let animationTimeout: ReturnType<typeof setTimeout>;
    let fallbackTimeout: ReturnType<typeof setTimeout>;
    
    const minAnimationTime = 3000;
    const maxWaitTime = 5000; // 5 second safety fallback

    const triggerComplete = () => {
      // Fade out and scale up slightly for zoom effect
      opacity.value = withTiming(0, { duration: 600 });
      scale.value = withTiming(1.05, { duration: 600 });
      
      setTimeout(() => {
        onComplete();
      }, 600);
    };

    if (_hasHydrated) {
      animationTimeout = setTimeout(triggerComplete, minAnimationTime);
    } else {
      // Set a fallback in case hydration is extremely slow or fails
      fallbackTimeout = setTimeout(() => {
        console.log("[SYSTEM] Hydration fallback triggered");
        triggerComplete();
      }, maxWaitTime);
    }

    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [_hasHydrated]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
    };
  });

  const animatedLaserStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanY.value }],
    };
  });

  return (
    <Animated.View
      style={[styles.container, animatedContainerStyle]}
      className="flex-1 justify-center items-center bg-background px-6"
    >
      {/* Glow Scan Line Overlay */}
      <Animated.View style={[styles.scanLine, animatedLaserStyle]} />

      {/* Main Console Box */}
      <View
        style={styles.consoleBox}
        className="w-full border border-system-blue/30 rounded-xl p-6 bg-black/60 relative overflow-hidden"
      >
        {/* Glow corners */}
        <View className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-system-blue" />
        <View className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-system-blue" />
        <View className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-system-blue" />
        <View className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-system-blue" />

        {/* System Title */}
        <View className="items-center mb-6">
          <Text
            style={styles.systemTitle}
            className="text-system-blue text-2xl font-bold tracking-widest uppercase"
          >
            ★ System Active ★
          </Text>
          <Text className="text-system-purple/70 text-xs font-semibold tracking-widest mt-1">
            COGNITIVE SYNC INTERFACE v4.0.0
          </Text>
        </View>

        {/* Log Window */}
        <View style={styles.logContainer} className="bg-black/80 rounded-md p-4 mb-6 border border-system-purple/20">
          {logLines.map((line, index) => {
            const isLast = index === bootLogs.length - 1;
            return (
              <Text
                key={index}
                style={styles.logText}
                className={isLast ? "text-system-blue font-bold" : "text-system-purple/90"}
              >
                {line}
              </Text>
            );
          })}
          {logLines.length < bootLogs.length && (
            <Text style={styles.cursorText} className="text-system-blue animate-pulse">
              _
            </Text>
          )}
        </View>

        {/* Progress Bar Container */}
        <View className="w-full">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-system-blue/70 text-xs font-semibold uppercase tracking-wider">
              Downloading Data Assets
            </Text>
            <Text className="text-system-blue font-bold text-xs font-mono">
              {progress}%
            </Text>
          </View>
          
          <View className="w-full h-3 bg-system-purple/20 rounded-full overflow-hidden border border-system-purple/30">
            <Animated.View
              style={[styles.progressBar, animatedProgressStyle]}
              className="h-full bg-system-blue rounded-full"
            />
          </View>
        </View>
      </View>

      {/* Decorative Text */}
      <Text className="text-system-blue/30 text-2xs tracking-widest uppercase absolute bottom-12 text-center font-mono">
        Solo Leveling System Interface • Do not close application
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  consoleBox: {
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  systemTitle: {
    textShadowColor: "rgba(0, 229, 255, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  logContainer: {
    minHeight: 140,
    justifyContent: "flex-start",
  },
  logText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
    textShadowColor: "rgba(112, 0, 255, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  cursorText: {
    fontFamily: "monospace",
    fontSize: 14,
  },
  progressBar: {
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(0, 229, 255, 0.3)",
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
});
