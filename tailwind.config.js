/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",  
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#44486C",
        background: "#D5E0E5",
        secondary: "#888BAA",
        accent: "#ADC0C8",

        surface: "#F4F7F8",
        card: "#FFFFFF",

        textPrimary: "#1F2937",
        textMuted: "#6B7280",
      },

      fontFamily: {
        koulen: ["Koulen"],
        hand: ["JustAnotherHand"],
      },
    },
  },

  plugins: [],
}