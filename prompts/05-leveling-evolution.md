Read AGENT.md first and follow it strictly.

Implement the "Self-Evolution" logic. As the user levels up, the app should "unlock" or "update" its own capabilities:
- Level 5: Unlock "Job Change" (Specialization selection).
- Level 10: The app theme shifts from "Blue Glow" to "Shadow Purple" and unlocks the "Shadow Storage" (Inventory).

When a level-up occurs, display a full-screen "SYSTEM UPDATE" notification with a progress bar and a list of new features added. Use `react-native-reanimated` to create a glitch/static effect during the transition.
