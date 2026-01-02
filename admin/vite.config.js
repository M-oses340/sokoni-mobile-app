import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    outDir: 'dist',       // Vercel serves this folder
    emptyOutDir: true     // clears old builds before building
  },
  base: '/'                // ensures proper routing for SPA
})
