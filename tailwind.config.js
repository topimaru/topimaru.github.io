module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      strokeWidth: { 3: "3px" },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
