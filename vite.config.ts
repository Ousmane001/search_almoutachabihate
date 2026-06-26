import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const certDir = path.resolve(__dirname, 'certs')
const hasCerts = fs.existsSync(path.join(certDir, 'cert.pem')) && fs.existsSync(path.join(certDir, 'key.pem'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
    https: hasCerts
      ? {
          cert: fs.readFileSync(path.join(certDir, 'cert.pem')),
          key: fs.readFileSync(path.join(certDir, 'key.pem')),
        }
      : undefined,
  },
})
