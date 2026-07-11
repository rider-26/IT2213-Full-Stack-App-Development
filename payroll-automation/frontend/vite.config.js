import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxies any /api/... request from the frontend to the backend on port
// 5000, so the React code can just call fetch('/api/...') without worrying
// about the full backend URL or CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
