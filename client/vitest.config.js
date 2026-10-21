import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Configuracion de Vitest para las pruebas del frontend de Stark Technology.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    // Los renders con Motion + fetch mockeado necesitan mas margen que el default.
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
