import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En temiz ve standart konfigürasyon
export default defineConfig({
  plugins: [react()],
})