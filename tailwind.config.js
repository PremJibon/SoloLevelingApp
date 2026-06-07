/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        system: {
          blue: "#00e5ff",
          purple: "#7000ff",
          dark: "#0a0a0a",
        },
      },
      fontFamily: {
        system: ["SpaceMono-Regular", "monospace"],
      },
      fontSize: {
        // Custom micro sizes used throughout the app (Android legibility tuned)
        "5xs": ["8px",  { lineHeight: "12px" }],
        "4xs": ["9px",  { lineHeight: "13px" }],
        "3xs": ["10px", { lineHeight: "14px" }],
        "2xs": ["11px", { lineHeight: "15px" }],
      },
    },
  },
  plugins: [],
};
