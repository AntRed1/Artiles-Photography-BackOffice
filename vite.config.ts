import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: '/backoffice/',
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: 'dist',
  },
});