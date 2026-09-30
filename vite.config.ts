import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relatywna ścieżka bazowa — aplikacja działa pod dowolnym adresem GitHub Pages
  // (np. https://<użytkownik>.github.io/<repozytorium>/) bez dodatkowej konfiguracji.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
})
