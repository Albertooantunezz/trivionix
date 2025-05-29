import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
   build: {
    cssCodeSplit: true, // asegura que el CSS salga como archivo separado
  },
  plugins: [react()],
})
