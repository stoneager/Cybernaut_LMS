import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@admin': path.resolve(__dirname, './src/apps/admin'),
      '@student': path.resolve(__dirname, './src/apps/student'),
      '@superadmin': path.resolve(__dirname, './src/apps/superadmin'),
    },
  },
  server: {
    port: 5173, // or any port you want
  },
});
