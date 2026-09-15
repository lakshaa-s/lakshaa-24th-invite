import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' keeps asset paths relative, so the build works on Vercel,
// Netlify and GitHub Pages sub-paths without changes.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // The 3D scene is lazy-loaded in its own chunk, so its size is expected.
  build: { chunkSizeWarningLimit: 1100 },
});
