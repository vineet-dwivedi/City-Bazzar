import { realpathSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = realpathSync.native(process.cwd())

// https://vite.dev/config/
export default defineConfig({
  root,
  plugins: [react()],
})
