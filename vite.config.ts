import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: './client',
  plugins: [react()],
  build: { assetsDir: '.' },
  server: {
    proxy: {
      '/': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
