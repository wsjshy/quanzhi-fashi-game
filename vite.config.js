import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: 'index.html',
            output: {
                // 构建为IIFE格式，不使用ES Modules，使index.html可以在file://协议下直接双击打开
                format: 'iife',
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        }
    },
    server: {
        port: 5173,
        open: true
    },
    resolve: {
        alias: {
            '@': '/src',
            '@data': '/src/data',
            '@engine': '/src/engine'
        }
    }
});
