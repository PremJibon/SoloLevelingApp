import React, { useEffect, useState } from "react";
import { View, StyleSheet, useWindowDimensions, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useSystemStore } from "../store/useSystemStore";
import SystemText from "./SystemText";
import SystemButton from "./SystemButton";
import { BlurView } from "expo-blur";

export default function SystemUpdateOverlay() {
  const { width, height } = useWindowDimensions();
  const { level, lastCompletedLevelUpdate, dismissLevelUp } = useSystemStore();
  
  // Only trigger if level is greater than lastCompletedLevelUpdate
  const isVisible = level > lastCompletedLevelUpdate;

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"glitch" | "loading" | "complete">("glitch");
  const [logLines, setLogLines] = useState<string[]>([]);

  // Animation values
  const glitchX = useSharedValue(0);
  const glitchY = useSharedValue(0);
  const glitchSkew = useSharedValue(0);
  const glitchOpacity = useSharedValue(1);
  const scanLineY = useSharedValue(-height * 0.4);
  const scale = useSharedValue(0.9);
  const overlayOpacity = useSharedValue(0);

  // Determine what unlocks are occurring
  const isLevel5 = level >= 5 && lastCompletedLevelUpdate < 5;
  const isLevel10 = level >= 10 && lastCompletedLevelUpdate < 10;

  const unlockDetails = (() => {
    if (isLevel10) {
      return {
        title: "SHADOW MONARCH AWAKENING",
        rank: "S-RANK (SHADOW MONARCH)",
        features: [
          "SHADOW STORAGE UNLOCKED (INVENTORY GRID)",
          "SYSTEM THEME SHIFTED: 'BLUE GLOW' ➔ 'SHADOW PURPLE'",
          "CLASS SPECIALIZATION SELECTION ACTIVE",
          "CAPACITY FOR DEFEATED SOULS GRANTED",
        ],
      };
    } else if (isLevel5) {
      return {
        title: "CLASS SELECTION PROTOCOL",
        rank: "D-RANK HUNTER",
        features: [
          "JOB CHANGE SYSTEM UNLOCKED",
          "SPECIALIZATION PATHWAYS ACTIVATED",
          "HUNTER ASSOCIATION LICENSE UPGRADED",
          "NEW SYSTEM ARCHIVES DECRYPTED",
        ],
      };
    } else {
      return {
        title: "SYSTEM ATTRIBUTE CALIBRATION",
        rank: `LEVEL ${level} INITIATE`,
        features: [
          "PLAYER ATTRIBUTE LIMITS EXPANDED",
          "+5 STAT POINTS DISTRIBUTED TO POOL",
          "COGNITIVE FREQUENCY SYNCHRONIZED",
        ],
      };
    }
  })();

  const logsQueue = [
    "[SYSTEM UPDATE INITIALIZED]",
    "[OVERRIDING SYSTEM KERNEL PARAMETERS...]",
    isLevel10 ? "[DECRYPTING SHADOW MONARCH DATA...]" : isLevel5 ? "[LOADING JOB CHANGE MANIFEST...]" : "[EXPANDING SOUL VESSEL CAPACITY...]",
    "[RECALIBRATING STAT POINT CONSTRAINTS...]",
    "[INSTALLING RE-THEMED SYSTEM INTERFACES...]",
    "[STATUS: OPTIMIZATION 100% COMPLETE]",
  ];

  // Reset progress and trigger update flow when overlay becomes visible
  useEffect(() => {
    if (!isVisible) return;

    // Start with overlay fading in and zooming slightly
    overlayOpacity.value = withTiming(1, { duration: 400 });
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back()) });
    setProgress(0);
    setPhase("glitch");
    setLogLines([]);

    // 1. Glitch phase duration (800ms)
    const glitchTimeout = setTimeout(() => {
      setPhase("loading");
    }, 850);

    return () => {
      clearTimeout(glitchTimeout);
    };
  }, [isVisible]);

  // Loading logs and progress counter
  useEffect(() => {
    if (phase !== "loading") return;

    // Ticking logs
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logsQueue.length) {
        setLogLines((prev) => [...prev, logsQueue[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 350);

    // Ticking progress
    let curProgress = 0;
    const progressInterval = setInterval(() => {
      if (curProgress < 100) {
        curProgress += Math.floor(Math.random() * 10) + 5;
        if (curProgress >= 100) {
          curProgress = 100;
          clearInterval(progressInterval);
          setTimeout(() => {
            setPhase("complete");
          }, 400);
        }
        setProgress(curProgress);
      }
    }, 120);

    // Scan line animation
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(height * 0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-height * 0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [phase]);

  // Intermittent glitch animation hook
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // High frequency glitches in "glitch" phase, lower in other phases
      const triggerChance = phase === "glitch" ? 0.4 : 0.9;
      if (Math.random() > triggerChance) {
        glitchX.value = withSequence(
          withTiming((Math.random() - 0.5) * (phase === "glitch" ? 28 : 8), { duration: 30 }),
          withTiming((Math.random() - 0.5) * (phase === "glitch" ? 14 : 4), { duration: 30 }),
          withTiming(0, { duration: 30 })
        );
        glitchY.value = withSequence(
          withTiming((Math.random() - 0.5) * (phase === "glitch" ? 16 : 6), { duration: 30 }),
          withTiming(0, { duration: 30 })
        );
        glitchSkew.value = withSequence(
          withTiming((Math.random() - 0.5) * (phase === "glitch" ? 12 : 3), { duration: 30 }),
          withTiming(0, { duration: 30 })
        );
        glitchOpacity.value = withSequence(
          withTiming(Math.random() * 0.5 + 0.4, { duration: 35 }),
          withTiming(1, { duration: 35 })
        );
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isVisible, phase]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      transform: [
        { scale: scale.value },
        { translateX: glitchX.value },
        { translateY: glitchY.value },
        { skewX: `${glitchSkew.value}deg` },
      ],
    };
  });

  const animatedGlitchOverlay = useAnimatedStyle(() => {
    return {
      opacity: glitchOpacity.value * (phase === "glitch" ? 0.3 : 0.04),
    };
  });

  const animatedScanLine = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineY.value }],
    };
  });

  const handleIntegrate = () => {
    overlayOpacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.9, { duration: 300 });
    setTimeout(() => {
      dismissLevelUp();
    }, 300);
  };

  if (!isVisible) return null;

  const themeColor = level >= 10 ? "#7000ff" : "#00e5ff";
  const glowColorRgba = level >= 10 ? "rgba(112, 0, 255, 0.8)" : "rgba(0, 229, 255, 0.8)";
  const systemTextGlow = level >= 10 ? "rgba(112, 0, 255, 0.5)" : "rgba(0, 229, 255, 0.5)";
  const techBorderClass = level >= 10 ? "border-system-purple" : "border-system-blue";

  return (
    <Animated.View
      style={[styles.fullScreen, animatedContainerStyle]}
      className="absolute inset-0 bg-black/95 z-[99999] justify-center items-center px-6"
    >
      {/* Laser Scanning Overlay */}
      {phase === "loading" && (
        <Animated.View
          style={[
            styles.scanLine,
            animatedScanLine,
            { backgroundColor: themeColor, shadowColor: themeColor },
          ]}
        />
      )}

      {/* Extreme Glitch Color flash layer */}
      <Animated.View
        style={[styles.glitchFlash, animatedGlitchOverlay]}
        className="absolute inset-0 bg-system-purple/20 pointer-events-none"
      />

      {phase === "glitch" ? (
        <View className="items-center">
          <SystemText
            glowColor="rgba(239, 68, 68, 0.8)"
            className="text-red-500 text-3xl font-extrabold text-center tracking-widest uppercase mb-4"
          >
            ⚠️ CRITICAL EVOLUTION
          </SystemText>
          <SystemText glow={false} className="text-gray-400 font-mono text-center text-xs tracking-wider max-w-[280px]">
            [ THE SYSTEM IS SHIFTING YOUR VESSELS PARADIGMS ]
          </SystemText>
        </View>
      ) : (
        <View
          style={[styles.consoleCard, { shadowColor: themeColor }]}
          className={`border w-full rounded-2xl p-5 bg-black/80 relative overflow-hidden`}
        >
          {/* Tech accents */}
          <View className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${techBorderClass}`} />
          <View className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${techBorderClass}`} />
          <View className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${techBorderClass}`} />
          <View className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${techBorderClass}`} />

          {/* Heading */}
          <View className="items-center mb-6 border-b border-white/10 pb-4">
            <SystemText
              glowColor={glowColorRgba}
              className={`text-xl font-bold uppercase tracking-widest text-center ${
                level >= 10 ? "text-system-purple" : "text-system-blue"
              }`}
            >
              [ SYSTEM UPDATE ]
            </SystemText>
            <SystemText glow={false} className="text-gray-400 text-3xs font-semibold tracking-widest mt-1 text-center">
              PLAYER EVOLUTION DETECTED
            </SystemText>
          </View>

          {phase === "loading" ? (
            <View>
              {/* Terminal Logs */}
              <View className="bg-black/90 rounded-xl p-4 border border-white/5 min-h-[160px] mb-6 justify-start">
                {logLines.map((line, index) => {
                  const isLast = index === logsQueue.length - 1;
                  return (
                    <Text
                      key={index}
                      style={{ textShadowColor: systemTextGlow, textShadowRadius: 4, textShadowOffset: { width: 0, height: 0 } }}
                      className={`font-mono text-2xs mb-2 leading-4 ${
                        isLast
                          ? level >= 10 ? "text-system-purple font-bold" : "text-system-blue font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      {line}
                    </Text>
                  );
                })}
                {logLines.length < logsQueue.length && (
                  <Text className={`font-mono text-xs ${level >= 10 ? "text-system-purple" : "text-system-blue"} animate-pulse`}>
                    _
                  </Text>
                )}
              </View>

              {/* Progress bar */}
              <View>
                <View className="flex-row justify-between items-center mb-2 px-1">
                  <SystemText glow={false} className="text-gray-400 text-3xs uppercase tracking-widest">
                    SYNCING PARAMETERS
                  </SystemText>
                  <SystemText
                    glowColor={glowColorRgba}
                    className={`text-2xs font-bold font-mono ${
                      level >= 10 ? "text-system-purple" : "text-system-blue"
                    }`}
                  >
                    {progress}%
                  </SystemText>
                </View>
                <View className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <View
                    style={{ width: `${progress}%` }}
                    className={`h-full rounded-full ${level >= 10 ? "bg-system-purple shadow-lg shadow-system-purple" : "bg-system-blue shadow-lg shadow-system-blue"}`}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View>
              {/* Evolution Complete Layout */}
              <View className="items-center mb-5">
                <SystemText
                  glowColor="rgba(34, 197, 94, 0.8)"
                  className="text-emerald-400 font-extrabold text-sm uppercase tracking-widest text-center"
                >
                  INTEGRATION SUCCESSFUL
                </SystemText>
                <SystemText
                  glowColor={glowColorRgba}
                  className={`text-2xl font-bold font-mono uppercase tracking-wide mt-2 ${
                    level >= 10 ? "text-system-purple" : "text-system-blue"
                  }`}
                >
                  LEVEL {level} REACHED
                </SystemText>
                <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-widest mt-1">
                  Rank: {unlockDetails.rank}
                </SystemText>
              </View>

              {/* Unlocked Features List */}
              <View className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <SystemText
                  glowColor={glowColorRgba}
                  className={`text-3xs font-extrabold uppercase tracking-widest mb-3 text-center ${
                    level >= 10 ? "text-system-purple" : "text-system-blue"
                  }`}
                >
                  UNLOCKED CAPABILITIES:
                </SystemText>
                
                <View className="gap-y-2.5">
                  {unlockDetails.features.map((feat, idx) => (
                    <View key={idx} className="flex-row items-start border-b border-white/5 pb-2 last:border-b-0">
                      <SystemText
                        glowColor={glowColorRgba}
                        className={`text-3xs font-bold mr-2 mt-0.5 ${
                          level >= 10 ? "text-system-purple" : "text-system-blue"
                        }`}
                      >
                        ✦
                      </SystemText>
                      <SystemText glow={false} className="flex-1 text-gray-300 text-3xs font-mono uppercase leading-4">
                        {feat}
                      </SystemText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Integrate Dismiss Button */}
              <SystemButton
                variant={level >= 10 ? "purple" : "blue"}
                onPress={handleIntegrate}
                className="w-full py-3.5"
              >
                INTEGRATE CHANGES
              </SystemButton>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    // width/height injected dynamically via useWindowDimensions
  },
  glitchFlash: {
    zIndex: 2,
  },
  consoleCard: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 5,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
});
