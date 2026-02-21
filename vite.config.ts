import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  plugins: [
    react(),
    Icons({ compiler: 'jsx', jsx: 'react' })
  ],
  build: {
    rollupOptions: {
      input: 'app.html',
    },
  },
  server: {
    open: '/app.html',
  },
})
