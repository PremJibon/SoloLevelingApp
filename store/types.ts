import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SystemStats {
  strength: number;
  agility: number;
  sense: number;
  intelligence: number;
  vitality: number;
}

export interface Quest {
  id: number;
  name: string;
  current: number;
  target: number;
  unit: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  type: "weapon" | "armor" | "accessory" | "potion" | "key" | "material" | "buff";
  rarity: "E" | "D" | "C" | "B" | "A" | "S";
  equipped: boolean;
  quantity: number;
  stats?: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    sense?: number;
    vitality?: number;
  };
}

export interface ActiveBuff {
  id: string;
  itemId: number;
  name: string;
  statEffects: Partial<SystemStats>;
  durationSeconds: number;
  totalDuration: number;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  type: "weapon" | "armor" | "accessory" | "potion" | "buff" | "theme";
  rarity: "E" | "D" | "C" | "B" | "A" | "S";
  price: number;
  stats?: Partial<SystemStats>;
  themeId?: "purple" | "red" | "gold";
  durationSeconds?: number;
}

export type ThemeColor = "system" | "blue" | "purple" | "red" | "gold";

export interface SystemState {
  stats: SystemStats;
  level: number;
  xp: number;
  maxXp: number;
  statPoints: number;
  playerName: string;
  gold: number;
  unlockedThemes: string[];
  currentTheme: ThemeColor;
  activeBuffs: ActiveBuff[];
  lastCompletedLevelUpdate: number;
  job: string;
  inventory: InventoryItem[];
  equippedWeaponId: number | null;
  quests: Quest[];
  questsCompletedToday: boolean;
  rewardsClaimed: boolean;
  lastActiveDate: string;
  isPenaltyActive: boolean;
  penaltySecondsRemaining: number;
  allocateStat: (statName: keyof SystemStats) => void;
  gainXp: (amount: number) => void;
  setPlayerName: (name: string) => void;
  resetStore: () => void;
  gainGold: (amount: number) => void;
  buyItem: (shopItemId: number) => { success: boolean; error?: string };
  selectTheme: (theme: ThemeColor) => void;
  tickBuffs: () => void;
  equipItem: (itemId: number) => void;
  dismissLevelUp: () => void;
  selectJob: (jobName: string) => void;
  addJobBonusStats: (bonusStats: Partial<SystemStats>) => void;
  useItem: (itemId: number) => void;
  equipWeapon: (itemId: number | null) => void;
  updateQuestProgress: (id: number, value: number) => void;
  checkDailyReset: () => void;
  acknowledgePenalty: () => void;
  claimDailyRewards: () => void;
  simulateMidnight: (forceFail: boolean) => void;
  tickPenaltyTimer: () => void;
  devSetLevel: (level: number) => void;
  devGainXp: (amount: number) => void;
  playSound?: (soundName: "levelUp" | "questComplete" | "penalty" | "buttonClick" | "purchase" | "jobChange") => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}
