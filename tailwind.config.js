/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // New color palette for a comfortable dark mode
      colors: {
        'background': '#121212',      // Near-black background
        'surface': '#1e1e1e',        // Slightly lighter surface for elements
        'primary-text': '#e0e0e0',    // Soft off-white for text
        'secondary-text': '#a0a0a0',  // Gray for placeholders and less important text
        'accent': '#d4af37',          // Gold accent
        'accent-hover': '#e7c35a',    // Lighter gold for hover
        'messenger-blue': '#0084ff',  // Facebook Messenger blue for user chat
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        // Playfair Display is our new, elegant serif font
        'serif': ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
