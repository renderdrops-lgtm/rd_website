import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Load files from the site root so nested pages like /admin/dashboard work.
  // The GitHub Pages copy lives in a sub-folder, so it keeps relative paths.
  base: process.env.GITHUB_ACTIONS ? './' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
