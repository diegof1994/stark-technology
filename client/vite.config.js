import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Configuracion de Vite para el frontend de Stark Technology.
 * - React con Fast Refresh
 * - Tailwind CSS v4 via plugin nativo de Vite
 * - Alias @/ -> src/ para imports limpios
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
    },
  },
  server: {
    port: 5173,
    // Proxy hacia el backend para desarrollo sin CORS
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
});
