import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `vite build` we serve from the GitHub Pages project path
// (https://<user>.github.io/casino/). Dev/preview stay at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/casino/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}))
