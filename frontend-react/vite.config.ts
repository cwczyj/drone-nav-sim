import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  resolve: {
    alias: [
      {
        find: /^leaflet-draw$/,
        replacement: path.resolve(__dirname, './src/shims/leaflet-draw.ts')
      }
    ]
  }
})
