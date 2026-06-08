import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build is portable: works opened as a file and
  // hosted in a subpath / iframe (e.g. itch.io), not just from a server root.
  base: './',
  plugins: [react()],
})
