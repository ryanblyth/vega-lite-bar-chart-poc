import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.html'
    }
  },
  server: {
    port: 5173
  },
  publicDir: 'public',
  assetsInclude: ['**/*.geojson', '**/*.json']
});
