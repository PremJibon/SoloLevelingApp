import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSystemStore } from "../../store/useSystemStore";
import { BESTIARY, LORE, BestiaryEntry, LoreEntry } from "../../store/constants";
import SystemText from "../../components/SystemText";
import SystemCard from "../../components/SystemCard";
import SystemButton from "../../components/SystemButton";

type TabType = "bestiary" | "lore";

export default function ExploreScreen() {
  const { level } = useSystemStore();
  const [activeTab, setActiveTab] = useState<TabType>("bestiary");
  const [selectedEntry, setSelectedEntry] = useState<BestiaryEntry | LoreEntry | null>(null);

  // Filter entries by player level
  const unlockedBestiary = BESTIARY.filter((e) => level >= e.firstEncounteredLevel);
  const lockedBestiary = BESTIARY.filter((e) => level < e.firstEncounteredLevel);
  const unlockedLore = LORE.filter((e) => level >= e.unlockedAtLevel);
  const lockedLore = LORE.filter((e) => level < e.unlockedAtLevel);

  // Progress stats
  const totalBestiary = BESTIARY.length;
  const totalLore = LORE.length;
  const bestiaryProgress = unlockedBestiary.length;
  const loreProgress = unlockedLore.length;

  // Rarity color mapping
  const getRankColor = (rank: string) => {
    switch (rank) {
      case "S": return "#7000ff";
      case "A": return "#f97316";
      case "B": return "#eab308";
      case "C": return "#3b82f6";
      case "D": return "#10b981";
      default: return "#6b7280";
    }
  };

  const isBestiaryEntry = (e: BestiaryEntry | LoreEntry): e is BestiaryEntry =>
    "rank" in e && "weakness" in e;

  const getEntryLevel = (e: BestiaryEntry | LoreEntry) =>
    isBestiaryEntry(e) ? e.firstEncounteredLevel : e.unlockedAtLevel;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Banner */}
        <SystemCard variant="blue" delay={0} className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-xs font-bold uppercase tracking-widest">
              System Database ({activeTab === "bestiary" ? `${bestiaryProgress}/${totalBestiary}` : `${loreProgress}/${totalLore}`})
            </SystemText>
            <SystemText className="text-gray-500 text-3xs">LV. {level} ACCESS</SystemText>
          </View>
          <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-xl font-bold uppercase tracking-wider mb-3">
            {activeTab === "bestiary" ? "Hunter's Bestiary" : "System Archives"}
          </SystemText>
          <SystemText glow={false} className="text-gray-400 text-2xs leading-4">
            {activeTab === "bestiary"
              ? "Encountered entities and their threat assessments. Higher-ranked monsters require greater player levels to access intel."
              : "Lore fragments discovered throughout your journey. Unlock more by reaching higher player levels."}
          </SystemText>
        </SystemCard>

        {/* Tab Selector */}
        <View className="flex-row mb-5 gap-x-2">
          <Pressable
            onPress={() => setActiveTab("bestiary")}
            className={`flex-1 py-2.5 rounded-lg border items-center ${
              activeTab === "bestiary"
                ? "border-system-blue/70 bg-system-blue/15"
                : "border-white/10 bg-black/30"
            }`}
          >
            <SystemText
              glow={activeTab === "bestiary"}
              glowColor="rgba(0, 229, 255, 0.7)"
              className={`text-3xs font-bold font-mono uppercase tracking-widest ${
                activeTab === "bestiary" ? "text-system-blue" : "text-gray-500"
              }`}
            >
              Bestiary
            </SystemText>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("lore")}
            className={`flex-1 py-2.5 rounded-lg border items-center ${
              activeTab === "lore"
                ? "border-system-purple/70 bg-system-purple/15"
                : "border-white/10 bg-black/30"
            }`}
          >
            <SystemText
              glow={activeTab === "lore"}
              glowColor="rgba(112, 0, 255, 0.7)"
              className={`text-3xs font-bold font-mono uppercase tracking-widest ${
                activeTab === "lore" ? "text-system-purple" : "text-gray-500"
              }`}
            >
              Lore Archives
            </SystemText>
          </Pressable>
        </View>

        {/* Global Progress Bar */}
        <View className="bg-black/40 border border-white/10 rounded-xl p-3 mb-5">
          <View className="flex-row justify-between items-center mb-1.5">
            <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-widest">
              Database Completion
            </SystemText>
            <SystemText glowColor="rgba(0, 229, 255, 0.6)" className="text-system-blue text-3xs font-bold font-mono">
              {Math.round(((bestiaryProgress + loreProgress) / (totalBestiary + totalLore)) * 100)}%
            </SystemText>
          </View>
          <View className="w-full h-2 bg-system-blue/10 border border-system-blue/20 rounded-full overflow-hidden">
            <View
              style={{ width: `${((bestiaryProgress + loreProgress) / (totalBestiary + totalLore)) * 100}%` }}
              className="h-full bg-system-blue rounded-full shadow-sm shadow-system-blue"
            />
          </View>
          <View className="flex-row justify-between mt-1">
            <SystemText glow={false} className="text-gray-600 text-5xs">
              Bestiary: {bestiaryProgress}/{totalBestiary}
            </SystemText>
            <SystemText glow={false} className="text-gray-600 text-5xs">
              Lore: {loreProgress}/{totalLore}
            </SystemText>
          </View>
        </View>

        {/* Entry List */}
        <View className="gap-y-3">
          {(activeTab === "bestiary" ? unlockedBestiary : unlockedLore).map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => setSelectedEntry(entry)}
              className="bg-black/50 border border-white/10 rounded-xl p-4 flex-row justify-between items-center"
            >
              <View className="flex-row items-center gap-x-3 flex-1 pr-3">
                {isBestiaryEntry(entry) && (
                  <View
                    style={{ borderColor: getRankColor(entry.rank), backgroundColor: `${getRankColor(entry.rank)}18` }}
                    className="w-10 h-10 border rounded-lg justify-center items-center"
                  >
                    <SystemText
                      glowColor={`${getRankColor(entry.rank)}cc`}
                      style={{ color: getRankColor(entry.rank) }}
                      className="text-sm font-bold"
                    >
                      {entry.rank}
                    </SystemText>
                  </View>
                )}
                <View className="flex-1">
                  <SystemText glow={false} className="text-white text-xs font-bold tracking-wide">
                    {isBestiaryEntry(entry) ? entry.name : entry.title}
                  </SystemText>
                  <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-wider mt-0.5">
                    {isBestiaryEntry(entry) ? `RANK ${entry.rank} THREAT` : `UNLOCKED AT LV. ${entry.unlockedAtLevel}`}
                  </SystemText>
                </View>
              </View>
              <SystemText glow={false} className="text-gray-500 text-xs">▶</SystemText>
            </Pressable>
          ))}

          {/* Locked Section */}
          {(activeTab === "bestiary" ? lockedBestiary : lockedLore).length > 0 && (
            <View className="mt-4">
            <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-widest mb-2">
              LOCKED - REQUIRE LV. {activeTab === "bestiary"
                ? Math.min(...lockedBestiary.map(e => e.firstEncounteredLevel))
                : Math.min(...lockedLore.map(e => e.unlockedAtLevel))
              }
            </SystemText>
            {(activeTab === "bestiary" ? lockedBestiary : lockedLore).map((entry) => (
              <View key={entry.id} className="flex-row items-center gap-x-3 py-2.5 opacity-40">
                <View className="w-8 h-8 border border-white/10 rounded-lg justify-center items-center">
                  <SystemText glow={false} className="text-gray-600 text-xs">🔒</SystemText>
                </View>
                <SystemText glow={false} className="text-gray-600 text-xs tracking-wide">
                  {isBestiaryEntry(entry) ? entry.name : entry.title}
                </SystemText>
              </View>
            ))}
          </View>
          )}
        </View>

        {/* Entry Detail Modal */}
        <Modal
          visible={selectedEntry !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedEntry(null)}
        >
          <View className="flex-1 bg-black/80 justify-center items-center px-6">
            <View className="bg-black/90 border border-system-blue/30 rounded-xl w-full max-w-sm p-6">
              {selectedEntry && (
                <>
                  <View className="flex-row justify-between items-center mb-4">
                    <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-sm font-bold uppercase tracking-wider">
                      {isBestiaryEntry(selectedEntry) ? selectedEntry.name : selectedEntry.title}
                    </SystemText>
                    <SystemText glow={false} className="text-gray-500 text-4xs">
                      {isBestiaryEntry(selectedEntry) ? `RANK ${selectedEntry.rank}` : `LV. ${selectedEntry.unlockedAtLevel}`}
                    </SystemText>
                  </View>
                  <SystemText glow={false} className="text-gray-300 text-xs leading-5 mb-4">
                    {isBestiaryEntry(selectedEntry) ? selectedEntry.description : selectedEntry.content}
                  </SystemText>
                  {isBestiaryEntry(selectedEntry) && (
                    <View className="bg-red-900/20 border border-red-900/30 rounded-lg p-3 mb-4">
                      <SystemText glowColor="rgba(255, 100, 100, 0.7)" className="text-red-400 text-4xs font-bold uppercase tracking-widest mb-1">
                        Weakness
                      </SystemText>
                      <SystemText glow={false} className="text-red-300/80 text-3xs leading-4">
                        {selectedEntry.weakness}
                      </SystemText>
                    </View>
                  )}
                  <SystemButton onPress={() => setSelectedEntry(null)}>
                    Close Analysis
                  </SystemButton>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
