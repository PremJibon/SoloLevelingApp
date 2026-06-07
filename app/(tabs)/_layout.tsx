import React, { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSystemStore } from "../../store/useSystemStore";
import SystemText from "../../components/SystemText";
import SystemButton from "../../components/SystemButton";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { level, currentTheme } = useSystemStore();
  const insets = useSafeAreaInsets();
  const resolvedTheme = currentTheme === "system" ? (level >= 10 ? "purple" : "blue") : currentTheme;

  const getTabTheme = (theme: string) => {
    switch (theme) {
      case "purple": return { border: "border-system-purple/20", glow: "rgba(112, 0, 255, 0.8)", textClass: "text-system-purple font-bold", indicator: "bg-system-purple" };
      case "red":    return { border: "border-red-500/20",        glow: "rgba(239, 68, 68, 0.8)",  textClass: "text-red-500 font-bold",        indicator: "bg-red-500" };
      case "gold":   return { border: "border-amber-400/20",      glow: "rgba(251, 191, 36, 0.8)", textClass: "text-amber-400 font-bold",      indicator: "bg-amber-400" };
      default:       return { border: "border-system-blue/20",    glow: "rgba(0, 229, 255, 0.8)",  textClass: "text-system-blue font-bold",    indicator: "bg-system-blue" };
    }
  };

  const tabTheme = getTabTheme(resolvedTheme);
  // Respect system bottom inset (home indicator / navigation bar) with a minimum of 8px
  const bottomOffset = Math.max(insets.bottom, 8);

  return (
    <View
      style={[styles.tabBar, { bottom: bottomOffset + 4 }]}
      className={`absolute left-4 right-4 rounded-xl border ${tabTheme.border} overflow-hidden bg-black/40`}
    >
      <BlurView intensity={30} tint="dark" style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          // Hide inventory and shop tabs if level is below 10
          if ((route.name === "inventory" || route.name === "shop") && level < 10) return null;

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            // Minimum 48dp touch target for Android accessibility
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              android_ripple={{ color: "rgba(255,255,255,0.08)", borderless: false }}
            >
              <SystemText
                glow={isFocused}
                glowColor={isFocused ? tabTheme.glow : undefined}
                className={`font-mono text-2xs uppercase tracking-widest ${
                  isFocused ? tabTheme.textClass : "text-gray-500"
                }`}
              >
                {String(label)}
              </SystemText>
              {isFocused && (
                <View className={`absolute bottom-1.5 w-8 h-0.5 ${tabTheme.indicator} shadow`} />
              )}
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  const {
    level,
    isPenaltyActive,
    penaltySecondsRemaining,
    acknowledgePenalty,
  } = useSystemStore();
  // NOTE: penalty timer ticking is handled globally in app/_layout.tsx to avoid double-tick

  // Red pulsing border animation for penalty screen
  const borderPulse = useSharedValue(0.4);
  useEffect(() => {
    if (isPenaltyActive) {
      borderPulse.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isPenaltyActive]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(239, 68, 68, ${borderPulse.value})`,
      shadowOpacity: borderPulse.value * 0.7,
    };
  });

  // Helper to format remaining seconds into hh:mm:ss
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  if (isPenaltyActive) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Animated.View
          style={[
            styles.penaltyCard,
            { shadowColor: "#ef4444" },
            pulseStyle,
          ]}
          className="border rounded-2xl w-full p-6 bg-red-950/10 relative overflow-hidden"
        >
          {/* Tech accents */}
          <View className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
          <View className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500" />
          <View className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500" />
          <View className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />

          {/* Heading */}
          <View className="items-center mb-6 border-b border-red-500/20 pb-4">
            <SystemText
              glowColor="rgba(239, 68, 68, 0.8)"
              className="text-red-500 text-xl font-bold uppercase tracking-widest text-center"
            >
              [ SYSTEM ALERT ]
            </SystemText>
            <SystemText
              glow={false}
              className="text-red-400/80 text-3xs font-semibold uppercase tracking-widest mt-1.5"
            >
              PENALTY QUEST ACTIVATED
            </SystemText>
          </View>

          {/* Info Description */}
          <SystemText glow={false} className="text-gray-300 text-xs text-center leading-5 mb-6">
            The Player has failed to complete the Daily Quest within the time limit. As a penalty, you have been teleported to the Penalty Zone.
          </SystemText>

          {/* Quest Name */}
          <View className="bg-black/60 border border-red-500/30 rounded-xl p-4 mb-6 items-center">
            <SystemText glowColor="rgba(239, 68, 68, 0.6)" className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">
              QUEST: SURVIVE THE ZONE
            </SystemText>
            
            {/* Countdown timer */}
            <SystemText
              glowColor="rgba(239, 68, 68, 0.8)"
              className="text-red-500 text-3xl font-bold font-mono tracking-widest my-2"
            >
              {formatTime(penaltySecondsRemaining)}
            </SystemText>

            <SystemText glow={false} className="text-red-400/50 text-4xs uppercase tracking-widest mt-1 text-center">
              DANGER LEVEL: HIGH • TERMINATION IMMINENT
            </SystemText>
          </View>

          {/* Acknowledge Button */}
          <SystemButton
            variant="purple"
            onPress={acknowledgePenalty}
            className="w-full py-3.5 border-red-500 bg-red-950/40 active:bg-red-900/60"
          >
            <SystemText
              glowColor="rgba(255, 255, 255, 0.8)"
              className="text-white text-xs font-bold uppercase tracking-widest"
            >
              ENTER PENALTY ZONE
            </SystemText>
          </SystemButton>
        </Animated.View>
      </View>
    );
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "STATUS",
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          tabBarLabel: "QUESTS",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: "DATABASE",
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarLabel: "STORAGE",
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          tabBarLabel: "SHOP",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 56,
  },
  tabBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    minWidth: 48,
  },
  penaltyCard: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
});
