import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react-leaflet') || id.includes('/leaflet/')) {
            return 'leaflet'
          }

          if (id.includes('/recharts/')) {
            return 'charts'
          }

          if (
            id.includes('/react-router/') ||
            id.includes('/react-router-dom/') ||
            id.includes('/react-dom/') ||
            id.includes('/react/')
          ) {
            return 'react-vendor'
          }

          if (id.includes('/date-fns/')) {
            return 'date-fns'
          }

          return 'vendor'
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
