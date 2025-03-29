import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: process.env.PORT || 5173,
    host: true,
    allowedHosts: ['clonex-trend-app.railway.internal', 'healthcheck.railway.app', 'talented-miracle-production.up.railway.app', 'clonex-trend-app-production.up.railway.app']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
