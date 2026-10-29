import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages base URL: /backgammon/ in production, / in dev
  base: process.env.NODE_ENV === 'production' ? '/backgammon/' : '/',
});
