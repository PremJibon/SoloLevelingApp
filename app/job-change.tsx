import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSystemStore } from "../store/useSystemStore";
import { SystemText } from "../components/SystemText";
import { SystemButton } from "../components/SystemButton";
import { SystemCard } from "../components/SystemCard";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";

interface JobOption {
  id: string;
  name: string;
  subTitle: string;
  description: string;
  bonuses: string[];
  rank: string;
  color: string;
  glow: string;
}

const JOBS: JobOption[] = [
  {
    id: "Shadow Monarch",
    name: "SHADOW MONARCH",
    subTitle: "Monarch of Shadows",
    description: "Summon the shadows of defeated soldiers. Gain absolute dominion over life and death.",
    bonuses: ["Intelligence +10", "Sense +5", "Unlock Shadow Army Extraction"],
    rank: "S-RANK (LEGENDARY)",
    color: "#7000ff",
    glow: "rgba(112, 0, 255, 0.8)",
  },
  {
    id: "Shadow Assassin",
    name: "SHADOW ASSASSIN",
    subTitle: "Dagger & Stealth Specialist",
    description: "Conceal presence and strike from darkness. Focus on swift movement and fatal strikes.",
    bonuses: ["Agility +10", "Strength +5", "Unlock Stealth & Critical Strike Boost"],
    rank: "A-RANK (ELITE)",
    color: "#00e5ff",
    glow: "rgba(0, 229, 255, 0.8)",
  },
  {
    id: "Shadow Vanguard",
    name: "SHADOW VANGUARD",
    subTitle: "Heavy Knight Path",
    description: "Lead from the front. High defense, massive crowd control, and unmatched physical resilience.",
    bonuses: ["Vitality +10", "Strength +5", "Unlock Iron Wall Aura & Taunt"],
    rank: "A-RANK (ELITE)",
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.8)",
  },
  {
    id: "Shadow Sorcerer",
    name: "SHADOW SORCERER",
    subTitle: "Dimensional Magic Caster",
    description: "Manipulate gravity and spatial magic. Channel dimensional spellcraft to disintegrate targets.",
    bonuses: ["Intelligence +10", "Vitality +5", "Unlock Spatial Rift & Dark Nova"],
    rank: "A-RANK (ELITE)",
    color: "#a855f7",
    glow: "rgba(168, 85, 247, 0.8)",
  },
];

export default function JobChangeScreen() {
  const router = useRouter();
  const { selectJob, addJobBonusStats } = useSystemStore();
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Animations
  const syncOpacity = useSharedValue(0);
  const syncScale = useSharedValue(0.9);
  const syncPulse = useSharedValue(1);

  const handleSelect = (job: JobOption) => {
    setSelectedJob(job);
  };

  const handleConfirm = () => {
    if (!selectedJob) return;
    setIsSyncing(true);
    setSyncProgress(0);

    // Fade in sync screen
    syncOpacity.value = withTiming(1, { duration: 300 });
    syncScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.back()) });
    
    // Heartbeat pulse for sync portal
    syncPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Progress counter
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 5;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(interval);
        
        // Execute the job selection
        selectJob(selectedJob.name);

        // Apply bonus stats directly as an immersive effect!
        if (selectedJob.id === "Shadow Monarch") {
          addJobBonusStats({ intelligence: 10, sense: 5 });
        } else if (selectedJob.id === "Shadow Sorcerer") {
          addJobBonusStats({ intelligence: 10, vitality: 5 });
        } else if (selectedJob.id === "Shadow Assassin") {
          addJobBonusStats({ agility: 10, strength: 5 });
        } else if (selectedJob.id === "Shadow Vanguard") {
          addJobBonusStats({ vitality: 10, strength: 5 });
        }

        setTimeout(() => {
          syncOpacity.value = withTiming(0, { duration: 300 });
          syncScale.value = withTiming(0.95, { duration: 300 });
          setTimeout(() => {
            router.back();
          }, 300);
        }, 800);
      }
      setSyncProgress(currentPct);
    }, 120);
  };

  const animatedSyncStyle = useAnimatedStyle(() => {
    return {
      opacity: syncOpacity.value,
      transform: [
        { scale: syncScale.value * syncPulse.value },
      ],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Navigation */}
        <View className="flex-row items-center mb-6">
          <SystemButton
            variant="purple"
            onPress={() => router.back()}
            className="px-3.5 py-1.5 rounded-md mr-4 border-system-purple/50 bg-system-purple/10"
          >
            {"◀ BACK"}
          </SystemButton>
          <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xl font-bold uppercase tracking-widest">
            Job Change
          </SystemText>
        </View>

        {/* Intro */}
        <SystemCard variant="purple" delay={0} className="mb-6">
          <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple font-bold text-sm uppercase tracking-widest mb-1.5">
            [ AWAKENED SPECIALIZATION SELECTION ]
          </SystemText>
          <SystemText glow={false} className="text-gray-400 text-xs leading-5">
            The Player has reached Level 5, unlocking class specialization pathways. Select a specialization class carefully. Upon selection, permanent class stat multipliers and passive abilities will merge with your parameters.
          </SystemText>
        </SystemCard>

        {/* Job List */}
        <View className="gap-y-4">
          {JOBS.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            return (
              <Pressable
                key={job.id}
                onPress={() => handleSelect(job)}
                android_ripple={{ color: `${job.color}20`, borderless: false }}
                style={[
                  styles.jobCard,
                  isSelected && {
                    borderColor: job.color,
                    shadowColor: job.color,
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                  },
                ]}
                className={`border ${
                  isSelected ? "bg-black/80" : "border-white/10 bg-black/40"
                } rounded-2xl p-5 relative overflow-hidden`}
              >
                {/* Visual highlights */}
                {isSelected && (
                  <>
                    <View style={{ borderColor: job.color }} className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" />
                    <View style={{ borderColor: job.color }} className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" />
                    <View style={{ borderColor: job.color }} className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" />
                    <View style={{ borderColor: job.color }} className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" />
                  </>
                )}

                {/* Rank and Title */}
                <View className="flex-row justify-between items-center mb-2">
                  <SystemText glowColor={job.glow} className="text-md font-extrabold font-mono tracking-wider text-white">
                    {job.name}
                  </SystemText>
                  <SystemText glow={false} style={{ color: job.color }} className="text-4xs font-bold uppercase tracking-widest">
                    {job.rank}
                  </SystemText>
                </View>

                {/* Subtitle */}
                <SystemText glow={false} className="text-gray-500 text-3xs font-mono mb-3 uppercase">
                  {job.subTitle}
                </SystemText>

                {/* Description */}
                <SystemText glow={false} className="text-gray-300 text-xs leading-4 mb-4">
                  {job.description}
                </SystemText>

                {/* Bonuses */}
                <View className="bg-black/60 rounded-xl p-3 border border-white/5">
                  <SystemText glow={false} className="text-gray-400 text-3xs font-bold uppercase tracking-widest mb-1.5">
                    CLASS MERGE REWARDS:
                  </SystemText>
                  <View className="gap-y-1">
                    {job.bonuses.map((bonus, bidx) => (
                      <View key={bidx} className="flex-row items-center">
                        <SystemText glow={false} style={{ color: job.color }} className="text-3xs font-extrabold mr-1.5">
                          ✓
                        </SystemText>
                        <SystemText glow={false} className="text-gray-400 text-3xs font-mono uppercase">
                          {bonus}
                        </SystemText>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Submit */}
        {selectedJob && (
          <SystemButton
            variant="purple"
            onPress={handleConfirm}
            className="w-full py-4 mt-6"
          >
            CONFIRM CLASS CHOSEN
          </SystemButton>
        )}
      </ScrollView>

      {/* Full-screen Sync Modal overlay */}
      {isSyncing && selectedJob && (
        <Animated.View
          style={[styles.syncOverlay, animatedSyncStyle]}
          className="absolute inset-0 bg-black/95 z-[999999] justify-center items-center px-6"
        >
          <View
            style={[styles.portalBox, { shadowColor: selectedJob.color }]}
            className="w-full max-w-[320px] border border-white/10 rounded-2xl p-6 bg-black/95 relative items-center"
          >
            {/* Holographic tech marks */}
            <View style={{ borderColor: selectedJob.color }} className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" />
            <View style={{ borderColor: selectedJob.color }} className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" />
            <View style={{ borderColor: selectedJob.color }} className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" />
            <View style={{ borderColor: selectedJob.color }} className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" />

            <SystemText
              glowColor={selectedJob.glow}
              className="text-white text-md font-bold tracking-widest text-center uppercase mb-6"
            >
              [ JOB INTEGRATION ACTIVE ]
            </SystemText>

            {/* Glowing circular tech portal indicator */}
            <View style={[styles.glowPortal, { borderColor: selectedJob.color, shadowColor: selectedJob.color }]} className="w-24 h-24 rounded-full border-2 justify-center items-center mb-6">
              <SystemText
                glowColor={selectedJob.glow}
                className="text-lg font-bold font-mono text-white"
              >
                {syncProgress}%
              </SystemText>
            </View>

            <SystemText glow={false} className="text-gray-400 text-3xs font-mono text-center mb-6 leading-4 max-w-[200px]">
              {"SYNCHRONIZING PLAYER'S CONSCIOUSNESS TO '" + selectedJob.name + "' PATHWAY..."}
            </SystemText>

            <View className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <View
                style={{ width: `${syncProgress}%`, backgroundColor: selectedJob.color }}
                className="h-full rounded-full"
              />
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  jobCard: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  syncOverlay: {
    width: "100%",
    height: "100%",
  },
  portalBox: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  glowPortal: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});
