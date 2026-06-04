// import type { Config } from "tailwindcss";

// const config: Config = {
//   darkMode: "class",
//   content: [
//     "./app/**/*.{ts,tsx}",
//     "./components/**/*.{ts,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

// export default config;



import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)"],
      },
    },
  },

  plugins: [],
};

export default config;