import { realpathSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const root = realpathSync.native(process.cwd())

export default defineConfig({
  root,
  plugins: [react()],
  server: {
    fs: {
      allow: [process.cwd(), root],
    },
  },
  test: {
    environment: 'jsdom',
    css: true,
  },
})
