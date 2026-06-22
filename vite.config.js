import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, cpSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-landing',
      closeBundle() {
        const src = resolve(__dirname, 'landing');
        const dst = resolve(__dirname, 'dist', 'landing');
        if (!existsSync(src)) return;
        if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
        cpSync(src, dst, { recursive: true, force: true });
        console.log('✓ landing/ copied to dist/landing');
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
