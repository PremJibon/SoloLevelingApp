module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    'node_modules/(?!(jest-expo|expo|@expo|react-native|react-native-.*|@react-native|@react-native-.*|zustand|nativewind|react-native-web|@react-native-async-storage|expo-modules-core|react-native-worklets|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens)/)',
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
