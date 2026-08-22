import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: 'index.html'
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
