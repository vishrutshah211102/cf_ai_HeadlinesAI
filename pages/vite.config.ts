import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': {
        target: ' https://worker.vishrutshah211102.workers.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
