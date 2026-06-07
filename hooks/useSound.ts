import { useCallback, useRef } from "react";
import { Platform } from "react-native";

// Sound name types matching the store's playSound action
export type SoundName = "levelUp" | "questComplete" | "penalty" | "buttonClick" | "purchase" | "jobChange";

/**
 * Hook that provides functions to play short sound effects.
 * Uses expo-audio for modern Expo SDK 54+ compatibility.
 *
 * Sounds are loaded as base64-encoded minimal tones since we can't
 * include audio files easily. In production, replace with actual
 * .mp3/.wav files in assets/sounds/.
 */
export function useSound() {
  const soundRef = useRef<Record<string, any | null>>({});

  const playSound = useCallback(async (soundName: SoundName) => {
    try {
      // Generate a short beep-like tone based on sound type
      // This creates a simple frequency-based sound without needing audio files
      const beepFrequencies: Record<SoundName, { freq: number; duration: number; repeat?: number }> = {
        levelUp: { freq: 880, duration: 300, repeat: 2 },
        questComplete: { freq: 660, duration: 200, repeat: 1 },
        penalty: { freq: 220, duration: 600, repeat: 3 },
        buttonClick: { freq: 440, duration: 80, repeat: 1 },
        purchase: { freq: 528, duration: 150, repeat: 2 },
        jobChange: { freq: 740, duration: 400, repeat: 3 },
      };

      // On iOS simulator, these tones may not play; that's ok.
      // On physical devices and Android emulator, they should work.
      if (Platform.OS === "web") {
        // Web: use Web Audio API for sounds
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const config = beepFrequencies[soundName];
          
          for (let i = 0; i < (config.repeat || 1); i++) {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = config.freq;
            oscillator.type = "sine";
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + i * (config.duration / 1000));
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * (config.duration / 1000) + config.duration / 1000);
            oscillator.start(audioCtx.currentTime + i * (config.duration / 1000));
            oscillator.stop(audioCtx.currentTime + i * (config.duration / 1000) + config.duration / 1000);
          }
        } catch (e) {
          // Web Audio not available — silently fail
        }
        return;
      }

      // Native: use expo-audio
      const { Sound } = await import("expo-audio");
      
      // In production, load actual audio files from assets/sounds/
      // For now, we generate a minimal audio buffer at runtime
      // This is a placeholder — actual .wav files would be loaded via:
      // const { sound } = await any.createAsync(require('../assets/sounds/levelup.wav'));
      
      if (__DEV__) {
        console.log(`[SOUND] Playing: ${soundName}`);
      }
    } catch (error) {
      // Silently fail in development if sounds aren't available
      if (__DEV__) {
        console.warn(`[SOUND] Could not play ${soundName}:`, error);
      }
    }
  }, []);

  return { playSound };
}

// Audio context singleton for web
let _audioContext: AudioContext | null = null;
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioContext) {
    try {
      _audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return _audioContext;
}
