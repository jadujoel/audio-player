import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
    server: { https: true },
    base: '/audio-player/',
    plugins: [mkcert(), react()],
    optimizeDeps: {
        include: ['player'],
    },
    build: {
        commonjsOptions: {
            include: [/player/, /node_modules/],
        }
    },
})
