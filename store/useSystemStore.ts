import { ThemeColor } from "./types";
// Constants defined locally below
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

// SHOP_ITEMS defined locally below
export const SHOP_ITEMS: ShopItem[] = [
  // Consumable Buffs
  {
    id: 101,
    name: "Strength Elixir",
    description: "A deep red potion that temporarily surges muscle density. Increases STR by 5 for 15 minutes.",
    type: "buff",
    rarity: "D",
    price: 200,
    stats: { strength: 5 },
    durationSeconds: 900,
  },
  {
    id: 102,
    name: "Agility Elixir",
    description: "A bright green draft that accelerates nervous system response. Increases AGI by 5 for 15 minutes.",
    type: "buff",
    rarity: "D",
    price: 200,
    stats: { agility: 5 },
    durationSeconds: 900,
  },
  {
    id: 103,
    name: "Vitality Elixir",
    description: "A thick blue serum that temporarily reinforces physical endurance. Increases VIT by 5 for 15 minutes.",
    type: "buff",
    rarity: "D",
    price: 200,
    stats: { vitality: 5 },
    durationSeconds: 900,
  },
  {
    id: 104,
    name: "Intelligence Elixir",
    description: "A glowing clear extract that stimulates neural activity. Increases INT by 5 for 15 minutes.",
    type: "buff",
    rarity: "D",
    price: 200,
    stats: { intelligence: 5 },
    durationSeconds: 900,
  },
  {
    id: 105,
    name: "Sense Elixir",
    description: "An amber drops formula that sharpens spatial awareness. Increases SEN by 5 for 15 minutes.",
    type: "buff",
    rarity: "D",
    price: 200,
    stats: { sense: 5 },
    durationSeconds: 900,
  },
  {
    id: 106,
    name: "Shadow Rage Elixir",
    description: "A volatile S-rank serum that invokes absolute combat power. Increases ALL stats by 10 for 10 minutes.",
    type: "buff",
    rarity: "S",
    price: 800,
    stats: { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 },
    durationSeconds: 600,
  },
  // Gear: Weapons
  {
    id: 201,
    name: "E-Rank Dagger",
    description: "A crude iron dagger. Better than fighting bare-handed. Provides +1 Strength.",
    type: "weapon",
    rarity: "E",
    price: 100,
    stats: { strength: 1 },
  },
  {
    id: 202,
    name: "D-Rank Knight Sword",
    description: "A standard-issue broadsword used by lower-rank dungeons raid parties. Provides +3 Strength.",
    type: "weapon",
    rarity: "D",
    price: 300,
    stats: { strength: 3 },
  },
  {
    id: 203,
    name: "C-Rank Kasaka's Fang",
    description: "A dagger crafted from Kasaka's venom gland. Provides +5 Agility and +3 Strength.",
    type: "weapon",
    rarity: "C",
    price: 800,
    stats: { agility: 5, strength: 3 },
  },
  // Gear: Armor
  {
    id: 301,
    name: "B-Rank Shadow Cloak",
    description: "A stealth cloak woven from shadow essence. Provides +10 Vitality.",
    type: "armor",
    rarity: "B",
    price: 1500,
    stats: { vitality: 10 },
  },
  // Gear: Accessory
  {
    id: 401,
    name: "A-Rank Monarch's Ring",
    description: "A ring vibrating with royal authority. Provides +10 Intelligence and +10 Sense.",
    type: "accessory",
    rarity: "A",
    price: 3000,
    stats: { intelligence: 10, sense: 10 },
  },
  // Themes
  {
    id: 501,
    name: "Shadow Purple Theme",
    description: "System cosmetic protocol shift to Monarch Purple. (Normally unlocks at Level 10)",
    type: "theme",
    rarity: "C",
    price: 500,
    themeId: "purple",
  },
  {
    id: 502,
    name: "Blood Red Theme",
    description: "System cosmetic protocol shift to Hunter's Blood Lust Red.",
    type: "theme",
    rarity: "A",
    price: 1000,
    themeId: "red",
  },
  {
    id: 503,
    name: "Nebula Gold Theme",
    description: "System cosmetic protocol shift to Astral Gold of the Monarchs.",
    type: "theme",
    rarity: "S",
    price: 2000,
    themeId: "gold",
  },
];

export interface SystemState {
  stats: SystemStats;
  level: number;
  xp: number;
  maxXp: number;
  statPoints: number;
  playerName: string;
  
  // Economy & Cosmetics
  gold: number;
  unlockedThemes: string[];
  currentTheme: "system" | "blue" | "purple" | "red" | "gold";
  activeBuffs: ActiveBuff[];
  
  // Evolution & Job State
  lastCompletedLevelUpdate: number;
  job: string;
  inventory: InventoryItem[];
  equippedWeaponId: number | null;

  // Quests state
  quests: Quest[];
  questsCompletedToday: boolean;
  rewardsClaimed: boolean;
  lastActiveDate: string;
  isPenaltyActive: boolean;
  penaltySecondsRemaining: number;

  // Actions
  allocateStat: (statName: keyof SystemStats) => void;
  gainXp: (amount: number) => void;
  setPlayerName: (name: string) => void;
  resetStore: () => void;
  
  // Economy & shop actions
  gainGold: (amount: number) => void;
  buyItem: (shopItemId: number) => { success: boolean; error?: string };
  selectTheme: (theme: "system" | "blue" | "purple" | "red" | "gold") => void;
  tickBuffs: () => void;
  equipItem: (itemId: number) => void;
  
  // Evolution actions
  dismissLevelUp: () => void;
  selectJob: (jobName: string) => void;
  addJobBonusStats: (bonusStats: Partial<SystemStats>) => void;
  useItem: (itemId: number) => void;
  equipWeapon: (itemId: number | null) => void;
  
  // Quest Actions
  updateQuestProgress: (id: number, value: number) => void;
  checkDailyReset: () => void;
  acknowledgePenalty: () => void;
  claimDailyRewards: () => void;
  simulateMidnight: (forceFail: boolean) => void;
  tickPenaltyTimer: () => void;

  // Developer actions
  devSetLevel: (level: number) => void;
  devGainXp: (amount: number) => void;

  // Audio actions
  playSound?: (soundName: "levelUp" | "questComplete" | "penalty" | "buttonClick" | "purchase" | "jobChange") => void;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const INITIAL_STATS: SystemStats = {
  strength: 10,
  agility: 10,
  sense: 10,
  intelligence: 10,
  vitality: 10,
};

const INITIAL_QUESTS: Quest[] = [
  { id: 1, name: "Push-ups", current: 0, target: 100, unit: "reps" },
  { id: 2, name: "Sit-ups", current: 0, target: 100, unit: "reps" },
  { id: 3, name: "Running", current: 0, target: 10, unit: "km" },
  { id: 4, name: "Squats", current: 0, target: 100, unit: "reps" },
];

export const STARTER_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: "Kasaka's Venom Fang",
    description: "A dagger made from the fang of Kasaka. Increases Agility by 5 and Strength by 3.",
    type: "weapon",
    rarity: "C",
    equipped: false,
    quantity: 1,
    stats: { agility: 5, strength: 3 },
  },
  {
    id: 2,
    name: "Elixir of Life",
    description: "A mystical potion. Fully restores HP and clears all fatigue.",
    type: "potion",
    rarity: "A",
    equipped: false,
    quantity: 3,
  },
  {
    id: 3,
    name: "Demon Castle Key",
    description: "An S-rank key that permits entry into the Demon Castle dungeon.",
    type: "key",
    rarity: "S",
    equipped: false,
    quantity: 1,
  },
];

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      stats: { ...INITIAL_STATS },
      level: 1,
      xp: 0,
      maxXp: 100,
      statPoints: 5,
      playerName: "",
      
      // Economy & Cosmetics init
      gold: 500,
      unlockedThemes: ["blue"],
      currentTheme: "system",
      activeBuffs: [],
      
      // Evolution init
      lastCompletedLevelUpdate: 1,
      job: "NONE",
      inventory: [],
      equippedWeaponId: null,
      
      // Quests initial state
      quests: INITIAL_QUESTS.map((q) => ({ ...q })),
      questsCompletedToday: false,
      rewardsClaimed: false,
      lastActiveDate: "",
      isPenaltyActive: false,
      penaltySecondsRemaining: 0,

      allocateStat: (statName) => {
        set((state) => {
          if (state.statPoints <= 0) return state;
          return {
            stats: {
              ...state.stats,
              [statName]: state.stats[statName] + 1,
            },
            statPoints: state.statPoints - 1,
          };
        });
      },

      gainXp: (amount) => {
        set((state) => {
          let newXp = state.xp + amount;
          let newLevel = state.level;
          let newMaxXp = state.maxXp;
          let addedPoints = 0;

          // Level up logic (with XP carry over)
          while (newXp >= newMaxXp) {
            newXp -= newMaxXp;
            newLevel += 1;
            // Scale max XP required
            newMaxXp = Math.floor(newMaxXp * 1.25);
            // Award 5 stat points per level up
            addedPoints += 5;
          }

          let newInventory = [...state.inventory];
          // Pre-populate inventory when level 10 is reached
          if (newLevel >= 10 && state.inventory.length === 0) {
            newInventory = STARTER_ITEMS.map((item) => ({ ...item }));
          }

          return {
            xp: newXp,
            level: newLevel,
            maxXp: newMaxXp,
            statPoints: state.statPoints + addedPoints,
            inventory: newInventory,
          };
        });
      },

      setPlayerName: (name) => {
        set({ playerName: name.trim() });
      },

      resetStore: () => {
        set({
          stats: { ...INITIAL_STATS },
          level: 1,
          xp: 0,
          maxXp: 100,
          statPoints: 5,
          playerName: "",
          gold: 500,
          unlockedThemes: ["blue"],
          currentTheme: "system",
          activeBuffs: [],
          lastCompletedLevelUpdate: 1,
          job: "NONE",
          inventory: [],
          equippedWeaponId: null,
          quests: INITIAL_QUESTS.map((q) => ({ ...q })),
          questsCompletedToday: false,
          rewardsClaimed: false,
          lastActiveDate: "",
          isPenaltyActive: false,
          penaltySecondsRemaining: 0,
        });
      },

      gainGold: (amount) => {
        set((state) => ({ gold: state.gold + amount }));
      },

      buyItem: (shopItemId) => {
        let result: { success: boolean; error?: string } = { success: false };
        set((state) => {
          const shopItem = SHOP_ITEMS.find((si) => si.id === shopItemId);
          if (!shopItem) {
            result = { success: false, error: "Item not found in shop database." };
            return state;
          }

          if (state.gold < shopItem.price) {
            result = { success: false, error: "Insufficient Gold." };
            return state;
          }

          // Handle Theme purchases
          if (shopItem.type === "theme") {
            const themeId = shopItem.themeId!;
            const alreadyUnlocked = state.unlockedThemes.includes(themeId);
            if (alreadyUnlocked) {
              result = { success: false, error: "Theme already purchased." };
              return state;
            }

            result = { success: true, error: undefined };
            return {
              gold: state.gold - shopItem.price,
              unlockedThemes: [...state.unlockedThemes, themeId],
              currentTheme: themeId, // Auto-equip the purchased theme
            };
          }

          // Handle gear/consumables purchases
          // Add to inventory
          const existingItemIndex = state.inventory.findIndex((item) => item.id === shopItemId);
          let updatedInventory = [...state.inventory];

          if (existingItemIndex > -1) {
            // Already exists, increment quantity
            updatedInventory[existingItemIndex] = {
              ...updatedInventory[existingItemIndex],
              quantity: updatedInventory[existingItemIndex].quantity + 1,
            };
          } else {
            // Create new inventory item from shop item
            updatedInventory.push({
              id: shopItem.id,
              name: shopItem.name,
              description: shopItem.description,
              type: shopItem.type as any,
              rarity: shopItem.rarity,
              equipped: false,
              quantity: 1,
              stats: shopItem.stats as any,
            });
          }

          result = { success: true, error: undefined };
          return {
            gold: state.gold - shopItem.price,
            inventory: updatedInventory,
          };
        });
        return result;
      },

      selectTheme: (theme) => {
        set((state) => {
          if (theme === "system" || state.unlockedThemes.includes(theme)) {
            return { currentTheme: theme };
          }
          return state;
        });
      },

      tickBuffs: () => {
        set((state) => {
          const activeBuffs = state.activeBuffs || [];
          if (activeBuffs.length === 0) return state;

          const updatedBuffs = activeBuffs
            .map((buff) => ({
              ...buff,
              durationSeconds: buff.durationSeconds - 1,
            }))
            .filter((buff) => buff.durationSeconds > 0);

          return {
            activeBuffs: updatedBuffs,
          };
        });
      },

      equipItem: (itemId) => {
        set((state) => {
          const itemToEquip = state.inventory.find((item) => item.id === itemId);
          if (!itemToEquip) return state;

          const itemType = itemToEquip.type;
          if (itemType !== "weapon" && itemType !== "armor" && itemType !== "accessory") {
            return state;
          }

          const isCurrentlyEquipped = itemToEquip.equipped;

          const updatedInventory = state.inventory.map((item) => {
            if (item.id === itemId) {
              return { ...item, equipped: !isCurrentlyEquipped };
            }
            // If equipping this, unequip other items of the same category
            if (!isCurrentlyEquipped && item.type === itemType) {
              return { ...item, equipped: false };
            }
            return item;
          });

          let newEquippedWeaponId = state.equippedWeaponId;
          if (itemType === "weapon") {
            newEquippedWeaponId = !isCurrentlyEquipped ? itemId : null;
          }

          return {
            inventory: updatedInventory,
            equippedWeaponId: newEquippedWeaponId,
          };
        });
      },

      dismissLevelUp: () => {
        set((state) => ({
          lastCompletedLevelUpdate: state.level,
        }));
      },

      selectJob: (jobName) => {
        set({ job: jobName });
      },

      addJobBonusStats: (bonusStats) => {
        set((state) => {
          const newStats = { ...state.stats };
          (Object.keys(bonusStats) as (keyof SystemStats)[]).forEach((key) => {
            if (bonusStats[key]) {
              newStats[key] += bonusStats[key]!;
            }
          });
          return { stats: newStats };
        });
      },

      useItem: (itemId) => {
        set((state) => {
          const itemToUse = state.inventory.find((item) => item.id === itemId);
          if (!itemToUse || itemToUse.quantity <= 0) return state;

          let updatedInventory = [...state.inventory];
          let updatedActiveBuffs = [...(state.activeBuffs || [])];

          if (itemToUse.type === "potion") {
            // Restore potion usage
            updatedInventory = state.inventory.map((item) => {
              if (item.id === itemId) {
                return { ...item, quantity: Math.max(0, item.quantity - 1) };
              }
              return item;
            }).filter((item) => item.quantity > 0);
          } else if (itemToUse.type === "buff") {
            const shopMatch = SHOP_ITEMS.find((si) => si.id === itemId);
            if (shopMatch && shopMatch.stats && shopMatch.durationSeconds) {
              const newBuff = {
                id: `${itemId}_${Date.now()}`,
                itemId: itemId,
                name: itemToUse.name,
                statEffects: shopMatch.stats,
                durationSeconds: shopMatch.durationSeconds,
                totalDuration: shopMatch.durationSeconds,
              };
              updatedActiveBuffs.push(newBuff);

              // Consume 1 qty
              updatedInventory = state.inventory.map((item) => {
                if (item.id === itemId) {
                  return { ...item, quantity: Math.max(0, item.quantity - 1) };
                }
                return item;
              }).filter((item) => item.quantity > 0);
            }
          }

          return {
            inventory: updatedInventory,
            activeBuffs: updatedActiveBuffs,
          };
        });
      },

      equipWeapon: (itemId) => {
        // Keep equipWeapon for backward compatibility
        const currentEquipItem = useSystemStore.getState().equipItem;
        if (itemId !== null) {
          currentEquipItem(itemId);
        }
      },

      updateQuestProgress: (id, value) => {
        set((state) => {
          let earnedGold = 0;
          const newQuests = state.quests.map((q) => {
            if (q.id === id) {
              const current = Math.max(0, Math.min(value, q.target));
              if (q.current < q.target && current >= q.target) {
                // Completed quest!
                earnedGold = 100;
              }
              return { ...q, current };
            }
            return q;
          });
          const allCompleted = newQuests.every((q) => q.current >= q.target);
          return {
            quests: newQuests,
            questsCompletedToday: allCompleted,
            gold: state.gold + earnedGold,
          };
        });
      },

      checkDailyReset: () => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => {
          if (!state.lastActiveDate) {
            return {
              lastActiveDate: today,
            };
          }

          if (state.lastActiveDate !== today) {
            const allCompleted = state.quests.every((q) => q.current >= q.target);
            if (!allCompleted && !state.questsCompletedToday) {
              return {
                isPenaltyActive: true,
                penaltySecondsRemaining: 14400,
                quests: INITIAL_QUESTS.map((q) => ({ ...q })),
                questsCompletedToday: false,
                rewardsClaimed: false,
                lastActiveDate: today,
              };
            } else {
              return {
                quests: INITIAL_QUESTS.map((q) => ({ ...q })),
                questsCompletedToday: false,
                rewardsClaimed: false,
                lastActiveDate: today,
                isPenaltyActive: false,
                penaltySecondsRemaining: 0,
              };
            }
          }
          return state;
        });
      },

      acknowledgePenalty: () => {
        set((state) => ({
          isPenaltyActive: false,
          penaltySecondsRemaining: 0,
          quests: INITIAL_QUESTS.map((q) => ({ ...q })),
          questsCompletedToday: false,
          rewardsClaimed: false,
        }));
      },

      claimDailyRewards: () => {
        set((state) => {
          if (state.questsCompletedToday && !state.rewardsClaimed) {
            let newXp = state.xp + 50;
            let newLevel = state.level;
            let newMaxXp = state.maxXp;
            let addedPoints = 3;

            while (newXp >= newMaxXp) {
              newXp -= newMaxXp;
              newLevel += 1;
              newMaxXp = Math.floor(newMaxXp * 1.25);
              addedPoints += 5;
            }

            let newInventory = [...state.inventory];
            if (newLevel >= 10 && state.inventory.length === 0) {
              newInventory = STARTER_ITEMS.map((item) => ({ ...item }));
            }

            return {
              xp: newXp,
              level: newLevel,
              maxXp: newMaxXp,
              statPoints: state.statPoints + addedPoints,
              rewardsClaimed: true,
              inventory: newInventory,
              gold: state.gold + 500, // +500 Gold reward
            };
          }
          return state;
        });
      },

      simulateMidnight: (forceFail) => {
        set((state) => {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          
          let updatedQuests = state.quests;
          let completedToday = state.questsCompletedToday;
          
          if (forceFail) {
            updatedQuests = state.quests.map((q) => ({
              ...q,
              current: Math.floor(q.target * 0.4),
            }));
            completedToday = false;
          } else {
            updatedQuests = state.quests.map((q) => ({
              ...q,
              current: q.target,
            }));
            completedToday = true;
          }
          
          return {
            lastActiveDate: yesterday,
            quests: updatedQuests,
            questsCompletedToday: completedToday,
          };
        });
      },

      tickPenaltyTimer: () => {
        set((state) => {
          if (state.isPenaltyActive && state.penaltySecondsRemaining > 0) {
            return {
              penaltySecondsRemaining: state.penaltySecondsRemaining - 1,
            };
          }
          return state;
        });
      },

      devSetLevel: (level) => {
        set((state) => {
          let newMaxXp = 100;
          for (let i = 1; i < level; i++) {
            newMaxXp = Math.floor(newMaxXp * 1.25);
          }

          let newInventory = [...state.inventory];
          if (level >= 10 && state.inventory.length === 0) {
            newInventory = STARTER_ITEMS.map((item) => ({ ...item }));
          }

          return {
            level,
            xp: 0,
            maxXp: newMaxXp,
            inventory: newInventory,
          };
        });
      },

      devGainXp: (amount) => {
        // Alias to gainXp
        const currentGainXp = useSystemStore.getState().gainXp;
        currentGainXp(amount);
      },

      playSound: () => {
        // Sound playback handled by useSound() hook - injected at runtime
        if (__DEV__) {
          console.log("[SOUND] Play triggered (no-op until useSound hook is active)");
        }
      },

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "solo-leveling-system-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("[SYSTEM] Hydration failed:", error);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);

