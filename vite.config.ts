import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api/transactions': {
        target: 'https://www.espn.com',
        changeOrigin: true,
        rewrite: (path) => '/nhl/transactions'
      },
      '/api/injuries': {
        target: 'https://www.espn.com',
        changeOrigin: true,
        rewrite: (path) => '/nhl/injuries'
      }
    }
  }
})
