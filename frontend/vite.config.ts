/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup/setup.ts',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}', 'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    typecheck: {
      include: ['tests/**/*.{test,spec}.{ts,tsx}']
    }
  },
})
