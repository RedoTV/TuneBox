import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: '3434'
  },
  build: {
    outDir: '../wwwroot', // указывает сборку в wwwroot
    assetsDir: 'assets' // указывает на поддиректорию assets
  },
  base: '/' // установите base для правильных ссылок
})
