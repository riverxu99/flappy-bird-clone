/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      include: ['game/Bird.ts', 'game/Pipe.ts', 'store/useGameStore.ts'],
      thresholds: { lines: 80 },
    },
  },
})
