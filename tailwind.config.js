/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DARK THEME
        'background': '#121212',
        'surface': '#1e1e1e',
        'primary-text': '#e0e0e0',
        'secondary-text': '#a0a0a0',
        'accent': '#d4af37',
        'accent-hover': '#e7c35a',
        'messenger-blue': '#0084ff',

        // LIGHT THEME (prefix with light-)
'light-background': '#f9f9f9',       // very soft gray (overall bg)
'light-surface': '#ffffff',          // white cards / bubbles
'light-header': '#f2f2f2',           // lighter than surface, soft navbar
'light-border': '#e0e0e0',           // subtle divider lines
'light-primary-text': '#1a1a1a',     // strong readable black
'light-secondary-text': '#666666',   // for placeholders
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
