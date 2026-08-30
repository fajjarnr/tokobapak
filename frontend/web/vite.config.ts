import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), tailwindcss(), react(), tsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      '/api/v1/products': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/api/v1/payments': { target: 'http://localhost:3005', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/api/v1/orders': { target: 'http://localhost:3004', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/api/v1/cart': { target: 'http://localhost:3003', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/api/v1/shipping': { target: 'http://localhost:3008', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      '/v1/products': { target: 'http://localhost:3001', changeOrigin: true },
      '/v1/payments': { target: 'http://localhost:3005', changeOrigin: true },
      '/v1/orders': { target: 'http://localhost:3004', changeOrigin: true },
      '/v1/cart': { target: 'http://localhost:3003', changeOrigin: true },
      '/v1/shipping': { target: 'http://localhost:3008', changeOrigin: true },
    },
  },
  preview: { port: 3000 },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'next/image': path.resolve(__dirname, './src/shims/next-image.tsx'),
      'next/font/google': path.resolve(__dirname, './src/shims/next-font.ts'),
      'next-auth': path.resolve(__dirname, './src/shims/next-auth.ts'),
      'next/link': path.resolve(__dirname, './src/shims/next-link.tsx'),
    },
  },
  build: { outDir: 'dist' },
})
