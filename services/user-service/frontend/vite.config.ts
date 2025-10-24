import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'UserManagement',
      fileName: 'user-management',
      formats: ['es'],
    },
    rollupOptions: {
      // Externalize dependencies that should not be bundled
      external: [],
    },
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3001,
    host: true,
    cors: true,
  },
});
