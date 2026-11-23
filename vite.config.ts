import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages hosts under /SABKAAM/; standalone previews use the domain root.
  base: mode === 'railway' ? '/' : '/SABKAAM/',
}))
