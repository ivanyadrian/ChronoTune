import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {     // Elérhetővé teszi a helyi hálózaton (pl. telefonról WiFi-n)
    host: true, 
  },
})
