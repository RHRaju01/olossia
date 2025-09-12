import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa'; // Temporarily disabled due to Vite 6 compatibility
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react({
        jsxImportSource: undefined,
        jsxRuntime: 'automatic',
        fastRefresh: isDevelopment,
        babel: {
          plugins: isDevelopment ? [] : [],
        },
      }),
      // PWA plugin temporarily disabled due to Vite 6 compatibility issues
      // Will be re-enabled when vite-plugin-pwa supports Vite 6
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/constants': path.resolve(__dirname, './src/constants'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/contexts': path.resolve(__dirname, './src/contexts'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/layouts': path.resolve(__dirname, './src/layouts'),
        '@/assets': path.resolve(__dirname, './src/assets'),
        '@/config': path.resolve(__dirname, './src/config'),
      },
    },
    server: {
      port: 5173,
      host: true,
      open: !env.CI,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: isProduction,
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      cssMinify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            utils: ['axios', 'date-fns', 'clsx'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        '@supabase/supabase-js',
        'framer-motion',
        'lucide-react',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: 'camelCase',
      },
    },
    esbuild: {
      target: 'es2020',
      jsxInject: `import React from 'react'`,
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: true,
    },
  };
});
