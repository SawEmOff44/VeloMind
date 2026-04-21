import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Let Vite handle vendor splitting automatically. A forced Recharts chunk
  // made unrelated routes depend on chart code and could blank the app at startup.
  preview: {
    port: 3000
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
