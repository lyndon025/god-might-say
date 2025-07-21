import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is the new, robust path configuration.
  // It tells Vite that '@' is a shortcut for the 'src' folder.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
