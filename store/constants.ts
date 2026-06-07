import { Quest, SystemStats, InventoryItem, ShopItem } from "./types";

export const INITIAL_STATS: SystemStats = {
  strength: 10,
  agility: 10,
  sense: 10,
  intelligence: 10,
  vitality: 10,
};

export const INITIAL_QUESTS: Quest[] = [
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

export const SHOP_ITEMS: ShopItem[] = [
  { id: 101, name: "Strength Elixir", description: "A deep red potion that temporarily surges muscle density. Increases STR by 5 for 15 minutes.", type: "buff", rarity: "D", price: 200, stats: { strength: 5 }, durationSeconds: 900 },
  { id: 102, name: "Agility Elixir", description: "A bright green draft that accelerates nervous system response. Increases AGI by 5 for 15 minutes.", type: "buff", rarity: "D", price: 200, stats: { agility: 5 }, durationSeconds: 900 },
  { id: 103, name: "Vitality Elixir", description: "A thick blue serum that temporarily reinforces physical endurance. Increases VIT by 5 for 15 minutes.", type: "buff", rarity: "D", price: 200, stats: { vitality: 5 }, durationSeconds: 900 },
  { id: 104, name: "Intelligence Elixir", description: "A glowing clear extract that stimulates neural activity. Increases INT by 5 for 15 minutes.", type: "buff", rarity: "D", price: 200, stats: { intelligence: 5 }, durationSeconds: 900 },
  { id: 105, name: "Sense Elixir", description: "An amber drops formula that sharpens spatial awareness. Increases SEN by 5 for 15 minutes.", type: "buff", rarity: "D", price: 200, stats: { sense: 5 }, durationSeconds: 900 },
  { id: 106, name: "Shadow Rage Elixir", description: "A volatile S-rank serum that invokes absolute combat power. Increases ALL stats by 10 for 10 minutes.", type: "buff", rarity: "S", price: 800, stats: { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 }, durationSeconds: 600 },
  { id: 201, name: "E-Rank Dagger", description: "A crude iron dagger. Better than fighting bare-handed. Provides +1 Strength.", type: "weapon", rarity: "E", price: 100, stats: { strength: 1 } },
  { id: 202, name: "D-Rank Knight Sword", description: "A standard-issue broadsword used by lower-rank dungeons raid parties. Provides +3 Strength.", type: "weapon", rarity: "D", price: 300, stats: { strength: 3 } },
  { id: 203, name: "C-Rank Kasaka's Fang", description: "A dagger crafted from Kasaka's venom gland. Provides +5 Agility and +3 Strength.", type: "weapon", rarity: "C", price: 800, stats: { agility: 5, strength: 3 } },
  { id: 301, name: "B-Rank Shadow Cloak", description: "A stealth cloak woven from shadow essence. Provides +10 Vitality.", type: "armor", rarity: "B", price: 1500, stats: { vitality: 10 } },
  { id: 401, name: "A-Rank Monarch's Ring", description: "A ring vibrating with royal authority. Provides +10 Intelligence and +10 Sense.", type: "accessory", rarity: "A", price: 3000, stats: { intelligence: 10, sense: 10 } },
  { id: 501, name: "Shadow Purple Theme", description: "System cosmetic protocol shift to Monarch Purple.", type: "theme", rarity: "C", price: 500, themeId: "purple" },
  { id: 502, name: "Blood Red Theme", description: "System cosmetic protocol shift to Hunter's Blood Lust Red.", type: "theme", rarity: "A", price: 1000, themeId: "red" },
  { id: 503, name: "Nebula Gold Theme", description: "System cosmetic protocol shift to Astral Gold of the Monarchs.", type: "theme", rarity: "S", price: 2000, themeId: "gold" },
];

export interface BestiaryEntry {
  id: number;
  name: string;
  rank: string;
  description: string;
  firstEncounteredLevel: number;
  weakness: string;
}

export interface LoreEntry {
  id: number;
  title: string;
  content: string;
  unlockedAtLevel: number;
}

export const BESTIARY: BestiaryEntry[] = [
  { id: 1, name: "Kasaka the Venom Serpent", rank: "C", description: "A massive serpent mutated by concentrated mana within the C-rank dungeon. Its venom glands can be harvested for powerful dagger crafting.", firstEncounteredLevel: 1, weakness: "Vitality-based endurance — outlast its venom strikes." },
  { id: 2, name: "Ice Bear", rank: "D", description: "A frost-coated predator native to the northern dungeon biomes. Known for its thick hide and devastating paw swipes.", firstEncounteredLevel: 3, weakness: "Fire-based attacks and agility maneuvers." },
  { id: 3, name: "Shadow Soldier", rank: "B", description: "A reanimated warrior infused with shadow essence. These soldiers serve as the backbone of the Shadow Army.", firstEncounteredLevel: 5, weakness: "Light-based or purifying magic attacks." },
  { id: 4, name: "Demon Knight", rank: "A", description: "Elite soldiers of the Demon Castle. Wielding corrupted swords imbued with hellfire, they are merciless and highly disciplined.", firstEncounteredLevel: 8, weakness: "High intelligence to predict attack patterns; holy magic." },
  { id: 5, name: "The Architect", rank: "S", description: "The mysterious creator of the System Gates. Its true form is unknown, rumored to be a being of pure dimensional energy.", firstEncounteredLevel: 10, weakness: "Unknown — classified beyond S-Rank intel." },
];

export const LORE: LoreEntry[] = [
  { id: 1, title: "The Origin of the System", content: "The System materialized without warning, appearing as a translucent blue interface over the vision of select individuals known as 'Players.' Each Player receives a unique set of stats and quests tailored to their potential.", unlockedAtLevel: 1 },
  { id: 2, title: "Gates and Dungeons", content: "Gates are dimensional rifts that appear in populated areas, leading to instanced dungeon spaces. Each gate has a rank (E through S) corresponding to the difficulty of the monsters within.", unlockedAtLevel: 3 },
  { id: 3, title: "The Hunter Association", content: "A global organization established to regulate and support awakened Players. The Association assigns Hunter Ranks based on combat capability.", unlockedAtLevel: 5 },
  { id: 4, title: "Shadow Monarch Prophecy", content: "Ancient texts speak of a 'Monarch of Shadows' — a Player who transcends the limits of the System itself. They gain the ability to extract and command shadows of defeated enemies.", unlockedAtLevel: 7 },
  { id: 5, title: "The Demon Castle", content: "An S-rank gate that appeared during the first wave of awakenings. Unlike standard dungeons, it is a persistent multi-floor structure with increasingly powerful denizens.", unlockedAtLevel: 9 },
  { id: 6, title: "Beyond S-Rank — The Monarchs", content: "There exist beings beyond the S-Rank classification. True 'Monarchs' — entities of near-godlike power who rule over domains such as Shadows, Frost, Giants, and Beasts.", unlockedAtLevel: 10 },
];
