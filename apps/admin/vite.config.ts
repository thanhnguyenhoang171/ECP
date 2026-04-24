import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    compression({ algorithm: 'gzip' })
  ],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 300, // Cảnh báo sớm hơn để kiểm soát chunk size
    cssCodeSplit: true, // Tách CSS theo route
    target: 'es2022', // Target modern browsers → smaller output
    rollupOptions: {
      output: {
        // Tối ưu: tách vendor thành nhiều chunk nhỏ hơn
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Icons tách riêng → lazy load khi cần
            if (id.includes('@ant-design/icons')) {
              return 'vendor-icons';
            }
            // Antd core UI components (nặng nhất)
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'vendor-antd';
            }
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Data fetching layer
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            // Tất cả vendor khác
            return 'vendor';
          }
        }
      }
    }
  }
})