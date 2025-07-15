// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,      
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
    // Adicionar watch polling pode ser útil para Hot Module Reloading (HMR) em alguns setups Docker (especialmente WSL2 no Windows)
    watch: {
      usePolling: true,
    }
  },
});