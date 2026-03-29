import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses, including LAN and public IPs
    port: 5173, // Try to stick to 5173
    strictPort: false,
    hmr: {
      host: 'localhost',
    },
  },
})
