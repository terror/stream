import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    root: './client',
    base: mode === 'production' ? '/assets' : '/',
    plugins: [react()],
    build: { assetsDir: '.' },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8080/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
});
