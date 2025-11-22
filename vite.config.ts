// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        https: {
            key: './localhost.key',
            cert: './localhost.crt',
        },
        host: true,
        port: 5173,
        open: true
    }
})