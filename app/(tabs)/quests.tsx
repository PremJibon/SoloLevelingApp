import React, { useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSystemStore, Quest } from "../../store/useSystemStore";
import SystemText from "../../components/SystemText";
import SystemButton from "../../components/SystemButton";
import SystemCard from "../../components/SystemCard";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Interactive Slider & Stepper Component
function QuestControl({ quest, onUpdate }: { quest: Quest; onUpdate: (val: number) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const isKm = quest.unit === "km";
  const step = isKm ? 0.5 : 5;

  const handleTrackPress = (event: any) => {
    if (trackWidth <= 0) return;
    const { locationX } = event.nativeEvent;
    const pct = Math.max(0, Math.min(locationX / trackWidth, 1));
    let rawVal = pct * quest.target;
    
    // Round to step
    if (isKm) {
      rawVal = Math.round(rawVal * 2) / 2; // nearest 0.5
    } else {
      rawVal = Math.round(rawVal / 5) * 5; // nearest 5
    }
    
    onUpdate(Math.min(quest.target, Math.max(0, rawVal)));
  };

  const increment = () => {
    onUpdate(Math.min(quest.target, quest.current + step));
  };

  const decrement = () => {
    onUpdate(Math.max(0, quest.current - step));
  };

  const progressPct = Math.round((quest.current / quest.target) * 100);
  const isCompleted = quest.current >= quest.target;

  return (
    <View className="bg-black/50 border border-system-purple/15 rounded-xl p-4 mb-4">
      {/* Title & Numeric Counter */}
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <SystemText
            glow={!isCompleted}
            glowColor={isCompleted ? "rgba(0, 229, 255, 0.6)" : "rgba(112, 0, 255, 0.6)"}
            className={`text-sm font-bold uppercase tracking-wider ${
              isCompleted ? "text-system-blue line-through opacity-60" : "text-white"
            }`}
          >
            {quest.name}
          </SystemText>
        </View>
        <View className="items-end">
          <SystemText
            glow={!isCompleted}
            glowColor={isCompleted ? "rgba(0, 229, 255, 0.8)" : "rgba(112, 0, 255, 0.8)"}
            className={`font-mono text-sm font-bold ${isCompleted ? "text-system-blue" : "text-system-purple"}`}
          >
            {quest.current} / {quest.target} {quest.unit.toUpperCase()}
          </SystemText>
        </View>
      </View>

      {/* Steppers + Slider Track */}
      <View className="flex-row items-center gap-x-3">
        {/* Decrement Button */}
        <SystemButton
          variant="purple"
          active={quest.current > 0}
          disabled={quest.current <= 0}
          onPress={decrement}
          className="w-12 h-12 p-0 rounded-lg flex items-center justify-center border-system-purple/30"
        >
          <SystemText glow={false} className="text-sm font-bold text-center">-</SystemText>
        </SystemButton>

        {/* Interactive Track */}
        <Pressable
          onPress={handleTrackPress}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          className="flex-1 h-3.5 bg-system-purple/10 border border-system-purple/20 rounded-full overflow-hidden relative"
        >
          <View
            style={{ width: `${progressPct}%` }}
            className={`h-full rounded-full ${isCompleted ? "bg-system-blue shadow-lg shadow-system-blue" : "bg-system-purple"}`}
          />
        </Pressable>

        {/* Increment Button */}
        <SystemButton
          variant="purple"
          active={!isCompleted}
          disabled={isCompleted}
          onPress={increment}
          className="w-12 h-12 p-0 rounded-lg flex items-center justify-center border-system-purple/30"
        >
          <SystemText glow={false} className="text-sm font-bold text-center">+</SystemText>
        </SystemButton>
      </View>
    </View>
  );
}

export default function QuestsScreen() {
  const {
    quests,
    questsCompletedToday,
    rewardsClaimed,
    updateQuestProgress,
    claimDailyRewards,
    simulateMidnight,
    checkDailyReset,
    resetStore,
    devSetLevel,
    devGainXp,
  } = useSystemStore();

  const [devExpanded, setDevExpanded] = useState(false);

  // Holographic overlay pulse style
  const pulseScale = useSharedValue(0.98);
  React.useEffect(() => {
    if (questsCompletedToday && !rewardsClaimed) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [questsCompletedToday, rewardsClaimed]);

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  const totalQuests = quests.length;
  const completedCount = quests.filter((q) => q.current >= q.target).length;
  const questProgressPct = totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;

  const handleDevMidnight = (fail: boolean) => {
    simulateMidnight(fail);
    // Directly run reset logic to evaluate
    setTimeout(() => {
      checkDailyReset();
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        className="flex-1 px-4 py-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Title Banner */}
        <SystemCard variant="purple" delay={0} className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xs font-bold uppercase tracking-widest">
              Daily System Mission
            </SystemText>
            <SystemText className="text-gray-500 text-3xs">CYCLE: 24H</SystemText>
          </View>
          <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xl font-bold uppercase tracking-wider mb-3">
            Courage of the Weak
          </SystemText>
          <SystemText glow={false} className="text-gray-400 text-2xs leading-4">
            Perform the training routines daily. Failure to complete all routines before midnight will result in immediate teleportation to the Penalty Zone.
          </SystemText>
        </SystemCard>

        {/* Global Progress Gauge */}
        <SystemCard variant="blue" delay={150} className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <SystemText className="text-system-blue text-2xs font-semibold uppercase tracking-wider">
              Overall Mission Progress
            </SystemText>
            <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue font-bold font-mono text-sm">
              {completedCount} / {totalQuests} ROUTINES
            </SystemText>
          </View>
          <View className="w-full h-3 bg-system-blue/10 border border-system-blue/20 rounded-full overflow-hidden mb-1.5">
            <View
              style={{ width: `${questProgressPct}%` }}
              className="h-full bg-system-blue rounded-full shadow-md shadow-system-blue"
            />
          </View>
          <View className="flex-row justify-between items-center">
            <SystemText glow={false} className="text-gray-600 text-4xs uppercase">SYSTEM INTEGRITY</SystemText>
            <SystemText glow={false} className="text-system-blue/60 text-3xs font-mono">{questProgressPct}%</SystemText>
          </View>
        </SystemCard>

        {/* Quest List */}
        <View className="mb-6">
          {quests.map((quest) => (
            <QuestControl
              key={quest.id}
              quest={quest}
              onUpdate={(val) => updateQuestProgress(quest.id, val)}
            />
          ))}
        </View>

        {/* Developer Sandbox Panel */}
        <SystemCard variant="purple" delay={400} className="border-gray-800 bg-black/10">
          <Pressable
            onPress={() => setDevExpanded(!devExpanded)}
            className="flex-row justify-between items-center py-3"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SystemText glow={false} className="text-gray-500 font-bold text-2xs uppercase tracking-widest">
              {devExpanded ? "▼ HIDE DEVELOPMENT SANDBOX" : "▲ SHOW DEVELOPMENT SANDBOX"}
            </SystemText>
          </Pressable>

          {devExpanded && (
            <View className="border-t border-system-purple/10 mt-3 pt-3 gap-y-3">
              <SystemText glow={false} className="text-gray-500 text-4xs leading-4">
                Use these tools to simulate dates crossing midnight and test Daily Quest completions or failure penalties.
              </SystemText>
              
              <View className="flex-row gap-x-2">
                <Pressable
                  onPress={() => handleDevMidnight(true)}
                  className="flex-1 bg-red-950/20 active:bg-red-950/40 border border-red-900/50 py-2.5 rounded-lg"
                >
                  <SystemText glow={false} className="text-center text-red-400 text-3xs font-bold uppercase tracking-wider">
                    Midnight (Fail)
                  </SystemText>
                </Pressable>
                
                <Pressable
                  onPress={() => handleDevMidnight(false)}
                  className="flex-1 bg-emerald-950/20 active:bg-emerald-950/40 border border-emerald-900/50 py-2.5 rounded-lg"
                >
                  <SystemText glow={false} className="text-center text-emerald-400 text-3xs font-bold uppercase tracking-wider">
                    Midnight (Success)
                  </SystemText>
                </Pressable>
              </View>

              {/* Evolution test buttons */}
              <View className="flex-row gap-x-2 mt-1">
                <Pressable
                  onPress={() => devGainXp(50)}
                  className="flex-1 bg-blue-950/20 active:bg-blue-950/40 border border-blue-900/50 py-2.5 rounded-lg"
                >
                  <SystemText glow={false} className="text-center text-blue-400 text-3xs font-bold uppercase tracking-wider">
                    Gain +50 XP
                  </SystemText>
                </Pressable>
                
                <Pressable
                  onPress={() => devSetLevel(4)}
                  className="flex-1 bg-amber-950/20 active:bg-amber-950/40 border border-amber-900/50 py-2.5 rounded-lg"
                >
                  <SystemText glow={false} className="text-center text-amber-400 text-3xs font-bold uppercase tracking-wider">
                    Set Level 4
                  </SystemText>
                </Pressable>

                <Pressable
                  onPress={() => devSetLevel(9)}
                  className="flex-1 bg-purple-950/20 active:bg-purple-950/40 border border-purple-900/50 py-2.5 rounded-lg"
                >
                  <SystemText glow={false} className="text-center text-purple-400 text-3xs font-bold uppercase tracking-wider">
                    Set Level 9
                  </SystemText>
                </Pressable>
              </View>

              <Pressable
                onPress={resetStore}
                className="w-full bg-blue-950/20 active:bg-blue-950/40 border border-blue-900/50 py-2.5 rounded-lg mt-1"
              >
                <SystemText glow={false} className="text-center text-blue-400 text-3xs font-bold uppercase tracking-wider">
                  Reset System State Data
                </SystemText>
              </Pressable>
            </View>
          )}
        </SystemCard>

      </ScrollView>

      {/* Reward Claim Holographic Overlay */}
      <Modal
        visible={questsCompletedToday && !rewardsClaimed}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay} className="flex-1 justify-center items-center bg-black/85 px-6">
          <Animated.View
            style={[
              styles.rewardCard,
              { shadowColor: "#00e5ff" },
              animatedOverlayStyle,
            ]}
            className="border border-system-blue/40 rounded-2xl w-full p-6 bg-cyan-950/15 relative overflow-hidden"
          >
            {/* Tech accents */}
            <View className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-blue" />
            <View className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-system-blue" />
            <View className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-system-blue" />
            <View className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-blue" />

            {/* Notification Alert */}
            <View className="items-center mb-6 border-b border-system-blue/20 pb-4">
              <SystemText
                glowColor="rgba(0, 229, 255, 0.8)"
                className="text-system-blue text-lg font-bold uppercase tracking-widest text-center"
              >
                [ DAILY MISSION COMPLETE ]
              </SystemText>
              <SystemText
                glow={false}
                className="text-system-purple/80 text-3xs font-semibold uppercase tracking-widest mt-1.5 text-center"
              >
                A Reward Has Arrived
              </SystemText>
            </View>

            <SystemText glow={false} className="text-gray-300 text-xs text-center leading-5 mb-6">
              You have completed all daily routine goals. The System has issued items and stat points to reward your self-discipline.
            </SystemText>

            {/* Rewards detail card */}
            <View className="bg-black/60 border border-system-blue/30 rounded-xl p-4 mb-6">
              <SystemText glowColor="rgba(0, 229, 255, 0.6)" className="text-system-blue text-xs font-bold uppercase tracking-widest mb-3 text-center">
                ACQUIRED REWARDS:
              </SystemText>
              
              <View className="gap-y-2">
                <View className="flex-row justify-between items-center border-b border-white/5 pb-1">
                  <SystemText glow={false} className="text-gray-400 text-2xs uppercase">Exp Points Gain</SystemText>
                  <SystemText glowColor="rgba(0, 229, 255, 0.6)" className="text-system-blue text-xs font-bold font-mono">+50 XP</SystemText>
                </View>

                <View className="flex-row justify-between items-center border-b border-white/5 pb-1">
                  <SystemText glow={false} className="text-gray-400 text-2xs uppercase">Ability Stat Points</SystemText>
                  <SystemText glowColor="rgba(0, 229, 255, 0.6)" className="text-system-blue text-xs font-bold font-mono">+3 PTS</SystemText>
                </View>

                <View className="flex-row justify-between items-center pb-1">
                  <SystemText glow={false} className="text-gray-400 text-2xs uppercase">Physical Condition</SystemText>
                  <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple text-xs font-bold font-mono">FULL RECOVERY</SystemText>
                </View>
              </View>
            </View>

            {/* Claim rewards action */}
            <SystemButton
              variant="blue"
              onPress={claimDailyRewards}
              className="w-full py-3.5 border-system-blue bg-system-blue/10 active:bg-system-blue/20"
            >
              <SystemText
                glowColor="rgba(0, 229, 255, 0.8)"
                className="text-system-blue text-xs font-bold uppercase tracking-widest"
              >
                CLAIM REWARDS
              </SystemText>
            </SystemButton>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  rewardCard: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
});
