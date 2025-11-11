import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Ensures file changes are detected in WSL/Docker/Network drives
    watch: {
      usePolling: true,
      interval: 100, // ms
    },
    hmr: {
      // If accessing via a different host/port, set them here
      // host: 'localhost',
      // port: 5173,
      overlay: true,
    },
    host: true,      // allows access from LAN/WSL
    port: 5173,      // change if needed
    strictPort: true // fail instead of picking a random port
  },
  clearScreen: false, // keep logs visible
});
