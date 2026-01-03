import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#429de6",
        accent: "#da565b",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;


