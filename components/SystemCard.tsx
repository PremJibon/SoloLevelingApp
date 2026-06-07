import React, { useEffect } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useSystemStore } from "../store/useSystemStore";

export interface SystemCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  variant?: "blue" | "purple";
  delay?: number; // Delay in starting the floating animation (for desyncing multiple cards)
  duration?: number; // Speed of the floating cycle (one direction)
  floatRange?: number; // How far up/down it floats (in pixels)
}

export function SystemCard({
  children,
  className = "",
  variant,
  delay = 0,
  duration = 2500,
  floatRange = 6,
  style,
  ...props
}: SystemCardProps) {
  const { level, currentTheme } = useSystemStore();
  const resolvedTheme = variant || (currentTheme === "system" ? (level >= 10 ? "purple" : "blue") : currentTheme);
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Continuous slow floating animation
    floatY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(floatRange, {
            duration: duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-floatRange, {
            duration: duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      )
    );
  }, [delay, duration, floatRange]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatY.value }],
    };
  });

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "purple":
        return {
          glow: "#7000ff",
          border: "border-system-purple/40",
          accent: "border-system-purple",
        };
      case "red":
        return {
          glow: "#ef4444",
          border: "border-red-500/40",
          accent: "border-red-500",
        };
      case "gold":
        return {
          glow: "#fbbf24",
          border: "border-amber-400/40",
          accent: "border-amber-400",
        };
      case "blue":
      default:
        return {
          glow: "#00e5ff",
          border: "border-system-blue/40",
          accent: "border-system-blue",
        };
    }
  };

  const themeColors = getThemeColors(resolvedTheme);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { shadowColor: themeColors.glow },
        animatedStyle,
        style,
      ]}
      className={`border ${themeColors.border} rounded-xl overflow-hidden mb-6 bg-black/30 ${className}`}
      {...props}
    >
      <BlurView intensity={25} tint="dark" className="p-5 w-full">
        {/* Holographic tech corner marks */}
        <View
          className={`absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 ${themeColors.accent}`}
        />
        <View
          className={`absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 ${themeColors.accent}`}
        />
        <View
          className={`absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 ${themeColors.accent}`}
        />
        <View
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 ${themeColors.accent}`}
        />

        {children}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default SystemCard;
