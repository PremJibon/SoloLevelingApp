import React, { useEffect } from "react";
import { Pressable, PressableProps, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { SystemText } from "./SystemText";
import { useSystemStore } from "../store/useSystemStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SystemButtonProps extends PressableProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  variant?: "blue" | "purple";
}

export function SystemButton({
  children,
  active = false,
  className = "",
  variant,
  style,
  ...props
}: SystemButtonProps) {
  const { level, currentTheme } = useSystemStore();
  const resolvedTheme = variant || (currentTheme === "system" ? (level >= 10 ? "purple" : "blue") : currentTheme);
  const borderOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (active) {
      borderOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.25, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      borderOpacity.value = withTiming(0.4, { duration: 300 });
    }
  }, [active]);

  const getThemeConfig = (theme: string) => {
    switch (theme) {
      case "purple":
        return {
          glow: "#7000ff",
          rgbPrefix: "rgba(112, 0, 255,",
          textClass: "text-system-purple",
          accentClass: "border-system-purple",
        };
      case "red":
        return {
          glow: "#ef4444",
          rgbPrefix: "rgba(239, 68, 68,",
          textClass: "text-red-500",
          accentClass: "border-red-500",
        };
      case "gold":
        return {
          glow: "#fbbf24",
          rgbPrefix: "rgba(251, 191, 36,",
          textClass: "text-amber-400",
          accentClass: "border-amber-400",
        };
      case "blue":
      default:
        return {
          glow: "#00e5ff",
          rgbPrefix: "rgba(0, 229, 255,",
          textClass: "text-system-blue",
          accentClass: "border-system-blue",
        };
    }
  };

  const themeConfig = getThemeConfig(resolvedTheme);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: `${themeConfig.rgbPrefix} ${borderOpacity.value})`,
      shadowOpacity: active ? borderOpacity.value * 0.5 : 0.1,
    };
  });

  return (
    <AnimatedPressable
      style={[
        styles.buttonBase,
        { shadowColor: themeConfig.glow },
        animatedStyle,
        style,
      ]}
      android_ripple={{ color: `${themeConfig.rgbPrefix} 0.12)`, borderless: false }}
      className={`border rounded-lg px-4 py-2.5 flex-row justify-center items-center overflow-hidden bg-black/40 relative active:bg-black/60 ${className}`}
      {...props}
    >
      {/* Corner Design Accents - pointerEvents none so they don't block touch */}
      <View pointerEvents="none" className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 ${themeConfig.accentClass}`} />
      <View pointerEvents="none" className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 ${themeConfig.accentClass}`} />
      <View pointerEvents="none" className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 ${themeConfig.accentClass}`} />
      <View pointerEvents="none" className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 ${themeConfig.accentClass}`} />

      {typeof children === "string" ? (
        <SystemText
          glow={active}
          glowColor={`${themeConfig.rgbPrefix} 0.6)`}
          className={`text-center font-bold font-mono tracking-widest text-sm ${themeConfig.textClass}`}
        >
          {children}
        </SystemText>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
    // Minimum 44dp height for accessibility (Android/iOS guideline)
    minHeight: 44,
  },
});

export default SystemButton;
