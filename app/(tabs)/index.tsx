import React, { useState } from "react";
import { View, ScrollView, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSystemStore, SystemStats } from "../../store/useSystemStore";
import { SystemText } from "../../components/SystemText";
import { SystemButton } from "../../components/SystemButton";
import { SystemCard } from "../../components/SystemCard";

export default function HomeScreen() {
  const router = useRouter();
  
  // Use Zustand system store
  const {
    stats: storeStats,
    level,
    xp,
    maxXp,
    statPoints,
    allocateStat,
    playerName,
    setPlayerName,
    quests,
    job,
    inventory,
    equippedWeaponId,
  } = useSystemStore();
  const [nameInput, setNameInput] = useState("");

  const safeInventory = inventory || [];
  const safeJob = job || "NONE";
  const safePlayerName = playerName || "";

  const equippedWeapon = safeInventory.find((i) => i.id === equippedWeaponId && i.equipped);

  const statsList = [
    { name: "STR", value: storeStats.strength, bonus: equippedWeapon?.stats?.strength || 0, description: "Strength - Physical Power", key: "strength" as keyof SystemStats },
    { name: "VIT", value: storeStats.vitality, bonus: equippedWeapon?.stats?.vitality || 0, description: "Vitality - Stamina & HP", key: "vitality" as keyof SystemStats },
    { name: "AGI", value: storeStats.agility, bonus: equippedWeapon?.stats?.agility || 0, description: "Agility - Speed & Reflexes", key: "agility" as keyof SystemStats },
    { name: "INT", value: storeStats.intelligence, bonus: equippedWeapon?.stats?.intelligence || 0, description: "Intelligence - Mana & Perception", key: "intelligence" as keyof SystemStats },
    { name: "SEN", value: storeStats.sense, bonus: equippedWeapon?.stats?.sense || 0, description: "Sense - Threat Detection", key: "sense" as keyof SystemStats },
  ];

  // Dynamic Hunter Rank
  const getHunterRank = () => {
    if (level >= 10) return "S-RANK (SHADOW MONARCH)";
    if (level >= 5) return "D-RANK HUNTER";
    return "E-RANK HUNTER";
  };

  // Calculate total quest progress
  const totalQuests = quests.length;
  const completedQuests = quests.filter((q) => q.current >= q.target).length;
  const allQuestsCompleted = completedQuests === totalQuests;
  const questProgressPct = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  // If playerName is not set, force name registration
  if (!playerName) {
    return (
        <SafeAreaView className="flex-1 bg-background justify-center px-6">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
        <SystemCard variant="blue" delay={0}>
          <View className="items-center mb-6">
            <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-xl font-bold uppercase tracking-widest text-center mb-2">
              [ SYSTEM NOTICE ]
            </SystemText>
            <SystemText className="text-system-purple/70 text-2xs uppercase tracking-widest text-center">
              PLAYER REGISTRATION REQUIRED
            </SystemText>
          </View>
          
          <SystemText glow={false} className="text-gray-400 text-xs text-center mb-6 leading-5">
            The System has detected an unregistered entity. Please input your name to begin system integration and status tracking.
          </SystemText>
          
          {/* Text Input for Player Name */}
          <View className="border border-system-blue/40 rounded-lg p-3 bg-black/50 mb-6 flex-row items-center">
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="ENTER PLAYER NAME..."
              placeholderTextColor="rgba(0, 229, 255, 0.3)"
              className="flex-1 text-white font-mono text-sm uppercase px-1 py-1"
              maxLength={20}
              autoCapitalize="characters"
            />
          </View>
          
          <SystemButton
            variant="blue"
            active={nameInput.trim().length > 0}
            disabled={nameInput.trim().length === 0}
            onPress={() => {
              if (nameInput.trim().length > 0) {
                setPlayerName(nameInput.trim());
              }
            }}
            className="w-full py-3"
          >
            CONFIRM INTEGRATION
          </SystemButton>
        </SystemCard>
          </ScrollView>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        className="flex-1 px-4 py-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Job Change Unlock Promo Card */}
        {level >= 5 && safeJob === "NONE" && (
          <SystemCard variant="purple" delay={0} className="mb-6 border-system-purple/60 bg-purple-950/10">
            <View className="items-center py-1">
              <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-base font-bold uppercase tracking-widest text-center mb-1">
                ⚠️ JOB CHANGE DETECTED ⚠️
              </SystemText>
              <SystemText glow={false} className="text-gray-400 text-3xs font-mono uppercase tracking-widest text-center mb-4 leading-4">
                A specialization path has opened. Claim your class parameters.
              </SystemText>
              <SystemButton
                variant="purple"
                onPress={() => router.push("/job-change")}
                className="w-full py-3 border-system-purple bg-system-purple/20 active:bg-system-purple/40"
              >
                ACQUIRE SPECIALIZATION
              </SystemButton>
            </View>
          </SystemCard>
        )}

        {/* Header Profile Section */}
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

        {/* Status Window - Grid Layout */}
        <SystemCard variant="blue" delay={250} className="mb-6">
          {/* Header */}
          <View className="border-b border-system-blue/20 pb-3 mb-4 flex-row justify-between items-center">
            <SystemText className="text-system-blue text-lg font-bold uppercase tracking-wider">
              Status Window
            </SystemText>
            {statPoints > 0 && (
              <View className="bg-system-purple/20 border border-system-purple/60 px-2 py-1 rounded">
                <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple text-2xs font-bold">
                  POINTS: {statPoints}
                </SystemText>
              </View>
            )}
          </View>

          {/* Stats Rows */}
          <View className="gap-y-3">
            {statsList.map((stat) => (
              <View key={stat.name} className="flex-row items-center justify-between border-b border-system-purple/5 pb-2">
                <View className="flex-row items-center gap-x-2">
                  <SystemText className="text-system-blue font-bold text-sm w-10">
                    {stat.name}
                  </SystemText>
                  <SystemText glow={false} className="text-gray-400 text-xs">
                    {stat.description.split(" - ")[1]}
                  </SystemText>
                </View>

                <View className="flex-row items-center gap-x-3">
                  <View className="flex-row items-baseline gap-x-1">
                    <SystemText className="text-system-purple font-bold text-sm">
                      {stat.value + stat.bonus}
                    </SystemText>
                    {stat.bonus > 0 && (
                      <SystemText glow={false} className="text-emerald-400 text-4xs font-bold font-mono">
                        (+{stat.bonus})
                      </SystemText>
                    )}
                  </View>
                  {statPoints > 0 ? (
                    <SystemButton
                      variant="blue"
                      active={true}
                      onPress={() => allocateStat(stat.key)}
                      className="w-11 h-11 p-0 rounded-md"
                    >
                      +
                    </SystemButton>
                  ) : (
                    <View className="w-11 h-11 bg-transparent" />
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Navigation Button to Full Status Window */}
          <SystemButton
            variant="blue"
            active={statPoints > 0}
            onPress={() => router.push("/status")}
            className="mt-4 py-2 border-system-blue/30 rounded-lg"
          >
            VIEW FULL STATUS WINDOW
          </SystemButton>
        </SystemCard>

        {/* Daily Quest Summary / Overview Card */}
        <SystemCard variant="purple" delay={500} className="mb-6">
          <View className="border-b border-system-purple/20 pb-3 mb-4 flex-row justify-between items-center">
            <View>
              <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple text-2xs uppercase tracking-widest">
                Daily Mission
              </SystemText>
              <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple text-md font-bold uppercase tracking-wider">
                Courage of the Weak
              </SystemText>
            </View>
            <View className="items-end">
              <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple font-bold text-sm">
                {completedQuests} / {totalQuests}
              </SystemText>
            </View>
          </View>

          <View className="mb-4">
            <SystemText glow={false} className="text-gray-400 text-xs leading-5 mb-3">
              Maintain daily training to increase your capabilities. Failure to complete the daily system requirements will trigger a severe penalty.
            </SystemText>

            {/* Total Quest Progress Bar */}
            <View className="w-full h-2.5 bg-system-purple/10 rounded-full overflow-hidden border border-system-purple/20">
              <View
                style={{ width: `${questProgressPct}%` }}
                className={`h-full rounded-full ${allQuestsCompleted ? "bg-system-blue" : "bg-system-purple"}`}
              />
            </View>
            <View className="flex-row justify-between items-center mt-1.5">
              <SystemText className="text-gray-500 text-3xs uppercase">TOTAL PROGRESS</SystemText>
              <SystemText glowColor={allQuestsCompleted ? "rgba(0,229,255,0.6)" : "rgba(112,0,255,0.6)"} className={`text-2xs font-bold font-mono ${allQuestsCompleted ? "text-system-blue" : "text-system-purple"}`}>
                {questProgressPct}%
              </SystemText>
            </View>
          </View>

          {/* Go to Quests tab */}
          <SystemButton
            variant="purple"
            active={!allQuestsCompleted}
            onPress={() => router.push("/quests")}
            className="py-2.5 rounded-lg border-system-purple/40"
          >
            {allQuestsCompleted ? "VIEW ACTIVE QUESTS" : "BEGIN TRAINING"}
          </SystemButton>
        </SystemCard>

        {/* Sync Status Footer */}
        <View className="items-center mt-2 opacity-30">
          <View className="flex-row items-center gap-x-1.5">
            <View className="w-1 h-1 rounded-full bg-system-blue animate-pulse" />
            <SystemText glow={false} className="text-system-blue text-4xs uppercase tracking-tighter font-mono">
              System Sync Active: Local Storage Secured
            </SystemText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
