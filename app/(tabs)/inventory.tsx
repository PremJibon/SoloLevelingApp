import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSystemStore, InventoryItem } from "../../store/useSystemStore";
import { SystemText } from "../../components/SystemText";
import { SystemButton } from "../../components/SystemButton";
import { SystemCard } from "../../components/SystemCard";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";

export default function InventoryScreen() {
  const { level, inventory, equippedWeaponId, useItem: consumeItem, equipWeapon } = useSystemStore();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Custom screen flash effect for potion usage
  const [showHealthFlash, setShowHealthFlash] = useState(false);
  const flashOpacity = useSharedValue(0);

  const handleUseItem = (item: InventoryItem) => {
    if (item.type === "potion") {
      // Trigger full screen green flash
      setShowHealthFlash(true);
      flashOpacity.value = withSequence(
        withTiming(0.6, { duration: 150 }),
        withTiming(0, { duration: 400 })
      );
      
      // Consume the item
      consumeItem(item.id);
      setSelectedItem(null);

      // Disable overlay after animation completes
      setTimeout(() => {
        setShowHealthFlash(false);
      }, 550);
    }
  };

  const handleEquipItem = (item: InventoryItem) => {
    if (item.type === "weapon") {
      equipWeapon(item.id);
      setSelectedItem(null);
    }
  };

  // Helper to color items by rarity
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "S": return "#7000ff"; // Purple
      case "A": return "#f97316"; // Orange
      case "B": return "#eab308"; // Yellow
      case "C": return "#3b82f6"; // Blue
      case "D": return "#10b981"; // Green
      default: return "#6b7280";  // Gray
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "S": return "rgba(112, 0, 255, 0.8)";
      case "A": return "rgba(249, 115, 22, 0.8)";
      case "B": return "rgba(234, 179, 8, 0.6)";
      case "C": return "rgba(59, 130, 246, 0.6)";
      case "D": return "rgba(16, 185, 129, 0.6)";
      default: return "rgba(107, 114, 128, 0.4)";
    }
  };

  const animatedFlashStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  const equippedWeapon = inventory.find((i) => i.id === equippedWeaponId && i.equipped);

  // 1. Render Locked State if Level < 10
  if (level < 10) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        <SystemCard variant="blue" delay={0} className="w-full max-w-[320px] p-6 items-center">
          {/* Lock Icon */}
          <View className="w-14 h-14 rounded-full border border-system-blue/40 bg-system-blue/5 justify-center items-center mb-4">
            <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue text-lg font-bold">
              🔒
            </SystemText>
          </View>
          
          <SystemText glowColor="rgba(0, 229, 255, 0.8)" className="text-system-blue font-bold font-mono text-base text-center mb-3">
            [ SHADOW STORAGE LOCKED ]
          </SystemText>
          
          <SystemText glow={false} className="text-system-purple/70 text-3xs font-mono uppercase tracking-widest text-center leading-4 mb-4">
            Secured by high-level system encryption. Unlock Shadow storage parameters upon reaching Level 10.
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

  // 2. Render Unlocked Inventory Screen (Level >= 10)
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Title Banner */}
        <SystemCard variant="purple" delay={0} className="mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xs font-bold uppercase tracking-widest">
              Dimensional Pocket
            </SystemText>
            <SystemText className="text-gray-500 text-3xs">SYSTEM SECURED</SystemText>
          </View>
          <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xl font-bold uppercase tracking-wider mb-3">
            Shadow Storage
          </SystemText>
          <SystemText glow={false} className="text-gray-400 text-2xs leading-4">
            Equip weapon artifacts and consume recovery drops earned via system integration tasks.
          </SystemText>
        </SystemCard>

        {/* Equipped Weapon Display */}
        <SystemCard variant="purple" delay={150} className="mb-6 border-system-purple/50 bg-purple-950/5">
          <SystemText glow={false} className="text-gray-500 text-3xs uppercase tracking-widest mb-2">
            Active Combat Armament
          </SystemText>
          {equippedWeapon ? (
            <View className="flex-row justify-between items-center bg-black/55 p-3 rounded-lg border border-system-purple/20">
              <View>
                <SystemText glowColor={getRarityGlow(equippedWeapon.rarity)} style={{ color: getRarityColor(equippedWeapon.rarity) }} className="text-xs font-bold font-mono">
                  {equippedWeapon.name}
                </SystemText>
                <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-wider mt-0.5">
                  Type: {equippedWeapon.type.toUpperCase()} • Rarity: {equippedWeapon.rarity}-Rank
                </SystemText>
              </View>
              <SystemButton
                variant="purple"
                onPress={() => equipWeapon(equippedWeapon.id)}
                className="py-1 px-3 border-system-purple/40 bg-system-purple/10"
              >
                UNEQUIP
              </SystemButton>
            </View>
          ) : (
            <View className="bg-black/40 p-4 rounded-lg border border-dashed border-white/10 items-center">
              <SystemText glow={false} className="text-gray-600 text-3xs font-mono uppercase tracking-widest">
                No active weapon equipped
              </SystemText>
            </View>
          )}
        </SystemCard>

        {/* Inventory Items List */}
        <SystemText glowColor="rgba(112, 0, 255, 0.8)" className="text-system-purple text-xs font-bold uppercase tracking-widest mb-4 pl-1">
          Inventory Items ({inventory.length})
        </SystemText>

        {inventory.length > 0 ? (
          <View className="gap-y-3">
            {inventory.map((item) => {
              const rColor = getRarityColor(item.rarity);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedItem(item)}
                  style={[
                    styles.itemRow,
                    item.equipped && { borderColor: "#7000ff", shadowColor: "#7000ff", shadowOpacity: 0.3 }
                  ]}
                  className="bg-black/50 border border-white/10 rounded-xl p-4 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center gap-x-3 flex-1 pr-4">
                    {/* Item Rarity Box Icon */}
                    <View style={{ borderColor: rColor, backgroundColor: `${rColor}15` }} className="w-10 h-10 border rounded-lg justify-center items-center">
                      <SystemText glowColor={getRarityGlow(item.rarity)} style={{ color: rColor }} className="text-sm font-bold font-mono">
                        {item.rarity}
                      </SystemText>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center gap-x-2">
                        <SystemText glow={false} className="text-white text-xs font-bold tracking-wider">
                          {item.name}
                        </SystemText>
                        {item.equipped && (
                          <View className="bg-system-purple/20 border border-system-purple/60 px-1.5 py-0.5 rounded">
                            <SystemText glowColor="rgba(112, 0, 255, 0.6)" className="text-system-purple text-5xs font-bold uppercase">EQUIPPED</SystemText>
                          </View>
                        )}
                      </View>
                      <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-wider mt-1">
                        {item.type.toUpperCase()} • Qty: {item.quantity}
                      </SystemText>
                    </View>
                  </View>

                  <SystemText glow={false} className="text-gray-500 text-xs">
                    ▶
                  </SystemText>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="bg-black/30 p-8 rounded-xl border border-dashed border-white/10 items-center justify-center">
            <SystemText glow={false} className="text-gray-600 text-xs font-mono uppercase tracking-wider mb-2">
              Storage Vault Empty
            </SystemText>
            <SystemText glow={false} className="text-gray-600 text-4xs text-center max-w-[200px] uppercase">
              Complete quests and claims daily to trigger loot deliveries.
            </SystemText>
          </View>
        )}

      </ScrollView>

      {/* Item Actions Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <Pressable onPress={() => setSelectedItem(null)} style={styles.modalBg} className="flex-1 justify-center items-center bg-black/80 px-6">
            <Pressable onPress={(e) => e.stopPropagation()} style={[styles.itemCard, { shadowColor: getRarityColor(selectedItem.rarity) }]} className="w-full border border-white/15 bg-black/95 rounded-2xl p-6 relative overflow-hidden">
              
              {/* Tech corner marks */}
              <View style={{ borderColor: getRarityColor(selectedItem.rarity) }} className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" />
              <View style={{ borderColor: getRarityColor(selectedItem.rarity) }} className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" />
              <View style={{ borderColor: getRarityColor(selectedItem.rarity) }} className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" />
              <View style={{ borderColor: getRarityColor(selectedItem.rarity) }} className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" />

              {/* Title Header */}
              <View className="items-center mb-5 pb-3 border-b border-white/10">
                <SystemText glowColor={getRarityGlow(selectedItem.rarity)} style={{ color: getRarityColor(selectedItem.rarity) }} className="text-base font-extrabold font-mono tracking-widest text-center uppercase mb-1">
                  {selectedItem.name}
                </SystemText>
                <SystemText glow={false} className="text-gray-500 text-4xs uppercase tracking-widest font-mono text-center">
                  Rarity: {selectedItem.rarity}-Rank • {selectedItem.type.toUpperCase()}
                </SystemText>
              </View>

              {/* Description */}
              <SystemText glow={false} className="text-gray-300 text-xs leading-5 mb-5 text-center px-2">
                {selectedItem.description}
              </SystemText>

              {/* Bonuses / Stat Details if exists */}
              {selectedItem.stats && (
                <View className="bg-white/5 border border-white/10 rounded-xl p-3 mb-5">
                  <SystemText glow={false} className="text-gray-400 text-4xs font-bold uppercase tracking-widest mb-1.5 text-center">
                    EQUIPMENT STAT MODIFIERS:
                  </SystemText>
                  <View className="gap-y-1 items-center">
                    {Object.entries(selectedItem.stats).map(([statName, val]) => (
                      <SystemText key={statName} glow={false} className="text-emerald-400 text-3xs font-mono uppercase">
                        + {String(val)} {statName.substring(0, 3)}
                      </SystemText>
                    ))}
                  </View>
                </View>
              )}

              {/* Actions Box */}
              <View className="gap-y-2.5">
                {selectedItem.type === "weapon" ? (
                  <SystemButton
                    variant="purple"
                    onPress={() => handleEquipItem(selectedItem)}
                    className="py-3 border-system-purple/60"
                  >
                    {selectedItem.equipped ? "UNEQUIP ARMAMENT" : "EQUIP ARMAMENT"}
                  </SystemButton>
                ) : selectedItem.type === "potion" ? (
                  <SystemButton
                    variant="purple"
                    onPress={() => handleUseItem(selectedItem)}
                    className="py-3 border-system-purple/60"
                  >
                    DRINK POTION (HP RECOVERY)
                  </SystemButton>
                ) : null}

                <SystemButton
                  variant="purple"
                  onPress={() => setSelectedItem(null)}
                  className="py-2.5 border-white/20 bg-transparent"
                >
                  DISMISS
                </SystemButton>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Screen green flash overlay for potion recovery */}
      {showHealthFlash && (
        <Animated.View
          style={[styles.flashOverlay, animatedFlashStyle]}
          className="absolute inset-0 bg-emerald-500 pointer-events-none z-[9999999]"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  modalBg: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  itemCard: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  flashOverlay: {
    width: "100%",
    height: "100%",
  },
});
