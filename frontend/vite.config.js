import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['motion/react'],
          'vendor-swiper': ['swiper', 'swiper/react'],
          'vendor-icons': ['react-icons', 'lucide-react'],
          'vendor-axios': ['axios'],
          'vendor-toast': ['react-toastify'],
          'vendor-socket': ['socket.io-client'],
        }
      }
    }
  }
})
