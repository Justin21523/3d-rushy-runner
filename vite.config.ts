import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite Configuration optimized for WebGL and 3D asset handling.
 * Includes manual chunking to prevent massive initial bundle sizes 
 * when loading Three.js and Postprocessing libraries.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three_core: ['three'],
          r3f_ecosystem: ['@react-three/fiber', '@react-three/drei'],
          postprocessing_fx: ['@react-three/postprocessing', 'postprocessing'],
          state_management: ['zustand'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
    },
  },
});