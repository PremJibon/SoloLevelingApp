import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Configure notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
      shouldShowList: true,
  }),
});

/**
 * Hook to schedule daily reminders for quest completion.
 * Sends a notification at a configurable time each day.
 */
export function useNotifications() {
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (scheduledRef.current) return;
    scheduledRef.current = true;

    setupNotifications();
  }, []);
}

async function setupNotifications() {
  try {
    // 1. Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[NOTIF] Permission not granted for notifications");
      return;
    }

    // 2. Android: create notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-quests", {
        name: "Daily Quests",
        description: "Reminders to complete your daily training quests",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00e5ff",
      });

      await Notifications.setNotificationChannelAsync("system-events", {
        name: "System Events",
        description: "Level-ups, penalties, and system notifications",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 100, 250],
        lightColor: "#7000ff",
      });
    }

    // 3. Schedule daily quest reminder at 8:00 PM (or custom time)
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const alreadyScheduled = scheduledNotifications.some(
      (n) => n.identifier === "daily-quest-reminder"
    );

    if (!alreadyScheduled) {
      await Notifications.scheduleNotificationAsync({
        identifier: "daily-quest-reminder",
        content: {
          title: "⚠️ Daily Quest Reminder",
          body: "Your daily training routines are still incomplete. The System awaits your discipline.",
          sound: true,
          data: { screen: "quests" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20, // 8:00 PM
          minute: 0,
        },
      });
      console.log("[NOTIF] Daily quest reminder scheduled for 8:00 PM");
    }

    // 4. Schedule morning motivation at 7:00 AM
    const morningScheduled = scheduledNotifications.some(
      (n) => n.identifier === "daily-morning-motivation"
    );

    if (!morningScheduled) {
      await Notifications.scheduleNotificationAsync({
        identifier: "daily-morning-motivation",
        content: {
          title: "☀️ New Day, New Quests",
          body: "Rise and train. The System has refreshed your daily missions.",
          sound: true,
          data: { screen: "index" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 7,
          minute: 0,
        },
      });
      console.log("[NOTIF] Morning motivation scheduled for 7:00 AM");
    }

    // 5. Handle notification response (user taps on notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        console.log(`[NOTIF] User tapped notification for screen: ${data.screen}`);
        // In a real app, navigate to the specific screen via expo-router
      }
    });
  } catch (error) {
    console.warn("[NOTIF] Setup error:", error);
  }
}

/**
 * Send an immediate system notification (for level-ups, penalties, etc.)
 */
export async function sendSystemNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  } catch (error) {
    console.warn("[NOTIF] Could not send system notification:", error);
  }
}
