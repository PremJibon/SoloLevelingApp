import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useSystemStore, SHOP_ITEMS, ShopItem } from "../../store/useSystemStore";
import { SystemText } from "../../components/SystemText";
import { SystemButton } from "../../components/SystemButton";
import { SystemCard } from "../../components/SystemCard";

type Category = "BUFFS" | "GEAR" | "THEMES";

const CATEGORY_TABS: Category[] = ["BUFFS", "GEAR", "THEMES"];

const RARITY_COLORS: Record<string, string> = {
  S: "#7000ff",
  A: "#f97316",
  B: "#eab308",
  C: "#3b82f6",
  D: "#10b981",
  E: "#6b7280",
};

const RARITY_GLOW: Record<string, string> = {
  S: "rgba(112, 0, 255, 0.8)",
  A: "rgba(249, 115, 22, 0.8)",
  B: "rgba(234, 179, 8, 0.6)",
  C: "rgba(59, 130, 246, 0.6)",
  D: "rgba(16, 185, 129, 0.6)",
  E: "rgba(107, 114, 128, 0.4)",
};

const THEME_COLORS: Record<string, { label: string; glow: string; hex: string; bg: string }> = {
  system: { label: "SYSTEM DEFAULT", glow: "rgba(0, 229, 255, 0.8)", hex: "#00e5ff", bg: "bg-system-blue/10" },
  blue:   { label: "SYSTEM BLUE",    glow: "rgba(0, 229, 255, 0.8)", hex: "#00e5ff", bg: "bg-system-blue/10" },
  purple: { label: "SHADOW PURPLE",  glow: "rgba(112, 0, 255, 0.8)", hex: "#7000ff", bg: "bg-system-purple/10" },
  red:    { label: "BLOOD RED",      glow: "rgba(239, 68, 68, 0.8)", hex: "#ef4444", bg: "bg-red-500/10" },
  gold:   { label: "NEBULA GOLD",    glow: "rgba(251, 191, 36, 0.8)", hex: "#fbbf24", bg: "bg-amber-400/10" },
};

function GoldFlashOverlay({ visible, amount }: { visible: boolean; amount: number }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 600 })
      );
      scale.value = withSequence(
        withSpring(1.15, { damping: 8 }),
        withTiming(0.9, { duration: 400 })
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.goldFlash, animStyle]} className="absolute inset-0 justify-center items-center z-[9999] pointer-events-none">
      <SystemText glowColor="rgba(251, 191, 36, 0.9)" className="text-amber-400 text-4xl font-bold font-mono">
        -{amount}G
      </SystemText>
    </Animated.View>
  );
}

export default function ShopScreen() {
  const {
    level,
    gold,
    inventory,
    currentTheme,
    unlockedThemes,
    buyItem,
    selectTheme,
  } = useSystemStore();

  const [activeCategory, setActiveCategory] = useState<Category>("BUFFS");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const [flashAmount, setFlashAmount] = useState(0);

  // Filter shop items by category
  const getFilteredItems = (cat: Category): ShopItem[] => {
    switch (cat) {
      case "BUFFS":  return SHOP_ITEMS.filter((i) => i.type === "buff");
      case "GEAR":   return SHOP_ITEMS.filter((i) => ["weapon", "armor", "accessory"].includes(i.type));
      case "THEMES": return SHOP_ITEMS.filter((i) => i.type === "theme");
    }
  };

  const filteredItems = getFilteredItems(activeCategory);

  const isOwned = (item: ShopItem): boolean => {
    if (item.type === "theme") {
      return unlockedThemes.includes(item.themeId ?? "");
    }
    return inventory.some((inv) => inv.id === item.id);
  };

  const handleBuy = (item: ShopItem) => {
    if (gold < item.price) {
      Alert.alert("Insufficient Gold", `You need ${item.price - gold} more Gold to purchase this item.`);
      return;
    }
    const result = buyItem(item.id);
    if (result.success) {
      setFlashAmount(item.price);
      setFlashVisible(true);
      setTimeout(() => setFlashVisible(false), 800);
      setSelectedItem(null);
    } else {
      Alert.alert("Purchase Failed", result.error ?? "Unknown error.");
    }
  };

  const handleEquipTheme = (themeId: string) => {
    selectTheme(themeId as any);
    setSelectedItem(null);
  };

  // Locked screen for level < 10
  if (level < 10) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        <SystemCard variant="blue" delay={0} className="w-full max-w-[320px] p-6 items-center">
          <View className="w-14 h-14 rounded-full border border-system-blue/40 bg-system-blue/5 justify-center items-center mb-4">
            <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-lg font-bold">
              🔒
            </SystemText>
          </View>
          <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue font-bold font-mono text-base text-center mb-3">
            [ SYSTEM SHOP LOCKED ]
          </SystemText>
          <SystemText glow={false} className="text-system-purple/70 text-3xs font-mono uppercase tracking-widest text-center leading-4 mb-4">
            Expand your hunter capabilities by reaching Level 10 to unlock the Dimensional Exchange.
          </SystemText>
          <View className="bg-black/60 border border-white/5 p-2 px-4 rounded-lg">
            <SystemText glow={false} className="text-gray-500 text-3xs font-mono">
              REQUIRED: LEVEL 10 (CURRENT: LV. {level})
            </SystemText>
          </View>
        </SystemCard>
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

        {/* Title Banner */}
        <SystemCard variant="purple" delay={0} className="mb-4">
          <View className="flex-row justify-between items-center mb-1">
            <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xs font-bold uppercase tracking-widest">
              Dimensional Exchange
            </SystemText>
            <SystemText className="text-gray-500 text-3xs">SYSTEM STORE</SystemText>
          </View>
          <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xl font-bold uppercase tracking-wider mb-2">
            Hunter's Shop
          </SystemText>
          <SystemText glow={false} className="text-gray-400 text-2xs leading-4">
            Spend accumulated Gold to purchase temporary combat buffs, weapon artifacts, and cosmetic system protocols.
          </SystemText>
        </SystemCard>

        {/* Gold Balance */}
        <View style={styles.goldCard} className="bg-amber-950/20 border border-amber-400/30 rounded-xl p-4 mb-5 flex-row justify-between items-center">
          <View>
            <SystemText glow={false} className="text-gray-500 text-3xs uppercase tracking-widest mb-0.5">
              Gold Reserve
            </SystemText>
            <SystemText
              glowColor="rgba(251, 191, 36, 0.9)"
              className="text-amber-400 text-2xl font-bold font-mono"
            >
              {gold.toLocaleString()} G
            </SystemText>
          </View>
          <View className="items-end">
            <View className="bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-lg">
              <SystemText glow={false} className="text-amber-400/70 text-3xs font-mono uppercase">
                +100G per quest
              </SystemText>
            </View>
            <SystemText glow={false} className="text-amber-400/40 text-4xs font-mono mt-1">
              +500G daily reward
            </SystemText>
          </View>
        </View>

        {/* Category Tabs */}
        <View className="flex-row mb-5 gap-x-2">
          {CATEGORY_TABS.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={activeCategory === cat ? styles.activeTab : styles.inactiveTab}
              className={`flex-1 py-2.5 rounded-lg border items-center ${
                activeCategory === cat
                  ? "border-system-purple/70 bg-system-purple/15"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <SystemText
                glow={activeCategory === cat}
                glowColor="rgba(112, 0, 255, 0.7)"
                className={`text-3xs font-bold font-mono uppercase tracking-widest ${
                  activeCategory === cat ? "text-system-purple" : "text-gray-500"
                }`}
              >
                {cat}
              </SystemText>
            </Pressable>
          ))}
        </View>

        {/* Active Theme Banner (Themes tab only) */}
        {activeCategory === "THEMES" && (
          <View className="bg-black/40 border border-white/10 rounded-xl p-3 mb-4 flex-row items-center gap-x-3">
            <View
              style={{ backgroundColor: `${THEME_COLORS[currentTheme]?.hex ?? "#00e5ff"}20`, borderColor: THEME_COLORS[currentTheme]?.hex ?? "#00e5ff" }}
              className="w-8 h-8 rounded-full border-2 items-center justify-center"
            >
              <SystemText
                glowColor={THEME_COLORS[currentTheme]?.glow}
                style={{ color: THEME_COLORS[currentTheme]?.hex }}
                className="text-4xs font-bold"
              >
                ●
              </SystemText>
            </View>
            <View>
              <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-widest">Active Protocol</SystemText>
              <SystemText
                glowColor={THEME_COLORS[currentTheme]?.glow}
                style={{ color: THEME_COLORS[currentTheme]?.hex }}
                className="text-xs font-bold font-mono uppercase"
              >
                {THEME_COLORS[currentTheme]?.label ?? "SYSTEM BLUE"}
              </SystemText>
            </View>
          </View>
        )}

        {/* Shop Item Grid */}
        <View className="gap-y-3">
          {filteredItems.map((item) => {
            const rColor = RARITY_COLORS[item.rarity] ?? "#6b7280";
            const rGlow  = RARITY_GLOW[item.rarity]  ?? "rgba(107,114,128,0.4)";
            const owned  = isOwned(item);
            const canAfford = gold >= item.price;
            const isActiveTheme = item.type === "theme" && currentTheme === item.themeId;

            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedItem(item)}
                style={[styles.itemCard, { shadowColor: rColor }]}
                className="bg-black/50 border border-white/10 rounded-xl p-4 flex-row justify-between items-center"
              >
                {/* Rarity icon + info */}
                <View className="flex-row items-center gap-x-3 flex-1 pr-3">
                  <View
                    style={{ borderColor: rColor, backgroundColor: `${rColor}18` }}
                    className="w-11 h-11 border rounded-lg justify-center items-center"
                  >
                    <SystemText glowColor={rGlow} style={{ color: rColor }} className="text-sm font-bold font-mono">
                      {item.rarity}
                    </SystemText>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-x-2 flex-wrap">
                      <SystemText glow={false} className="text-white text-xs font-bold tracking-wide">
                        {item.name}
                      </SystemText>
                      {owned && !isActiveTheme && (
                        <View className="bg-emerald-500/15 border border-emerald-500/50 px-1.5 py-0.5 rounded">
                          <SystemText glow={false} className="text-emerald-400 text-5xs font-bold uppercase">OWNED</SystemText>
                        </View>
                      )}
                      {isActiveTheme && (
                        <View className="bg-amber-400/15 border border-amber-400/50 px-1.5 py-0.5 rounded">
                          <SystemText glow={false} className="text-amber-400 text-5xs font-bold uppercase">ACTIVE</SystemText>
                        </View>
                      )}
                    </View>
                    <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-wider mt-0.5">
                      {item.type.toUpperCase()}
                      {item.durationSeconds ? ` • ${Math.floor(item.durationSeconds / 60)} MIN` : ""}
                    </SystemText>
                    {/* Stat preview */}
                    {item.stats && (
                      <View className="flex-row flex-wrap gap-x-2 mt-1">
                        {Object.entries(item.stats).map(([k, v]) => (
                          <SystemText key={k} glow={false} className="text-emerald-400 text-5xs font-mono font-bold">
                            +{v} {k.substring(0, 3).toUpperCase()}
                          </SystemText>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Price */}
                <View className="items-end">
                  <SystemText
                    glowColor={canAfford ? "rgba(251, 191, 36, 0.8)" : undefined}
                    glow={canAfford}
                    className={`text-sm font-bold font-mono ${canAfford ? "text-amber-400" : "text-gray-600"}`}
                  >
                    {item.price}G
                  </SystemText>
                  <SystemText glow={false} className="text-gray-600 text-5xs mt-0.5">
                    ▶ INFO
                  </SystemText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Gold deduction flash */}
      <GoldFlashOverlay visible={flashVisible} amount={flashAmount} />

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <Pressable
            onPress={() => setSelectedItem(null)}
            style={styles.modalBg}
            className="flex-1 justify-center items-center bg-black/85 px-6"
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalCard, { shadowColor: RARITY_COLORS[selectedItem.rarity] ?? "#7000ff" }]}
              className="w-full bg-black/98 border border-white/15 rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Corner accents */}
              {["tl","tr","bl","br"].map((pos) => (
                <View
                  key={pos}
                  style={{ borderColor: RARITY_COLORS[selectedItem.rarity] }}
                  className={`absolute w-3 h-3
                    ${pos === "tl" ? "top-0 left-0 border-t-2 border-l-2" : ""}
                    ${pos === "tr" ? "top-0 right-0 border-t-2 border-r-2" : ""}
                    ${pos === "bl" ? "bottom-0 left-0 border-b-2 border-l-2" : ""}
                    ${pos === "br" ? "bottom-0 right-0 border-b-2 border-r-2" : ""}
                  `}
                />
              ))}

              {/* Header */}
              <View className="items-center mb-4 pb-3 border-b border-white/10">
                <View
                  style={{ borderColor: RARITY_COLORS[selectedItem.rarity], backgroundColor: `${RARITY_COLORS[selectedItem.rarity]}15` }}
                  className="w-12 h-12 rounded-xl border-2 items-center justify-center mb-3"
                >
                  <SystemText
                    glowColor={RARITY_GLOW[selectedItem.rarity]}
                    style={{ color: RARITY_COLORS[selectedItem.rarity] }}
                    className="text-base font-bold font-mono"
                  >
                    {selectedItem.rarity}
                  </SystemText>
                </View>
                <SystemText
                  glowColor={RARITY_GLOW[selectedItem.rarity]}
                  style={{ color: RARITY_COLORS[selectedItem.rarity] }}
                  className="text-sm font-extrabold font-mono tracking-widest text-center uppercase mb-1"
                >
                  {selectedItem.name}
                </SystemText>
                <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-widest font-mono text-center">
                  {selectedItem.rarity}-Rank • {selectedItem.type.toUpperCase()}
                  {selectedItem.durationSeconds ? ` • ${Math.floor(selectedItem.durationSeconds / 60)} MIN` : ""}
                </SystemText>
              </View>

              {/* Description */}
              <SystemText glow={false} className="text-gray-300 text-xs leading-5 mb-4 text-center">
                {selectedItem.description}
              </SystemText>

              {/* Stat bonuses */}
              {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                <View className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                  <SystemText glow={false} className="text-gray-400 text-4xs font-bold uppercase tracking-widest mb-2 text-center">
                    {selectedItem.type === "buff" ? "TEMPORARY STAT BOOST:" : "PASSIVE STAT BONUS:"}
                  </SystemText>
                  <View className="flex-row flex-wrap gap-x-4 gap-y-1 justify-center">
                    {Object.entries(selectedItem.stats).map(([k, v]) => (
                      <SystemText key={k} glow={false} className="text-emerald-400 text-xs font-mono font-bold">
                        +{v} {k.toUpperCase()}
                      </SystemText>
                    ))}
                  </View>
                </View>
              )}

              {/* Theme preview */}
              {selectedItem.type === "theme" && selectedItem.themeId && (
                <View
                  style={{ borderColor: THEME_COLORS[selectedItem.themeId]?.hex }}
                  className="bg-white/5 border rounded-xl p-3 mb-4 items-center"
                >
                  <SystemText glow={false} className="text-gray-400 text-4xs font-bold uppercase tracking-widest mb-2">
                    COSMETIC PREVIEW:
                  </SystemText>
                  <View
                    style={{ backgroundColor: `${THEME_COLORS[selectedItem.themeId]?.hex}15` }}
                    className="flex-row gap-x-2 items-center px-3 py-2 rounded-lg"
                  >
                    <View
                      style={{ backgroundColor: THEME_COLORS[selectedItem.themeId]?.hex, shadowColor: THEME_COLORS[selectedItem.themeId]?.hex }}
                      className="w-3 h-3 rounded-full shadow-lg"
                    />
                    <SystemText
                      glowColor={THEME_COLORS[selectedItem.themeId]?.glow}
                      style={{ color: THEME_COLORS[selectedItem.themeId]?.hex }}
                      className="text-xs font-bold font-mono uppercase"
                    >
                      {THEME_COLORS[selectedItem.themeId]?.label}
                    </SystemText>
                  </View>
                </View>
              )}

              {/* Price row */}
              <View className="bg-black/60 border border-amber-400/20 rounded-xl p-3 mb-4 flex-row justify-between items-center">
                <SystemText glow={false} className="text-gray-400 text-xs uppercase tracking-wider">Cost</SystemText>
                <View className="flex-row items-baseline gap-x-2">
                  <SystemText
                    glowColor="rgba(251, 191, 36, 0.8)"
                    className="text-amber-400 text-base font-bold font-mono"
                  >
                    {selectedItem.price}G
                  </SystemText>
                  <SystemText glow={false} className={`text-3xs font-mono ${gold >= selectedItem.price ? "text-emerald-500" : "text-red-500"}`}>
                    ({gold >= selectedItem.price ? `${gold - selectedItem.price}G left` : `${selectedItem.price - gold}G short`})
                  </SystemText>
                </View>
              </View>

              {/* Action buttons */}
              <View className="gap-y-2.5">
                {/* If it's a theme and already owned, show equip/active */}
                {selectedItem.type === "theme" && isOwned(selectedItem) ? (
                  currentTheme === selectedItem.themeId ? (
                    <View className="py-3 border border-amber-400/40 bg-amber-400/10 rounded-lg items-center">
                      <SystemText glowColor="rgba(251, 191, 36, 0.6)" className="text-amber-400 text-xs font-bold font-mono tracking-widest uppercase">
                        CURRENTLY ACTIVE
                      </SystemText>
                    </View>
                  ) : (
                    <SystemButton
                      variant="purple"
                      onPress={() => handleEquipTheme(selectedItem.themeId!)}
                      className="py-3 border-system-purple/60"
                    >
                      ACTIVATE PROTOCOL
                    </SystemButton>
                  )
                ) : !isOwned(selectedItem) ? (
                  <SystemButton
                    variant="purple"
                    active={gold >= selectedItem.price}
                    onPress={() => handleBuy(selectedItem)}
                    className={`py-3 ${gold >= selectedItem.price ? "border-amber-400/60 bg-amber-400/10" : "border-gray-700 bg-gray-900/50"}`}
                  >
                    {gold >= selectedItem.price
                      ? `PURCHASE — ${selectedItem.price}G`
                      : "INSUFFICIENT GOLD"}
                  </SystemButton>
                ) : (
                  <View className="py-3 border border-emerald-500/40 bg-emerald-500/10 rounded-lg items-center">
                    <SystemText glow={false} className="text-emerald-400 text-xs font-bold font-mono tracking-widest uppercase">
                      ALREADY OWNED
                    </SystemText>
                  </View>
                )}

                <SystemButton
                  variant="purple"
                  onPress={() => setSelectedItem(null)}
                  className="py-2.5 border-white/15 bg-transparent"
                >
                  DISMISS
                </SystemButton>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  goldCard: {
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  activeTab: {
    shadowColor: "#7000ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  inactiveTab: {},
  itemCard: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  modalBg: {
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalCard: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  goldFlash: {
    backgroundColor: "rgba(251, 191, 36, 0.08)",
  },
});
