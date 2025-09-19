// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#06b6d4",       // cyan-ish
        secondary: "#d1d5db",     // light gray
        darkBg: "#f8fafc",        // lighter background
        lightPanel: "#e5e7eb",    // light panel for cards
        errorRed: "#ef4444",
        successGreen: "#10b981",
        warningYellow: "#f59e0b",
      },
    },
  },
  plugins: [],
};
