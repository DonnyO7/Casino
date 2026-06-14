import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative asset paths in the production build so the site works under any
// GitHub Pages project path (e.g. /Casino/) regardless of casing. HashRouter
// keeps all app routing in the URL hash, so relative paths are safe.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}))
