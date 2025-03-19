const {nextui} = require("@nextui-org/theme");

const config = {
  content: [
    "./mdx-components.tsx", // Styles for blog posts
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(accordion|card|input|popover|select|spinner|divider|ripple|form|button|listbox|scroll-shadow).js",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'oumi-blue': '#085CFF',
        'oumi-blue-highlight': '#0a16ff',
        'oumi-light-button': '#DBE7FF',
        'oumi-light-button-hover': '#FFFFFF',
        'oumi-button-border': '#639cff',
        'oumi-blue-gradient-start': '#2e7bff',
        'oumi-blue-gradient-end': '#1265ff',
        'oumi-footer': '#8F8F8F',
      },
      fontFamily: {
        'inria': ['InriaSans', 'sans-serif', 'ui-sans-serif'],
        'crimsonpro': ['CrimsonPro', 'serif', 'ui-serif'],
        'orbitron': ['Orbitron', 'sans-serif', 'ui-sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  darkMode: "class",
  plugins: [require("tailwindcss-animate"), nextui()],
};
export default config;
