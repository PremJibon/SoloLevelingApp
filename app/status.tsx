import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSystemStore, SystemStats } from "../store/useSystemStore";
import { SystemText } from "../components/SystemText";
import { SystemButton } from "../components/SystemButton";
import { SystemCard } from "../components/SystemCard";

export default function StatusScreen() {
  const router = useRouter();
  const { stats, level, xp, maxXp, statPoints, allocateStat, resetStore, playerName, job, inventory } = useSystemStore();

  const safeInventory = inventory || [];
  const safeJob = job || "NONE";
  const safePlayerName = playerName || "";

  const equippedItems = safeInventory.filter((i) => i.equipped);

  const getStatBonus = (statKey: keyof SystemStats) => {
    return equippedItems.reduce((total, item) => {
      return total + (item.stats?.[statKey] || 0);
    }, 0);
  };

  const statItems = [
    { key: "strength" as keyof SystemStats, name: "STR", fullName: "Strength", bonus: getStatBonus("strength"), desc: "Physical power, physical striking damage, and muscle density" },
    { key: "vitality" as keyof SystemStats, name: "VIT", fullName: "Vitality", bonus: getStatBonus("vitality"), desc: "Stamina, maximum health points (HP), and physical recovery rate" },
    { key: "agility" as keyof SystemStats, name: "AGI", fullName: "Agility", bonus: getStatBonus("agility"), desc: "Movement speed, reflex responsiveness, and combat evasion" },
    { key: "intelligence" as keyof SystemStats, name: "INT", fullName: "Intelligence", bonus: getStatBonus("intelligence"), desc: "Cognitive perception, memory capacity, and mana energy pools" },
    { key: "sense" as keyof SystemStats, name: "SEN", fullName: "Sense", bonus: getStatBonus("sense"), desc: "Threat detection, environmental awareness, and combat reflexes" },
  ];

  const getHunterRank = () => {
    if (safeJob === "SHADOW MONARCH") return "S-RANK (LEGENDARY)";
    if (safeJob !== "NONE") return "A-RANK (ELITE)";
    if (level >= 10) return "S-RANK (MAX)";
    if (level >= 5) return "D-RANK HUNTER";
    return "E-RANK HUNTER";
  };

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
            variant="blue"
            onPress={() => router.back()}
            className="px-3.5 py-1.5 rounded-md mr-4"
          >
            {"◀ BACK"}
          </SystemButton>
          <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-xl font-bold uppercase tracking-widest">
            Status Window
          </SystemText>
        </View>

        {/* Profile Card */}
        <SystemCard variant="blue" delay={0} className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <SystemText className="text-system-purple text-2xs uppercase tracking-widest">
                Active Player Profile
              </SystemText>
              <SystemText className="text-system-blue text-xl font-bold">
                {safePlayerName.toUpperCase()}
              </SystemText>
              <SystemText className="text-gray-400 text-3xs font-mono uppercase tracking-wider mt-1.5">
                JOB: {safeJob}
              </SystemText>
            </View>
            <View className="items-end">
              <SystemText className="text-gray-500 text-3xs">RANK</SystemText>
              <SystemText className="text-system-blue text-xs font-bold border border-system-blue/30 px-2 py-1 rounded bg-system-blue/5">
                {getHunterRank()}
              </SystemText>
            </View>
          </View>

          {/* Level and XP progress bar */}
          <View className="border-t border-system-purple/20 pt-3">
            <View className="flex-row justify-between items-center mb-1.5">
              <SystemText className="text-system-purple font-semibold text-xs">
                LEVEL: {level}
              </SystemText>
              <SystemText className="text-system-blue/70 text-xs">
                XP: {xp}/{maxXp}
              </SystemText>
            </View>
            <View className="w-full h-1.5 bg-system-purple/10 rounded-full overflow-hidden border border-system-purple/20">
              <View
                style={{ width: `${Math.min((xp / maxXp) * 100, 100)}%` }}
                className="h-full bg-system-purple rounded-full"
              />
            </View>
          </View>
        </SystemCard>

        {/* Job Change Banner */}
        {level >= 5 && safeJob === "NONE" && (
          <View className="bg-system-purple/10 border border-system-purple/40 rounded-xl p-4 mb-6 flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple font-bold text-xs uppercase tracking-wider mb-0.5">
                Job Change Available
              </SystemText>
              <SystemText className="text-gray-400 text-3xs">
                Select your class specialization immediately.
              </SystemText>
            </View>
            <SystemButton
              variant="purple"
              active={true}
              onPress={() => router.push("/job-change")}
              className="py-1.5 px-3 rounded-lg"
            >
              CHOOSE
            </SystemButton>
          </View>
        )}

        {/* Available Points Alert */}
        {statPoints > 0 && (
          <View className="bg-system-purple/10 border border-system-purple/40 rounded-xl p-4 mb-6 flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple font-bold text-xs uppercase tracking-wider mb-0.5">
                Stat Points Available
              </SystemText>
              <SystemText className="text-gray-400 text-3xs">
                Distribute points to increase your attributes.
              </SystemText>
            </View>
            <View className="bg-system-purple/20 border border-system-purple/60 px-3.5 py-1.5 rounded-lg">
              <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-sm font-mono font-bold">
                {statPoints} PTS
              </SystemText>
            </View>
          </View>
        )}

        {/* Stats List Card */}
        <SystemCard variant="purple" delay={150} className="mb-6">
          <View className="border-b border-system-purple/20 pb-3 mb-4 flex-row justify-between items-center">
            <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-md font-bold uppercase tracking-wider">
              Ability Attributes
            </SystemText>
            <SystemText className="text-gray-400 text-3xs">
              BASE VALUE: 10
            </SystemText>
          </View>

          <View className="gap-y-4">
            {statItems.map((item) => {
              const value = stats[item.key];
              return (
                <View key={item.key} className="bg-black/20 border border-system-purple/10 rounded-lg p-3.5 flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-baseline gap-x-2 mb-1">
                      <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-sm font-bold">
                        {item.name}
                      </SystemText>
                      <SystemText className="text-gray-500 text-3xs uppercase tracking-wider">
                        {item.fullName}
                      </SystemText>
                    </View>
                    <SystemText glow={false} className="text-gray-400 text-3xs leading-4">
                      {item.desc}
                    </SystemText>
                  </View>

                  <View className="flex-row items-center gap-x-3.5">
                    <View className="flex-row items-baseline gap-x-1 min-w-[50px] justify-end">
                      <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple font-mono font-bold text-base text-right">
                        {value + item.bonus}
                      </SystemText>
                      {item.bonus > 0 && (
                        <SystemText glow={false} className="text-emerald-400 text-4xs font-bold font-mono">
                          (+{item.bonus})
                        </SystemText>
                      )}
                    </View>
                    
                    {statPoints > 0 ? (
                      <SystemButton
                        variant="purple"
                        active={true}
                        onPress={() => allocateStat(item.key)}
                        className="w-11 h-11 p-0 rounded-md border-system-purple/60"
                      >
                        +
                      </SystemButton>
                    ) : (
                      <View className="w-11 h-11" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </SystemCard>

        {/* Reset / Developer Option */}
        <SystemButton
          variant="purple"
          active={false}
          onPress={resetStore}
          className="mt-4 border-red-900 bg-red-950/20 active:bg-red-900/40 rounded-lg py-3"
        >
          <SystemText glow={false} className="text-red-400 text-xs font-bold uppercase tracking-widest">
            RESET ALL SYSTEM DATA
          </SystemText>
        </SystemButton>
      </ScrollView>
    </SafeAreaView>
  );
}
