import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  build: command === 'build' ? {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'CloudStorageDashboard',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.umd.cjs'
    },
    rollupOptions: {
      external: ['svelte', 'svelte/internal'],
      output: {
        globals: {
          svelte: 'Svelte'
        }
      }
    }
  } : {},
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
}));
