Read AGENT.md first and follow it strictly.

Implement the "Status Window" global state using Zustand. Create a `useSystemStore` that manages:
- User Stats: Strength, Agility, Sense, Intelligence, Vitality (Initial value: 10).
- Level: Initial level 1.
- XP: Current XP and XP required for next level.
- Stat Points: Points available to distribute.

Create a `/status` screen that displays these stats in a list with "+" buttons next to each stat (visible only if Stat Points > 0). Persist the entire store using `zustand/middleware` and `AsyncStorage`.
